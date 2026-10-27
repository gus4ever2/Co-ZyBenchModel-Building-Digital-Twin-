"""Configure native EnergyPlus CO2 demand-controlled ventilation."""

from __future__ import annotations

from eppy.modeleditor import IDF

from cosimulator.core.logger.logging import logger
from cosimulator.idf.insert_idf_model import insert_idf_model
from cosimulator.idf.models.schedule_constant import ScheduleConstant
from cosimulator.idf.co2_control.model.zone_contaminant_controller import ZoneContaminantController


_SETPOINT_SCHEDULE_PREFIX = "CO2_CONTROL_SETPOINT"
_CONTROLLER_PREFIX = "CO2 Control"
_SCHEDULE_TYPE = "SCHEDULE:CONSTANT"
_ZONE_CONTROLLER_TYPE = "ZONECONTROL:CONTAMINANTCONTROLLER"
_MECHANICAL_CONTROLLER_TYPE = "CONTROLLER:MECHANICALVENTILATION"
_OUTDOOR_AIR_CONTROLLER_TYPE = "CONTROLLER:OUTDOORAIR"
_ECONOMIZER_CONTROL_TYPE = "DifferentialDryBulb"

# Names and topology lookup -------------------------------------------------
# These helpers inspect the existing HVAC objects before modifying controllers.

def _schedule_name(setpoint_ppm: int) -> str:
    return f"{_SETPOINT_SCHEDULE_PREFIX}_{setpoint_ppm}"


def _remove_named_objects(*, idf: IDF, object_type: str, name: str) -> None:
    for item in list(idf.idfobjects[object_type]):
        if str(getattr(item, "Name", "")).casefold() == name.casefold():
            idf.removeidfobject(item)


def _zone_list_members(idf: IDF) -> dict[str, set[str]]:
    members: dict[str, set[str]] = {}  # Case-insensitive ZoneList name mapped to its member zone names.
    for zone_list in idf.idfobjects["ZONELIST"]:
        values = {
            str(getattr(zone_list, field_name)).strip()
            for field_name in zone_list.fieldnames
            if field_name.startswith("Zone_")
            and str(getattr(zone_list, field_name, "")).strip()
        }
        members[str(zone_list.Name).casefold()] = values  # Store names normalized for later EnergyPlus-style matching.
    return members


def _controller_zones(*, controller: object, zone_lists: dict[str, set[str]]) -> set[str]:
    zones: set[str] = set()  # Expanded set of individual zones served by one controller.
    for field_name in controller.fieldnames:
        if not field_name.startswith("Zone_or_ZoneList_"):
            continue
        value = str(getattr(controller, field_name, "")).strip()  # A field may name either an individual zone or a ZoneList.
        if not value:
            continue
        zones.update(zone_lists.get(value.casefold(), {value}))  # Expand a known ZoneList; otherwise retain the direct zone name.
    return zones


def _configure_mechanical_ventilation(*, idf: IDF, zone_names: set[str]) -> set[str]:
    zone_lists = _zone_list_members(idf)  # Resolve zone lists before comparing controller coverage.
    controllers = idf.idfobjects[_MECHANICAL_CONTROLLER_TYPE]  # Existing mechanical ventilation controllers in this building.
    if not controllers:
        raise ValueError(
            "CO2 Control could not be applied because the model has no "
            "Controller:MechanicalVentilation object."
        )

    covered_zones: set[str] = set()  # HVAC zones actually served by a compatible ventilation controller.
    configured_controller_names: set[str] = set()  # Names later used to identify linked outdoor-air controllers.
    for controller in controllers:
        served_zones = _controller_zones(controller=controller, zone_lists=zone_lists)  # Expand the zone and ZoneList references on this controller.
        relevant_zones = served_zones.intersection(zone_names)  # Only modify controllers serving zones requested for CO2 control.
        if not relevant_zones:
            continue
        controller.Demand_Controlled_Ventilation = "Yes"  # Enable EnergyPlus demand-controlled ventilation for this controller.
        controller.System_Outdoor_Air_Method = "IndoorAirQualityProcedure"  # Use the indoor-air-quality procedure to calculate outdoor-air demand.
        covered_zones.update(relevant_zones)
        configured_controller_names.add(str(controller.Name).strip().casefold())

    missing_zones = zone_names.difference(covered_zones)  # Requested HVAC zones not served by any compatible controller.
    if missing_zones:
        raise ValueError(
            "CO2 Control could not be applied because these thermal zones are "
            "not served by a compatible mechanical outdoor-air controller: "
            + ", ".join(sorted(missing_zones))
        )

    logger.info(
        "Enabled native CO2 DCV on %s mechanical ventilation controller(s)",
        len(configured_controller_names),
    )
    return configured_controller_names


