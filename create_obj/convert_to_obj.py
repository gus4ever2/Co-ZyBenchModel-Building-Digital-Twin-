from __future__ import annotations

from pathlib import Path
import argparse
import math


# ============================================================
# Vector helpers
# ============================================================

Vec3 = tuple[float, float, float]
Face = tuple[int, int, int, str]


def v_add(a: Vec3, b: Vec3) -> Vec3:
    return (a[0] + b[0], a[1] + b[1], a[2] + b[2])


def v_sub(a: Vec3, b: Vec3) -> Vec3:
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def v_mul(v: Vec3, s: float) -> Vec3:
    return (v[0] * s, v[1] * s, v[2] * s)


def v_len(v: Vec3) -> float:
    return math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])


def v_norm(v: Vec3) -> Vec3:
    length = v_len(v)
    if length < 1e-12:
        return (0.0, 0.0, 1.0)
    return (v[0] / length, v[1] / length, v[2] / length)


def v_cross(a: Vec3, b: Vec3) -> Vec3:
    return (
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    )


def direction_from_yplant_angles(azimuth_deg: float, angle_deg: float) -> Vec3:
    """
    Yplant-style interpretation used here:
    - Azimuth rotates around the vertical axis.
    - Angle 90 means vertical/up.
    - Angle 0 means horizontal.

    Internal coordinates are Blender-friendly:
    X/Y = ground plane
    Z   = up
    """
    az = math.radians(float(azimuth_deg))
    an = math.radians(float(angle_deg))

    x = math.cos(an) * math.cos(az)
    y = math.cos(an) * math.sin(az)
    z = math.sin(an)

    return v_norm((x, y, z))


# ============================================================
# File parsers
# ============================================================


def parse_plant_file(path: str | Path) -> list[list[float]]:
    """
    Reads a Yplant .P file.

    Numeric rows are expected to contain at least 20 values:

    0  N
    1  MN parent node
    2  stem flag
    3  leaf flag
    4  stem Az
    5  stem An
    6  stem L
    7  stem D
    8  branch Az
    9  branch An
    10 branch L
    11 branch D
    12 petiole Az
    13 petiole An
    14 petiole L
    15 petiole D
    16 leaf Or
    17 leaf Az
    18 leaf An
    19 leaf L
    """
    path = Path(path)
    rows: list[list[float]] = []

    with path.open("r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) < 20:
                continue
            try:
                row = [float(p) for p in parts[:20]]
            except ValueError:
                continue
            rows.append(row)

    if not rows:
        raise ValueError(f"No valid numeric rows found in plant file: {path}")

    return rows



def parse_leaf_file(path: str | Path) -> list[tuple[float, float]]:
    """
    Reads a Yplant .L leaf outline file.

    Expected pattern:
        leaf 1
        35
        x y
        x y
        ...

    The first integer-like line is treated as the point count.
    """
    path = Path(path)

    with path.open("r", encoding="utf-8", errors="ignore") as f:
        lines = [line.strip() for line in f if line.strip()]

    point_count = None
    point_count_index = None

    for i, line in enumerate(lines):
        try:
            value = float(line)
            if value.is_integer() and value >= 3:
                point_count = int(value)
                point_count_index = i
                break
        except ValueError:
            continue

    if point_count is None or point_count_index is None:
        raise ValueError(f"Could not find leaf point count in leaf file: {path}")

    points: list[tuple[float, float]] = []
    start = point_count_index + 1
    end = start + point_count

    for line in lines[start:end]:
        parts = line.split()
        if len(parts) < 2:
            continue
        try:
            x = float(parts[0])
            y = float(parts[1])
        except ValueError:
            continue
        points.append((x, y))

    if len(points) < 3:
        raise ValueError(f"Leaf file does not contain enough outline points: {path}")

    return points


# ============================================================
# Mesh builders
# ============================================================


def add_face(faces: list[Face], a: int, b: int, c: int, material: str) -> None:
    faces.append((a, b, c, material))



def add_cylinder(
    vertices: list[Vec3],
    faces: list[Face],
    start: Vec3,
    end: Vec3,
    radius: float,
    sides: int = 10,
    material: str = "stem_green",
) -> None:
    axis = v_sub(end, start)
    if v_len(axis) < 1e-6:
        return

    direction = v_norm(axis)
    reference = (0.0, 0.0, 1.0)

    # If the stem is almost vertical, use X as reference to avoid zero cross product.
    if abs(direction[2]) > 0.95:
        reference = (1.0, 0.0, 0.0)

    right = v_norm(v_cross(direction, reference))
    forward = v_norm(v_cross(right, direction))

    start_ring: list[int] = []
    end_ring: list[int] = []

    for i in range(sides):
        theta = 2.0 * math.pi * i / sides
        offset = v_add(
            v_mul(right, math.cos(theta) * radius),
            v_mul(forward, math.sin(theta) * radius),
        )

        vertices.append(v_add(start, offset))
        start_ring.append(len(vertices) - 1)

        vertices.append(v_add(end, offset))
        end_ring.append(len(vertices) - 1)

    for i in range(sides):
        j = (i + 1) % sides
        a = start_ring[i]
        b = start_ring[j]
        c = end_ring[j]
        d = end_ring[i]

        add_face(faces, a, b, c, material)
        add_face(faces, a, c, d, material)



def normalize_leaf_outline(points: list[tuple[float, float]]) -> list[tuple[float, float]]:
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]

    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    center_x = (min_x + max_x) / 2.0
    height = max_y - min_y

    if abs(height) < 1e-9:
        raise ValueError("Leaf outline has zero height")

    # normalized x around 0, normalized y from 0 to 1
    return [((x - center_x) / height, (y - min_y) / height) for x, y in points]



