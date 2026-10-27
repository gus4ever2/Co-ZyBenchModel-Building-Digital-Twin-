from cosimulator.idf.equipment.other_equipment_for_plants import add_other_equipment_for_plants
from cosimulator.idf.idf_file_operations import load_input_idf, set_energyplus_idd


def test_plant_loads_create_independent_actuated_equipment_per_zone():
    set_energyplus_idd()
    idf = load_input_idf()
    prefix = "Test plant "
    add_other_equipment_for_plants(idf, {"TZ1_OfficeL", "TZ2_OfficeS"}, prefix)
    add_other_equipment_for_plants(idf, {"TZ1_OfficeL", "TZ2_OfficeS"}, prefix)

    loads = [obj for obj in idf.idfobjects["OTHEREQUIPMENT"] if obj.Name.startswith(prefix)]
    schedules = [obj for obj in idf.idfobjects["SCHEDULE:CONSTANT"] if obj.Name.startswith(prefix)]
    assert len(loads) == len(schedules) == 4
    for obj in loads:
        assert obj.Schedule_Name == obj.Name
        assert obj.Design_Level == 1.0
        assert obj.Fraction_Latent == (1.0 if "Latent" in obj.Name else 0.0)
        assert obj.Fraction_Radiant == obj.Fraction_Lost == 0.0
        assert obj.Zone_or_ZoneList_or_Space_or_SpaceList_Name in {"TZ1_OfficeL", "TZ2_OfficeS"}
