"""Generate coupled CO2 and leaf-energy response grids from an OBJ.

CARIBU calculates diffuse light interception per OBJ leaf.  Leaf identity is
preferentially taken from OBJ groups/objects named ``leaf_*``.  Older OBJ files
that identify leaves only with ``usemtl leaf_green`` remain supported through a
connected-component fallback.

``plantecophys::Photosyn`` and ``FindTleaf`` solve the same coupled leaf gas
exchange and Penman--Monteith energy balance used by ``PhotosynEB``.  The
fixed point is verified explicitly because the package's convenience wrapper
can return a non-converged temperature for low-airflow indoor conditions.
The generated grid contains net CO2 exchange, transpiration and the complete
leaf energy-balance fluxes for every environmental grid point.  The runtime
uses the latent and convective fluxes as explicit EnergyPlus zone loads; the
radiative terms remain available for diagnostics and balance verification.
"""

from __future__ import annotations

import json
import math
import os
import sys
import time
from concurrent.futures import ProcessPoolExecutor, as_completed
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Callable


Vec3 = tuple[float, float, float]
Triangle = tuple[int, int, int]
LeafTriangles = dict[str, list[int]]
PROJECT_R_LIBRARY = Path(__file__).resolve().parents[3] / "data" / "r-library"
_WORKER_R_SESSION: Any | None = None
# Technical reference used inside plantecophys' equations. It is not an
# environmental input: neither weather pressure nor a grid axis may alter an
# indoor living-wall response.
REFERENCE_PRESSURE_KPA = 100.0


@dataclass(frozen=True, slots=True)
class GridAxis:
    minimum: float
    maximum: float
    step: float

    def values(self) -> tuple[float, ...]:
        if self.step <= 0 or self.maximum < self.minimum:
            raise ValueError("Invalid response-grid axis")
        count = round((self.maximum - self.minimum) / self.step)
        return tuple(
            round(self.minimum + index * self.step, 10)
            for index in range(count + 1)
        )


@dataclass(frozen=True, slots=True)
class PlantGridConfig:
    co2_ppm: GridAxis
    temperature_c: GridAxis
    relative_humidity_percent: GridAxis
    ppfd_umol_m2_s: tuple[float, ...]

    def point_count(self) -> int:
        """Return the number of environmental states in this grid."""
        return (
            len(self.ppfd_umol_m2_s)
            * len(self.temperature_c.values())
            * len(self.relative_humidity_percent.values())
            * len(self.co2_ppm.values())
        )


DEFAULT_GRID_CONFIG = PlantGridConfig(
    co2_ppm=GridAxis(300.0, 1000.0, 50.0),
    temperature_c=GridAxis(15.0, 35.0, 2.5),
    relative_humidity_percent=GridAxis(20.0, 90.0, 10.0),
    ppfd_umol_m2_s=(0.0, 50.0, 100.0, 200.0, 300.0),
)

# This is intentionally a *case-study* validation grid. It contains the
# thermostat-controlled indoor range of the first DCV 700 living-wall
# experiment, its three selectable lighting states and its exact CO2 setpoint.
# It must not be used as the final all-climate production profile: a runtime
# value outside this envelope is clamped, and such coverage must be reported
# before drawing general conclusions.
DIAGNOSTIC_GRID_CONFIG = PlantGridConfig(
    co2_ppm=GridAxis(400.0, 1000.0, 300.0),
    temperature_c=GridAxis(20.0, 26.0, 3.0),
    relative_humidity_percent=GridAxis(30.0, 70.0, 20.0),
    ppfd_umol_m2_s=(0.0, 200.0, 300.0),
)

# Production profile for the CozyBench indoor living-wall scenarios.
#
# The remaining axes cover the observed annual range of every currently
# eligible zone (including the cold TZ7 zones) without runtime clamping.
# Pressure is deliberately absent; equations use REFERENCE_PRESSURE_KPA.
PRODUCTION_GRID_CONFIG = PlantGridConfig(
    co2_ppm=GridAxis(300.0, 1000.0, 100.0),
    temperature_c=GridAxis(5.0, 35.0, 2.5),
    relative_humidity_percent=GridAxis(20.0, 100.0, 10.0),
    ppfd_umol_m2_s=(0.0, 50.0, 100.0, 200.0, 300.0),
)

GRID_CONFIGS: dict[str, PlantGridConfig] = {
    "standard": DEFAULT_GRID_CONFIG,
    "diagnostic": DIAGNOSTIC_GRID_CONFIG,
    "production": PRODUCTION_GRID_CONFIG,
}


def get_grid_config(name: str) -> PlantGridConfig:
    """Return an explicitly named grid configuration.

    Keeping the preset name at the API boundary prevents a fast diagnostic
    grid from being mistaken for the full-resolution scientific profile.
    """
    try:
        return GRID_CONFIGS[name]
    except KeyError as error:
        supported = ", ".join(sorted(GRID_CONFIGS))
        raise ValueError(
            f"Unknown plant grid preset '{name}'. Supported presets: {supported}"
        ) from error


