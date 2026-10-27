from eppy.modeleditor import IDF

from cosimulator.idf.airflow.add_airflow_cracks import add_airflow_cracks
from cosimulator.idf.airflow.add_open_windows import add_open_windows
from cosimulator.idf.airflow.find_exterior_windows_by_zone import (
    find_interior_opening_names,
)
from cosimulator.idf.utils.find_every_thermal_zone_name import find_every_thermal_zone_name
from cosimulator.idf.idf_file_operations import load_input_idf, set_energyplus_idd


def test_airflow_network_connects_interior_openings_once() -> None:
    set_energyplus_idd()
    idf: IDF = load_input_idf()
    zone_names = find_every_thermal_zone_name(idf=idf)
    expected_interior_openings = find_interior_opening_names(idf=idf)

    idf = add_airflow_cracks(idf=idf)
    idf = add_open_windows(idf=idf, zone_names=zone_names)

    afn_surface_names = {
        surface.Surface_Name
        for surface in idf.idfobjects["AirflowNetwork:MultiZone:Surface"]
    }
    assert expected_interior_openings <= afn_surface_names

    component_names = {
        component.Name
        for component in idf.idfobjects[
            "AirflowNetwork:MultiZone:Component:SimpleOpening"
        ]
    }
    assert component_names == {"Operable Exterior Window", "Interior Door and Window"}

    afn_zone_names = {
        zone.Zone_Name
        for zone in idf.idfobjects["AirflowNetwork:MultiZone:Zone"]
    }
    assert zone_names <= afn_zone_names