def _configure_economizer(
        *,
        idf: IDF,
        mechanical_controller_names: set[str],
) -> None:
    """Enable free cooling only on outdoor-air controllers used by DCV.

    DifferentialDryBulb compares outdoor and return-air dry-bulb temperatures.
    EnergyPlus can then raise outdoor-air flow above the DCV minimum when this
    provides free cooling; it retains the DCV airflow requirement otherwise.
    """
    configured = 0  # Count linked outdoor-air controllers changed for economizer operation.
    for controller in idf.idfobjects[_OUTDOOR_AIR_CONTROLLER_TYPE]:
        mechanical_controller_name = str(
            getattr(controller, "Mechanical_Ventilation_Controller_Name", ""),
        ).strip().casefold()
        if mechanical_controller_name not in mechanical_controller_names:
            continue

        controller.Economizer_Control_Type = _ECONOMIZER_CONTROL_TYPE  # Use the configured dry-bulb comparison for free cooling.
        controller.Economizer_Control_Action_Type = "ModulateFlow"  # Allow the outdoor-air controller to modulate flow.
        configured += 1

    if not configured:
        raise ValueError(
            "CO2 Control could not enable an economizer because no compatible "
            "Controller:OutdoorAir object is linked to the mechanical "
            "ventilation controller."
        )

    logger.info(
        "Enabled DifferentialDryBulb economizer on %s outdoor-air controller(s)",
        configured,
    )


def configure_co2_dcv(
    *,
    idf: IDF,
    zone_names: set[str],
    setpoint_ppm: int,
) -> IDF:
    """Configure native EnergyPlus CO2-based mechanical ventilation.

    The supplied IDF is the per-simulation working copy. Existing mechanical
    ventilation controllers are reused; no competing HVAC controller is added.
    """
    if setpoint_ppm not in {500, 600, 700, 800, 900, 1000}:
        raise ValueError(
            "CO2 setpoint must be one of 500, 600, 700, 800, 900, or 1000 ppm"
        )

    hvac_zones = {
        str(connection.Zone_Name).strip().casefold()
        for connection in idf.idfobjects["ZONEHVAC:EQUIPMENTCONNECTIONS"]
    }
    skipped_zones = {name for name in zone_names if name.casefold() not in hvac_zones}  # Zones without HVAC cannot receive this mechanical ventilation control.
    for name in skipped_zones:
        _remove_named_objects(
            idf=idf,
            object_type=_ZONE_CONTROLLER_TYPE,
            name=f"{_CONTROLLER_PREFIX} - {name}",
        )
    if skipped_zones:
        logger.info("Skipping CO2 DCV for zones without HVAC: %s", ", ".join(sorted(skipped_zones)))
    zone_names = zone_names.difference(skipped_zones)  # Continue only with zones that have HVAC equipment connections.
    if not zone_names:
        logger.info("No HVAC zones available for CO2 DCV")
        return idf

    schedule_name = _schedule_name(setpoint_ppm)  # Stable name shared by controllers using the requested ppm setpoint.
    _remove_named_objects(idf=idf, object_type=_SCHEDULE_TYPE, name=schedule_name)
    insert_idf_model(idf, _SCHEDULE_TYPE, ScheduleConstant(
        Name=schedule_name, Schedule_Type_Limits_Name="Any Number", Hourly_Value=float(setpoint_ppm)))

    for zone_name in sorted(zone_names):
        controller_name = f"{_CONTROLLER_PREFIX} - {zone_name}"  # Name identifying the generated controller for this particular zone.
        _remove_named_objects(
            idf=idf,
            object_type=_ZONE_CONTROLLER_TYPE,
            name=controller_name,
        )
        insert_idf_model(idf, _ZONE_CONTROLLER_TYPE, ZoneContaminantController(
            Name=controller_name, Zone_Name=zone_name,
            Carbon_Dioxide_Control_Availability_Schedule_Name="Always On Discrete",
            Carbon_Dioxide_Setpoint_Schedule_Name=schedule_name))

    mechanical_controller_names = _configure_mechanical_ventilation(
        idf=idf,
        zone_names=zone_names,
    )
    _configure_economizer(
        idf=idf,
        mechanical_controller_names=mechanical_controller_names,
    )
    logger.info(
        "Configured native CO2 Control for %s zones at %s ppm",
        len(zone_names),
        setpoint_ppm,
    )
    return idf