@dataclass(frozen=True, slots=True)
class PlantParameters:
    """Species-specific optical, photosynthetic and leaf-energy inputs."""

    reflectance: float
    transmittance: float
    vcmax: float
    jmax: float
    rd: float
    leaf_width_m: float = 0.05
    wind_speed_m_s: float = 0.2
    stomatal_ratio: float = 1.0
    leaf_absorptance: float = 0.86

    def validate(self) -> None:
        if not all(math.isfinite(value) for value in asdict(self).values()):
            raise ValueError("Plant parameters must be finite")
        if not 0 <= self.reflectance < 1 or not 0 <= self.transmittance < 1:
            raise ValueError("Reflectance and transmittance must be between 0 and 1")
        if self.reflectance + self.transmittance >= 1:
            raise ValueError("Reflectance plus transmittance must be less than 1")
        if self.vcmax <= 0 or self.jmax <= 0 or self.rd < 0:
            raise ValueError("Vcmax/Jmax must be positive and Rd must be non-negative")
        if self.leaf_width_m <= 0 or self.wind_speed_m_s < 0:
            raise ValueError("Leaf width must be positive and wind speed cannot be negative")
        if not 0 < self.stomatal_ratio <= 2:
            raise ValueError("Stomatal ratio must be between 0 and 2")
        if not 0 < self.leaf_absorptance <= 1:
            raise ValueError("Leaf absorptance must be between 0 and 1")


@dataclass(frozen=True, slots=True)
class PlantSweepProgress:
    completed_profiles: int
    total_profiles: int
    percentage: float
    elapsed_seconds: float
    estimated_remaining_seconds: float
    ppfd_umol_m2_s: float
    temperature_c: float


ProgressCallback = Callable[[PlantSweepProgress], None]


# ---------------------------------------------------------------------------
# OBJ normalisation and geometry extraction
# These functions turn a user-uploaded OBJ into explicit leaf triangles.  The
# plant grid uses leaves only; stems are retained only in the preview model.
# ---------------------------------------------------------------------------


def write_standard_mtl(path: Path) -> None:
    path.write_text(
        "\n".join(
            (
                "newmtl leaf_green",
                "Ka 0.04 0.16 0.04",
                "Kd 0.14 0.55 0.16",
                "Ks 0.06 0.08 0.06",
                "Ns 18",
                "d 1.0",
                "illum 2",
                "",
                "newmtl stem_green",
                "Ka 0.04 0.10 0.02",
                "Kd 0.28 0.40 0.10",
                "Ks 0.03 0.03 0.03",
                "Ns 8",
                "d 1.0",
                "illum 2",
                "",
            )
        ),
        encoding="utf-8",
    )


def _semantic_material(name: str) -> str | None:
    """Map a semantic OBJ group/object name to CozyBench's preview material."""
    lowered = name.lower()
    if lowered.startswith("leaf_"):
        return "leaf_green"
    if lowered.startswith("stem_"):
        return "stem_green"
    return None


def _record_name(fields: list[str]) -> str:
    """Return the first OBJ object/group name, or an empty string."""
    return fields[1] if len(fields) > 1 else ""


def normalise_obj_with_standard_mtl(
    source: Path,
    output: Path,
    mtl_filename: str,
) -> None:
    """Store a previewable OBJ with CozyBench's fixed leaf/stem materials.

    OBJ files produced by the plant exporter identify leaves with groups such as
    ``g leaf_0001``.  They do not need to contain ``usemtl`` records already.
    When semantic leaf/stem groups are present, this function assigns the
    standard preview material automatically.  Older material-tagged OBJs are
    preserved as a fallback.
    """
    raw_lines = source.read_text(encoding="utf-8", errors="strict").splitlines()

    has_semantic_groups = False
    for raw_line in raw_lines:
        fields = raw_line.strip().split()
        if fields and fields[0] in {"g", "o"}:
            if _semantic_material(_record_name(fields)) is not None:
                has_semantic_groups = True
                break

    has_leaf_material = any(
        raw_line.strip() == "usemtl leaf_green" for raw_line in raw_lines
    )
    if not has_semantic_groups and not has_leaf_material:
        raise ValueError(
            "OBJ must identify leaves with 'g leaf_*'/'o leaf_*' or "
            "'usemtl leaf_green'"
        )

    lines: list[str] = [f"mtllib {mtl_filename}"]

    if has_semantic_groups:
        # Existing MTL assignments are replaced so preview colours are
        # deterministic and independent of the source exporter.
        for raw_line in raw_lines:
            stripped = raw_line.lstrip()
            if stripped.startswith("mtllib ") or stripped.startswith("usemtl "):
                continue

            lines.append(raw_line)
            fields = raw_line.strip().split()
            if fields and fields[0] in {"g", "o"}:
                material = _semantic_material(_record_name(fields))
                if material is not None:
                    lines.append(f"usemtl {material}")
    else:
        # Backward compatibility for older OBJs that already use leaf_green.
        lines.extend(
            raw_line
            for raw_line in raw_lines
            if not raw_line.lstrip().startswith("mtllib ")
        )

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(lines) + "\n", encoding="utf-8")


def _parse_obj_vertex_index(
    value: str,
    vertex_count: int,
    line_number: int,
) -> int:
    """Resolve a Wavefront OBJ vertex reference to a zero-based index."""
    raw_index = value.split("/", 1)[0]
    try:
        index = int(raw_index)
    except ValueError as error:
        raise ValueError(f"Invalid OBJ face index at line {line_number}") from error

    if index == 0:
        raise ValueError(f"OBJ face index cannot be zero at line {line_number}")

    resolved = index - 1 if index > 0 else vertex_count + index
    if not 0 <= resolved < vertex_count:
        raise ValueError(f"Invalid OBJ face at line {line_number}")
    return resolved