def add_leaf(
    vertices: list[Vec3],
    faces: list[Face],
    leaf_outline: list[tuple[float, float]],
    base: Vec3,
    azimuth: float,
    angle: float,
    length: float,
    material: str = "leaf_green",
) -> None:
    if length <= 0:
        return

    outline = normalize_leaf_outline(leaf_outline)
    leaf_length = length / 100.0

    main_dir = direction_from_yplant_angles(azimuth, angle)

    up = (0.0, 0.0, 1.0)
    width_dir = v_cross(main_dir, up)
    if v_len(width_dir) < 1e-6:
        width_dir = (1.0, 0.0, 0.0)
    else:
        width_dir = v_norm(width_dir)

    normal_dir = v_norm(v_cross(width_dir, main_dir))

    # A center spine point for triangle fan.
    center = v_add(base, v_mul(main_dir, 0.48 * leaf_length))
    center_index = len(vertices)
    vertices.append(center)

    boundary: list[int] = []

    for nx, ny in outline:
        # Width follows the original outline. Curvature makes it less flat.
        pos = base
        pos = v_add(pos, v_mul(main_dir, ny * leaf_length))
        pos = v_add(pos, v_mul(width_dir, nx * leaf_length * 0.85))
        pos = v_add(pos, v_mul(normal_dir, math.sin(ny * math.pi) * 0.035))

        vertices.append(pos)
        boundary.append(len(vertices) - 1)

    # Double-sided leaf so Blender shows both faces without special material settings.
    for i in range(len(boundary)):
        a = boundary[i]
        b = boundary[(i + 1) % len(boundary)]
        add_face(faces, center_index, a, b, material)
        add_face(faces, center_index, b, a, material)



def build_mesh(
    plant_rows: list[list[float]],
    leaf_outline: list[tuple[float, float]],
    unit_scale: float = 0.01,
) -> tuple[list[Vec3], list[Face]]:
    vertices: list[Vec3] = []
    faces: list[Face] = []

    # Yplant node positions. Node 0 starts at origin.
    node_positions: dict[int, Vec3] = {0: (0.0, 0.0, 0.0)}

    for row in plant_rows:
        node_id = int(row[0])
        parent_id = int(row[1])
        has_leaf = int(row[3]) == 1

        stem_az = row[4]
        stem_an = row[5]
        stem_l = row[6]
        stem_d = row[7]

        petiole_az = row[12]
        petiole_an = row[13]
        petiole_l = row[14]
        petiole_d = row[15]

        leaf_az = row[17]
        leaf_an = row[18]
        leaf_l = row[19]

        parent_pos = node_positions.get(parent_id, (0.0, 0.0, 0.0))

        if stem_l > 0:
            stem_dir = direction_from_yplant_angles(stem_az, stem_an)
            node_pos = v_add(parent_pos, v_mul(stem_dir, stem_l * unit_scale))
        else:
            node_pos = parent_pos

        node_positions[node_id] = node_pos

        if stem_l > 0.2:
            radius = max(0.0035, stem_d * unit_scale * 0.18)
            add_cylinder(vertices, faces, parent_pos, node_pos, radius, sides=10, material="stem_green")

        if has_leaf and leaf_l > 0:
            petiole_dir = direction_from_yplant_angles(petiole_az, petiole_an)
            petiole_len = max(petiole_l, 3.0)
            petiole_end = v_add(node_pos, v_mul(petiole_dir, petiole_len * unit_scale))
            petiole_radius = max(0.0025, petiole_d * unit_scale * 0.13)

            add_cylinder(vertices, faces, node_pos, petiole_end, petiole_radius, sides=8, material="stem_green")
            add_leaf(vertices, faces, leaf_outline, petiole_end, leaf_az, leaf_an, leaf_l, material="leaf_green")

    return vertices, faces


