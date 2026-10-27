"""Map EnergyPlus meter names to their persisted simulation result fields."""

from .meters import Meter


METER_MAPPING: dict[str, Meter] = {
    "Heating:Electricity": Meter(result_field="heating_electricity_j"),
    "Cooling:Electricity": Meter(result_field="cooling_electricity_j"),
    "Electricity:HVAC": Meter(result_field="hvac_electricity_j"),
}