def _parse_leaf_triangles(
    path: Path,
) -> tuple[list[Vec3], list[Triangle], LeafTriangles]:
    """Parse leaf geometry while preserving ``leaf_*`` group identity.

    Semantic groups/objects named ``leaf_*`` take precedence.  If an older OBJ
    has no such groups, faces tagged with ``usemtl leaf_green`` are accepted and
    split into connected components to retain the previous behaviour.
    """
    raw_lines = path.read_text(encoding="utf-8", errors="strict").splitlines()

    has_leaf_groups = any(
        fields
        and fields[0] in {"g", "o"}
        and _record_name(fields).lower().startswith("leaf_")
        for fields in (line.strip().split() for line in raw_lines)
    )

    vertices: list[Vec3] = []
    faces: list[Triangle] = []
    leaf_triangles: LeafTriangles = {}
    active_leaf: str | None = None
    active_material = ""
    seen: set[tuple[int, int, int]] = set()

    for line_number, line in enumerate(raw_lines, 1):
        fields = line.strip().split()
        if not fields or fields[0].startswith("#"):
            continue

        keyword = fields[0]

        if keyword == "v":
            if len(fields) < 4:
                raise ValueError(f"Invalid OBJ vertex at line {line_number}")
            try:
                vertices.append(
                    (float(fields[1]), float(fields[2]), float(fields[3]))
                )
            except ValueError as error:
                raise ValueError(
                    f"Invalid OBJ vertex coordinate at line {line_number}"
                ) from error
            continue

        if keyword in {"g", "o"}:
            name = _record_name(fields)
            active_leaf = name if name.lower().startswith("leaf_") else None
            continue

        if keyword == "usemtl":
            active_material = fields[1] if len(fields) > 1 else ""
            continue

        if keyword != "f":
            continue

        is_leaf_face = (
            active_leaf is not None
            if has_leaf_groups
            else active_material == "leaf_green"
        )
        if not is_leaf_face:
            continue

        if len(fields) < 4:
            raise ValueError(f"Invalid OBJ face at line {line_number}")

        indexes = [
            _parse_obj_vertex_index(value, len(vertices), line_number)
            for value in fields[1:]
        ]

        for offset in range(1, len(indexes) - 1):
            face = (indexes[0], indexes[offset], indexes[offset + 1])
            identity = tuple(sorted(face))
            if identity in seen:
                # Preview OBJs can contain the reverse side of the same
                # triangle. CARIBU only needs one geometric triangle here.
                continue

            seen.add(identity)
            face_index = len(faces)
            faces.append(face)

            if has_leaf_groups:
                assert active_leaf is not None
                leaf_triangles.setdefault(active_leaf, []).append(face_index)

    if not vertices:
        raise ValueError("OBJ has no vertices")
    if not faces:
        if has_leaf_groups:
            raise ValueError("OBJ has leaf_* groups but no leaf faces")
        raise ValueError(
            "OBJ must contain leaf_* groups or leaf_green material faces"
        )

    if not has_leaf_groups:
        # Preserve the old material-based behaviour, but assign deterministic
        # IDs so downstream CARIBU aggregation has the same representation.
        leaf_triangles = {
            f"leaf_{index:04d}": component
            for index, component in enumerate(_leaf_components(faces), start=1)
        }

    if not leaf_triangles:
        raise ValueError("OBJ contains no leaf geometry")

    return vertices, faces, leaf_triangles


def _triangle_area(vertices: list[Vec3], triangle: Triangle) -> float:
    a, b, c = (vertices[index] for index in triangle)
    ab = tuple(b[index] - a[index] for index in range(3))
    ac = tuple(c[index] - a[index] for index in range(3))
    cross = (
        ab[1] * ac[2] - ab[2] * ac[1],
        ab[2] * ac[0] - ab[0] * ac[2],
        ab[0] * ac[1] - ab[1] * ac[0],
    )
    return 0.5 * math.sqrt(sum(value * value for value in cross))


def _leaf_components(triangles: list[Triangle]) -> list[list[int]]:
    """Group connected triangles for backward-compatible material-only OBJs."""
    faces_by_vertex: dict[int, list[int]] = {}
    for face_index, triangle in enumerate(triangles):
        for vertex in triangle:
            faces_by_vertex.setdefault(vertex, []).append(face_index)

    components: list[list[int]] = []
    visited: set[int] = set()
    for start in range(len(triangles)):
        if start in visited:
            continue
        pending, component = [start], []
        visited.add(start)
        while pending:
            current = pending.pop()
            component.append(current)
            for vertex in triangles[current]:
                for neighbour in faces_by_vertex[vertex]:
                    if neighbour not in visited:
                        visited.add(neighbour)
                        pending.append(neighbour)
        components.append(component)
    return components


def _prepare_caribu_runtime() -> None:
    """Support direct FastAPI launches on Windows, not only activated Conda shells."""
    if os.name != "nt":
        return
    for path in (
        Path(sys.prefix) / "Scripts",
        Path(sys.prefix) / "Library" / "bin",
    ):
        if path.is_dir() and str(path) not in os.environ.get("PATH", "").split(
            os.pathsep
        ):
            os.environ["PATH"] = str(path) + os.pathsep + os.environ.get("PATH", "")


