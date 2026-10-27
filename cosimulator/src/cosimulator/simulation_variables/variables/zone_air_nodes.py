from __future__ import annotations

from dataclasses import dataclass, field

from eppy.modeleditor import IDF


@dataclass(slots=True, frozen=True)
class ZoneAirNodes:
    supply: tuple[str, ...] = ()
    return_air: tuple[str, ...] = ()


def find_zone_air_nodes(*, idf: IDF) -> dict[str, ZoneAirNodes]:
    """Resolve each zone's supply and return node names from its prepared IDF.

    The EnergyPlus outputs are keyed by node name.  A zone can refer directly
    to a node or to a NodeList, therefore the resolution happens once before
    the API handles are requested.
    """
    node_lists = {
        str(node_list.Name).strip(): tuple(
            str(getattr(node_list, field)).strip()
            for field in node_list.fieldnames
            if field.startswith("Node_")
            and field.endswith("_Name")
            and str(getattr(node_list, field)).strip()
        )
        for node_list in idf.idfobjects["NODELIST"]
        if str(node_list.Name).strip()
    }

    def resolve(value: object) -> tuple[str, ...]:
        name = str(value or "").strip()
        if not name:
            return ()
        return node_lists.get(name, (name,))

    return {
        str(connection.Zone_Name).strip(): ZoneAirNodes(
            supply=resolve(connection.Zone_Air_Inlet_Node_or_NodeList_Name),
            return_air=resolve(connection.Zone_Return_Air_Node_or_NodeList_Name),
        )
        for connection in idf.idfobjects["ZONEHVAC:EQUIPMENTCONNECTIONS"]
        if str(connection.Zone_Name).strip()
    }