# ============================================================
# Export helpers
# ============================================================


def center_vertices(vertices: list[Vec3]) -> list[Vec3]:
    if not vertices:
        return vertices

    xs = [v[0] for v in vertices]
    ys = [v[1] for v in vertices]
    zs = [v[2] for v in vertices]

    cx = (min(xs) + max(xs)) / 2.0
    cy = (min(ys) + max(ys)) / 2.0
    bottom = min(zs)

    # Center around origin and place the bottom on Z=0.
    return [(x - cx, y - cy, z - bottom) for x, y, z in vertices]



def write_mtl(path: str | Path) -> None:
    path = Path(path)
    with path.open("w", encoding="utf-8") as f:
        f.write("newmtl leaf_green\n")
        f.write("Ka 0.04 0.16 0.04\n")
        f.write("Kd 0.14 0.55 0.16\n")
        f.write("Ks 0.06 0.08 0.06\n")
        f.write("Ns 18\n")
        f.write("d 1.0\n\n")

        f.write("newmtl stem_green\n")
        f.write("Ka 0.04 0.10 0.02\n")
        f.write("Kd 0.28 0.40 0.10\n")
        f.write("Ks 0.03 0.03 0.03\n")
        f.write("Ns 8\n")
        f.write("d 1.0\n")



def write_obj(path: str | Path, vertices: list[Vec3], faces: list[Face], mtl_filename: str) -> None:
    """
    Writes OBJ for Blender default OBJ import.

    Blender's OBJ importer commonly imports OBJ as Y-up and applies
    Rotation X = 90 degrees. Therefore we export internal Z-up coordinates
    as OBJ Y-up coordinates:

        internal (x, y, z)  ->  obj (x, z, -y)

    After Blender's default +90 X import rotation, the plant becomes upright.
    """
    path = Path(path)
    vertices = center_vertices(vertices)

    with path.open("w", encoding="utf-8") as f:
        f.write(f"mtllib {mtl_filename}\n")
        f.write("o YplantConvertedPlant\n\n")

        for x, y, z in vertices:
            obj_x = x
            obj_y = z
            obj_z = -y
            f.write(f"v {obj_x:.6f} {obj_y:.6f} {obj_z:.6f}\n")

        f.write("\n")

        current_material = None
        for a, b, c, material in faces:
            if material != current_material:
                f.write(f"usemtl {material}\n")
                current_material = material

            # OBJ indices start from 1.
            f.write(f"f {a + 1} {b + 1} {c + 1}\n")


# ============================================================
# Main conversion
# ============================================================


def convert(plant_file: str | Path, leaf_file: str | Path, output_obj: str | Path) -> tuple[Path, Path]:
    plant_file = Path(plant_file)
    leaf_file = Path(leaf_file)
    output_obj = Path(output_obj)
    output_obj.parent.mkdir(parents=True, exist_ok=True)

    output_mtl = output_obj.with_suffix(".mtl")

    plant_rows = parse_plant_file(plant_file)
    leaf_outline = parse_leaf_file(leaf_file)
    vertices, faces = build_mesh(plant_rows, leaf_outline)

    write_obj(output_obj, vertices, faces, output_mtl.name)
    write_mtl(output_mtl)

    print("Conversion completed")
    print(f"Plant rows: {len(plant_rows)}")
    print(f"Leaf outline points: {len(leaf_outline)}")
    print(f"Vertices: {len(vertices)}")
    print(f"Faces: {len(faces)}")
    print(f"OBJ: {output_obj}")
    print(f"MTL: {output_mtl}")

    return output_obj, output_mtl


if __name__ == "__main__":
    """
    parser = argparse.ArgumentParser(description="Convert Yplant .P and .L files to Blender OBJ + MTL.")
    parser.add_argument("--plant", required=True, help="Path to .P plant file")
    parser.add_argument("--leaf", required=True, help="Path to .L leaf file")
    parser.add_argument("--out", default="plant_model.obj", help="Output .obj path")

    args = parser.parse_args()
    convert(args.plant, args.leaf, args.out)
    """

    convert("plant.P", "spathiphyllum.L", "plant_model.obj")