# ---------------------------------------------------------------------------
# CARIBU diffuse-light calculation
# One CARIBU run determines how much of one unit of incident PPFD is absorbed
# by every leaf.  plantecophys then reuses those optical factors for every grid point.
# ---------------------------------------------------------------------------


def _caribu_leaf_light(
    vertices: list[Vec3],
    triangles: list[Triangle],
    leaf_triangles: LeafTriangles,
    parameters: PlantParameters,
) -> list[tuple[float, float]]:
    """Return (leaf area m², absorbed diffuse PAR factor) for one unit PPFD.

    CARIBU runs once for all triangles.  Its per-triangle absorbed energy is
    then area-weighted back to the original OBJ ``leaf_*`` groups.
    """
    _prepare_caribu_runtime()
    try:
        from openalea.caribu.caribu import raycasting
        from openalea.caribu.light import turtle
    except ImportError as error:
        raise RuntimeError("OBJ plant models require openalea.caribu") from error

    energies, _, directions, _, _ = turtle(
        sectors="16",
        format="uoc",
        energy=1.0,
    )
    result = raycasting(
        triangles=[
            [vertices[a], vertices[b], vertices[c]] for a, b, c in triangles
        ],
        materials=[
            (parameters.reflectance, parameters.transmittance)
        ] * len(triangles),
        lights=list(zip(energies, directions)),
    )

    areas = [_triangle_area(vertices, triangle) for triangle in triangles]
    leaves: list[tuple[float, float]] = []

    for leaf_id, component in leaf_triangles.items():
        area = sum(areas[index] for index in component)
        if area <= 0:
            continue

        absorbed_factor = sum(
            float(result["Eabs"][index]) * areas[index]
            for index in component
        ) / area
        leaves.append((area, absorbed_factor))

    if not leaves:
        raise ValueError("OBJ leaf geometry has zero area")
    return leaves


def _configure_r_environment() -> None:
    configured_home = os.environ.get("R_HOME")
    if not configured_home:
        raise RuntimeError("R_HOME is required for plantecophys")
    r_home = Path(configured_home).expanduser().resolve()
    # Windows installations commonly expose R_HOME either as the R root or
    # directly as ``.../bin/x64``. Accept both representations.
    if r_home.name.casefold() == "x64" and (r_home / "R.exe").is_file():
        r_home = r_home.parents[1]
    if not r_home.is_dir():
        raise FileNotFoundError(f"R_HOME does not exist: {r_home}")
    executable = r_home / "bin" / ("x64/R.exe" if os.name == "nt" else "R")
    if not executable.is_file():
        raise FileNotFoundError(f"Could not find R executable for R_HOME: {r_home}")
    os.environ["R_HOME"] = str(r_home)
    # In Docker the application is installed into site-packages, so deriving
    # the R library from this module's location points inside the Python
    # environment instead of the configured /app/data/r-library volume.
    # Respect an explicit runtime setting; use the project-relative library
    # only for local runs where no R_LIBS_USER was configured.
    configured_library = os.environ.get("R_LIBS_USER")
    r_library = (
        Path(configured_library).expanduser().resolve()
        if configured_library
        else PROJECT_R_LIBRARY
    )
    os.environ["R_LIBS_USER"] = str(r_library)
    if str(executable.parent) not in os.environ.get("PATH", "").split(os.pathsep):
        os.environ["PATH"] = str(executable.parent) + os.pathsep + os.environ.get(
            "PATH", ""
        )


# ---------------------------------------------------------------------------
# R / plantecophys leaf physiology and energy-balance calculation
# These helpers calculate one environmental slice after CARIBU has supplied
# the absorbed-light factors.  They do not read the OBJ again.
# ---------------------------------------------------------------------------


def _r_session() -> Any:
    _configure_r_environment()
    try:
        from rpy2 import robjects as ro
    except ImportError as error:
        raise RuntimeError("OBJ plant models require rpy2 and plantecophys") from error
    ro.r("suppressPackageStartupMessages(library(plantecophys))")
    return ro


def _vpd_kpa(temperature_c: float, humidity_percent: float) -> float:
    saturation = 0.6108 * math.exp(
        (17.27 * temperature_c) / (temperature_c + 237.3)
    )
    return max(0.0, saturation * (1.0 - humidity_percent / 100.0))


def _key(value: float) -> str:
    return format(float(value), ".10g").replace("-", "m").replace(".", "p")


def _evaluate_slice(
    *,
    ro: Any,
    leaf_areas_m2: list[float],
    absorbed_factors: list[float],
    ppfd: float,
    temperature_c: float,
    humidities: tuple[float, ...],
    co2_values: tuple[float, ...],
    parameters: PlantParameters,
) -> list[dict[str, float]]:
    """Evaluate a full PPFD/temperature slice in R with one Python/R crossing."""
    ro.globalenv["cb_leaf_areas"] = ro.FloatVector(leaf_areas_m2)
    ro.globalenv["cb_leaf_ppfd"] = ro.FloatVector(
        [factor * ppfd for factor in absorbed_factors]
    )
    ro.globalenv["cb_temperature"] = temperature_c
    ro.globalenv["cb_humidities"] = ro.FloatVector(humidities)
    ro.globalenv["cb_co2_values"] = ro.FloatVector(co2_values)
    ro.globalenv["cb_reference_pressure_kpa"] = REFERENCE_PRESSURE_KPA
    ro.globalenv["cb_vcmax"] = parameters.vcmax
    ro.globalenv["cb_jmax"] = parameters.jmax
    ro.globalenv["cb_rd"] = parameters.rd
    ro.globalenv["cb_leaf_width"] = parameters.leaf_width_m
    ro.globalenv["cb_wind_speed"] = parameters.wind_speed_m_s
    ro.globalenv["cb_stomatal_ratio"] = parameters.stomatal_ratio
    ro.globalenv["cb_leaf_absorptance"] = parameters.leaf_absorptance
    ro.r(
        """
        cb_slice <- function() {
          # plantecophys::LeafEnergyBalance is an outdoor-leaf formulation:
          # its isothermal radiation term derives atmospheric emissivity from
          # VPD.  That makes an indoor leaf radiate towards an artificial cold
          # sky.  This closure instead uses a room enclosure at MRT = Tair.
          # It retains Photosyn's stomatal conductance and the same boundary
          # layer conductances, but solves the complete indoor radiative,
          # sensible and latent balance directly.
          indoor_leaf_energy_balance <- function(
            Tleaf, Tair, gs, PPFD, VPD, Patm, Wind, Wleaf,
            StomatalRatio, LeafAbs, returnwhat=c("balance", "fluxes")
          ) {
            returnwhat <- match.arg(returnwhat)
            boltz <- 5.67e-8
            emissivity <- 0.95
            cp_air <- 1010.0
            air_molar_mass <- 29e-3
            water_molar_mass <- 18e-3
            dry_air_gas_constant <- 287.058
            water_latent_heat <- (2.501e6 - 2.365e3 * Tair) * water_molar_mass
            saturation_pressure <- function(temperature) {
              0.6108 * exp((17.27 * temperature) / (temperature + 237.3))
            }

            air_temperature_k <- Tair + 273.15
            leaf_temperature_k <- Tleaf + 273.15
            air_density <- Patm * 1000 / (dry_air_gas_constant * air_temperature_k)
            air_molar_density <- Patm * 1000 / (8.314 * air_temperature_k)
            heat_diffusivity <- 21.5e-6
            effective_wind <- max(Wind, 0.05)
            forced_gbh <- 0.003 * (effective_wind / Wleaf) * air_molar_density
            grashof <- 1.6e8 * abs(Tleaf - Tair) * Wleaf^3
            free_gbh <- 0.5 * heat_diffusivity * grashof^0.25 / Wleaf * air_molar_density
            gbh <- 2 * (forced_gbh + free_gbh)
            gbw <- StomatalRatio * 1.075 * gbh
            gw <- gs * gbw / (gs + gbw)

            # Water-vapour flux, positive from leaf to room air.
            air_vapour_pressure <- max(0, saturation_pressure(Tair) - VPD)
            leaf_vapour_pressure <- saturation_pressure(Tleaf)
            transpiration <- gw * (leaf_vapour_pressure - air_vapour_pressure) / Patm
            latent_heat <- water_latent_heat * transpiration

            sensible_heat <- cp_air * air_density * (gbh / air_molar_density) *
              (Tleaf - Tair)
            shortwave <- 2 * PPFD / 4.57
            longwave_in <- emissivity * boltz * air_temperature_k^4
            longwave_out <- emissivity * boltz * leaf_temperature_k^4
            net_radiation <- LeafAbs * shortwave + longwave_in - longwave_out
            balance <- net_radiation - latent_heat - sensible_heat

            if (returnwhat == "balance") return(balance)
            list(
              ELEAFeb=1000 * transpiration,
              lambdaET=latent_heat,
              H=sensible_heat,
              Rsol=shortwave,
              Rnetiso=net_radiation,
              Rlongup=longwave_out,
              balance=balance
            )
          }
          rows <- list(); index <- 1L
          for (humidity in cb_humidities) {
            saturation <- 0.6108 * exp((17.27 * cb_temperature) / (cb_temperature + 237.3))
            vpd <- max(0, saturation * (1 - humidity / 100))
            for (co2 in cb_co2_values) {
              # The PhotosynEB wrapper in plantecophys uses optimisation of a
              # squared fixed-point objective.  For some low-airflow indoor
              # points it can report ``failed = FALSE`` while its returned
              # Tleaf is not the Tleaf obtained by the energy balance itself.
              #
              # We retain Photosyn for stomatal conductance and solve the
              # coupled indoor leaf-temperature fixed point explicitly. A
              # response is accepted only when its final energy-balance
              # residual is sufficiently close to zero.
              solve_leaf <- function(leaf_ppfd) {
                candidate_tleaf <- cb_temperature
                converged <- FALSE

                for (iteration in seq_len(24L)) {
                  gas <- tryCatch(
                    plantecophys::Photosyn(
                      PPFD=leaf_ppfd, Tleaf=candidate_tleaf, VPD=vpd,
                      Ca=co2, Patm=cb_reference_pressure_kpa, Vcmax=cb_vcmax,
                      Jmax=cb_jmax, Rd=cb_rd
                    ),
                    error=function(error) NULL
                  )
                  if (is.null(gas) || !is.finite(gas$GS[[1]])) break

                  balanced_tleaf <- tryCatch(
                    uniroot(
                      function(leaf_temperature) indoor_leaf_energy_balance(
                        Tleaf=leaf_temperature, Tair=cb_temperature,
                        gs=gas$GS[[1]], PPFD=leaf_ppfd, VPD=vpd,
                        Patm=cb_reference_pressure_kpa, Wind=cb_wind_speed,
                        Wleaf=cb_leaf_width,
                        StomatalRatio=cb_stomatal_ratio,
                        LeafAbs=cb_leaf_absorptance, returnwhat="balance"
                      ),
                      interval=c(cb_temperature - 25, cb_temperature + 25)
                    )$root,
                    error=function(error) NA_real_
                  )
                  if (!is.finite(balanced_tleaf)) break

                  if (abs(balanced_tleaf - candidate_tleaf) < 0.01) {
                    candidate_tleaf <- balanced_tleaf
                    converged <- TRUE
                    break
                  }
                  # Under-relaxation prevents oscillation in the coupled
                  # stomatal-conductance / leaf-temperature solve.
                  candidate_tleaf <- (candidate_tleaf + balanced_tleaf) / 2
                }

                if (!converged) {
                  return(rep(NA_real_, 10L))
                }

                gas <- tryCatch(
                  plantecophys::Photosyn(
                    PPFD=leaf_ppfd, Tleaf=candidate_tleaf, VPD=vpd,
                    Ca=co2, Patm=cb_reference_pressure_kpa, Vcmax=cb_vcmax,
                    Jmax=cb_jmax, Rd=cb_rd
                  ),
                  error=function(error) NULL
                )
                if (is.null(gas)) {
                  return(rep(NA_real_, 10L))
                }
                fluxes <- tryCatch(
                  indoor_leaf_energy_balance(
                    Tleaf=candidate_tleaf, Tair=cb_temperature,
                    gs=gas$GS[[1]], PPFD=leaf_ppfd, VPD=vpd, Patm=cb_reference_pressure_kpa,
                    Wind=cb_wind_speed, Wleaf=cb_leaf_width,
                    StomatalRatio=cb_stomatal_ratio,
                    LeafAbs=cb_leaf_absorptance, returnwhat="fluxes"
                  ),
                  error=function(error) NULL
                )
                residual <- tryCatch(
                  indoor_leaf_energy_balance(
                    Tleaf=candidate_tleaf, Tair=cb_temperature,
                    gs=gas$GS[[1]], PPFD=leaf_ppfd, VPD=vpd, Patm=cb_reference_pressure_kpa,
                    Wind=cb_wind_speed, Wleaf=cb_leaf_width,
                    StomatalRatio=cb_stomatal_ratio,
                    LeafAbs=cb_leaf_absorptance, returnwhat="balance"
                  ),
                  error=function(error) NA_real_
                )
                valid <- !is.null(fluxes) && is.finite(residual) &&
                  abs(residual) <= 0.05 &&
                  all(is.finite(c(gas$ALEAF[[1]], gas$GS[[1]],
                                  fluxes$ELEAFeb[[1]])))
                if (!valid) {
                  return(rep(NA_real_, 10L))
                }
                c(
                  gas$ALEAF[[1]], fluxes$ELEAFeb[[1]], candidate_tleaf,
                  gas$GS[[1]], residual,
                  fluxes$lambdaET[[1]], fluxes$H[[1]], fluxes$Rsol[[1]],
                  fluxes$Rnetiso[[1]], fluxes$Rlongup[[1]]
                )
              }

              leaf_response <- t(vapply(
                cb_leaf_ppfd, solve_leaf, numeric(10L)
              ))
              valid_leaf <- apply(leaf_response, 1L, function(values) {
                all(is.finite(values))
              })
              failed_fraction <- sum(cb_leaf_areas[!valid_leaf]) / sum(cb_leaf_areas)
              valid_areas <- cb_leaf_areas[valid_leaf]
              if (length(valid_areas) == 0L) {
                aleaf <- eleaf <- tleaf <- gs <- numeric(0)
                lambda_et <- sensible <- rsol <- rnetiso <- rlongup <- numeric(0)
                net_umol_s <- transpiration_kg_h <- 0
                leaf_temperature_c <- cb_temperature
                stomatal_conductance <- 0
                latent_heat_flux <- sensible_heat_flux <- 0
                incident_shortwave_flux <- net_radiation_flux <- longwave_emission_flux <- 0
              } else {
                aleaf <- leaf_response[valid_leaf, 1L]
                eleaf <- pmax(0, leaf_response[valid_leaf, 2L])
                tleaf <- leaf_response[valid_leaf, 3L]
                gs <- pmax(0, leaf_response[valid_leaf, 4L])
                lambda_et <- leaf_response[valid_leaf, 6L]
                sensible <- leaf_response[valid_leaf, 7L]
                rsol <- leaf_response[valid_leaf, 8L]
                rnetiso <- leaf_response[valid_leaf, 9L]
                rlongup <- leaf_response[valid_leaf, 10L]
                net_umol_s <- sum(aleaf * valid_areas)
                transpiration_kg_h <- sum(eleaf * valid_areas) * 1e-3 * 0.01801528 * 3600
                leaf_temperature_c <- sum(tleaf * valid_areas) / sum(valid_areas)
                stomatal_conductance <- sum(gs * valid_areas) / sum(valid_areas)
                latent_heat_flux <- sum(lambda_et * valid_areas) / sum(valid_areas)
                sensible_heat_flux <- sum(sensible * valid_areas) / sum(valid_areas)
                incident_shortwave_flux <- sum(rsol * valid_areas) / sum(valid_areas)
                net_radiation_flux <- sum(rnetiso * valid_areas) / sum(valid_areas)
                longwave_emission_flux <- sum(rlongup * valid_areas) / sum(valid_areas)
              }
              rows[[index]] <- c(
                humidity, co2, vpd, net_umol_s,
                transpiration_kg_h, leaf_temperature_c, stomatal_conductance,
                failed_fraction, latent_heat_flux, sensible_heat_flux,
                incident_shortwave_flux, net_radiation_flux, longwave_emission_flux
              )
              index <- index + 1L
            }
          }
          do.call(rbind, rows)
        }
        cb_result <- cb_slice()
    """
    )
    frame = ro.r("as.data.frame(cb_result)")
    columns = [list(frame.rx2(index)) for index in range(1, 14)]
    return [
        {
            "humidity": float(row[0]),
            "co2": float(row[1]),
            "vpd": float(row[2]),
            "net_umol_s": float(row[3]),
            "transpiration_kg_h": float(row[4]),
            "leaf_temperature_c": float(row[5]),
            "stomatal_conductance_mol_m2_s": float(row[6]),
            "energy_balance_failed_leaf_fraction": float(row[7]),
            "latent_heat_flux_w_m2_leaf": float(row[8]),
            "sensible_heat_flux_w_m2_leaf": float(row[9]),
            "incident_shortwave_flux_w_m2_leaf": float(row[10]),
            "net_radiation_flux_w_m2_leaf": float(row[11]),
            "longwave_emission_flux_w_m2_leaf": float(row[12]),
        }
        for row in zip(*columns, strict=True)
    ]


def _evaluate_grid_slice_task(
    task: tuple[
        float,
        float,
        list[float],
        list[float],
        tuple[float, ...],
        tuple[float, ...],
        PlantParameters,
    ],
) -> tuple[float, float, list[dict[str, float]]]:
    """Evaluate one PPFD/temperature slice in a reusable worker R session."""
    global _WORKER_R_SESSION
    (
        ppfd,
        temperature_c,
        leaf_areas_m2,
        absorbed_factors,
        humidities,
        co2_values,
        parameters,
    ) = task
    if _WORKER_R_SESSION is None:
        _WORKER_R_SESSION = _r_session()
    return (
        ppfd,
        temperature_c,
        _evaluate_slice(
            ro=_WORKER_R_SESSION,
            leaf_areas_m2=leaf_areas_m2,
            absorbed_factors=absorbed_factors,
            ppfd=ppfd,
            temperature_c=temperature_c,
            humidities=humidities,
            co2_values=co2_values,
            parameters=parameters,
        ),
    )


def generate_obj_caribu_plantecophys_profiles(
    *,
    obj_path: Path,
    output_directory: Path,
    parameters: PlantParameters,
    config: PlantGridConfig = DEFAULT_GRID_CONFIG,
    grid_preset: str = "standard",
    progress_callback: ProgressCallback | None = None,
) -> Path:
    # The orchestration layer: validate inputs, derive fixed leaf optics once,
    # evaluate all environmental states, then write one portable JSON grid.
    parameters.validate()
    vertices, triangles, leaf_triangles = _parse_leaf_triangles(obj_path)
    leaves = _caribu_leaf_light(
        vertices,
        triangles,
        leaf_triangles,
        parameters,
    )
    leaf_areas, absorbed_factors = zip(*leaves, strict=True)
    total_leaf_area = sum(leaf_areas)

    ppfd_values = config.ppfd_umol_m2_s
    temperatures = config.temperature_c.values()
    humidities = config.relative_humidity_percent.values()
    co2_values = config.co2_ppm.values()
    total = (
        len(ppfd_values)
        * len(temperatures)
        * len(humidities)
        * len(co2_values)
    )
    profile_slices: dict[str, dict[str, Any]] = {}
    vpd_values: dict[str, dict[str, float]] = {}
    completed, started = 0, time.perf_counter()

    def store_slice(
        *, ppfd: float, temperature: float, rows: list[dict[str, float]]
    ) -> None:
        by_humidity: dict[str, Any] = {}
        for row in rows:
            humidity_key = _key(row["humidity"])
            co2_key = _key(row["co2"])
            by_humidity.setdefault(humidity_key, {})[co2_key] = {
                "net_co2_exchange_g_per_hour": round(
                    row["net_umol_s"] * 1e-6 * 44.01 * 3600.0,
                    12,
                ),
                "transpiration_kg_per_hour": round(
                    row["transpiration_kg_h"], 12
                ),
                "leaf_temperature_c": round(row["leaf_temperature_c"], 8),
                "stomatal_conductance_mol_m2_s": round(
                    row["stomatal_conductance_mol_m2_s"], 12
                ),
                "energy_balance_failed_leaf_fraction": round(
                    row["energy_balance_failed_leaf_fraction"], 8
                ),
                "latent_heat_flux_w_m2_leaf": round(
                    row["latent_heat_flux_w_m2_leaf"], 12
                ),
                "sensible_heat_flux_w_m2_leaf": round(
                    row["sensible_heat_flux_w_m2_leaf"], 12
                ),
                "incident_shortwave_flux_w_m2_leaf": round(
                    row["incident_shortwave_flux_w_m2_leaf"], 12
                ),
                "net_radiation_flux_w_m2_leaf": round(
                    row["net_radiation_flux_w_m2_leaf"], 12
                ),
                "longwave_emission_flux_w_m2_leaf": round(
                    row["longwave_emission_flux_w_m2_leaf"], 12
                ),
            }
            vpd_values.setdefault(_key(temperature), {})[humidity_key] = round(
                row["vpd"], 8
            )
        profile_slices.setdefault(_key(ppfd), {})[_key(temperature)] = by_humidity

    tasks = [
        (
            ppfd,
            temperature,
            list(leaf_areas),
            list(absorbed_factors),
            humidities,
            co2_values,
            parameters,
        )
        for ppfd in ppfd_values
        for temperature in temperatures
    ]
    if grid_preset == "production":
        worker_count = min(5, len(tasks), os.cpu_count() or 1)
        with ProcessPoolExecutor(max_workers=worker_count) as executor:
            futures = [
                executor.submit(_evaluate_grid_slice_task, task)
                for task in tasks
            ]
            slices = (future.result() for future in as_completed(futures))
            for ppfd, temperature, rows in slices:
                store_slice(ppfd=ppfd, temperature=temperature, rows=rows)
                completed += len(rows)
                if progress_callback:
                    elapsed = time.perf_counter() - started
                    progress_callback(
                        PlantSweepProgress(
                            completed,
                            total,
                            completed / total * 100.0,
                            elapsed,
                            elapsed / completed * (total - completed),
                            ppfd,
                            temperature,
                        )
                    )
    else:
        ro = _r_session()
        for task in tasks:
            ppfd, temperature = task[0], task[1]
            rows = _evaluate_slice(
                ro=ro,
                leaf_areas_m2=task[2],
                absorbed_factors=task[3],
                ppfd=ppfd,
                temperature_c=temperature,
                humidities=task[4],
                co2_values=task[5],
                parameters=task[6],
            )
            store_slice(ppfd=ppfd, temperature=temperature, rows=rows)
            completed += len(rows)
            if progress_callback:
                elapsed = time.perf_counter() - started
                progress_callback(
                    PlantSweepProgress(
                        completed,
                        total,
                        completed / total * 100.0,
                        elapsed,
                        elapsed / completed * (total - completed),
                        ppfd,
                        temperature,
                    )
                )

    profiles = {
        _key(ppfd): {
            _key(temperature): profile_slices[_key(ppfd)][_key(temperature)]
            for temperature in temperatures
        }
        for ppfd in ppfd_values
    }

    output_directory.mkdir(parents=True, exist_ok=True)
    output_path = output_directory / "plant_profile_grid.json"
    output_path.write_text(
        json.dumps(
            {
                "schema_version": 5,
                "profile_type": "steady_state_environment_grid",
                "source": (
                    "CARIBU + plantecophys Photosyn + indoor leaf "
                    "energy-balance fixed point"
                ),
                "radiative_closure": (
                    "indoor enclosure: long-wave mean radiant temperature "
                    "equals zone air temperature"
                ),
                "grid_preset": grid_preset,
                "grid_purpose": (
                    "case-study validation sampling; validate against the "
                    "standard grid before reporting final results"
                    if grid_preset == "diagnostic"
                    else "full-resolution production sampling"
                ),
                "obj_file": obj_path.name,
                "parameters": asdict(parameters),
                "fbeam": 0.0,
                "axis_order": [
                    "ppfd_umol_m2_s",
                    "temperature_c",
                    "relative_humidity_percent",
                    "co2_ppm",
                ],
                "axes": {
                    "ppfd_umol_m2_s": list(ppfd_values),
                    "temperature_c": list(temperatures),
                    "relative_humidity_percent": list(humidities),
                    "co2_ppm": list(co2_values),
                },
                "grid_point_count": total,
                # OBJ living-wall models are generated as one square metre
                # reference panels; runtime values scale from this panel.
                "panel_area_m2": 1.0,
                "total_leaf_area_m2": total_leaf_area,
                "leaf_count": len(leaves),
                "mean_par_leaf_umol_m2_s_by_ppfd": {
                    _key(ppfd): round(
                        sum(
                            area * factor * ppfd
                            for area, factor in leaves
                        )
                        / total_leaf_area,
                        8,
                    )
                    for ppfd in ppfd_values
                },
                "value_fields": {
                    "net_co2_exchange_g_per_hour": "g CO2 h-1 reference-panel-1",
                    "transpiration_kg_per_hour": "kg H2O h-1 reference-panel-1",
                    "leaf_temperature_c": "degC leaf-area-weighted",
                    "stomatal_conductance_mol_m2_s": "mol H2O m-2 leaf s-1 leaf-area-weighted",
                    "energy_balance_failed_leaf_fraction": "leaf-area fraction without a verified energy-balance solution",
                    "latent_heat_flux_w_m2_leaf": "W m-2 leaf-area-1",
                    "sensible_heat_flux_w_m2_leaf": "W m-2 leaf-area-1; positive leaf-to-air",
                    "incident_shortwave_flux_w_m2_leaf": "W m-2 leaf-area-1",
                    "net_radiation_flux_w_m2_leaf": "W m-2 leaf-area-1",
                    "longwave_emission_flux_w_m2_leaf": "W m-2 leaf-area-1",
                },
                "sign_convention": (
                    "Positive values are uptake; negative values are respiration."
                ),
                "vpd_kpa_by_temperature_and_humidity": vpd_values,
                "profiles": profiles,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    return output_path
