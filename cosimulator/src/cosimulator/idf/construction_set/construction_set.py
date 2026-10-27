"""Apply the construction-set snapshot to the current IDF."""

from eppy.modeleditor import IDF

from cosimulator.idf.construction_set.add_snapshot_objects import add_idf_objects
from cosimulator.idf.construction_set.change_construction_set import change_construction_set
from cosimulator.idf.idf_build_context import IdfBuildContext
from cosimulator.idf.idf_configurator import IdfConfigurator


def construction_set(idf: IDF, context: IdfBuildContext) -> None:
    """Insert the snapshot, then assign its constructions to building surfaces."""
    preparation = context.idf_preparation  # Use the snapshot saved with this run, not the live workspace.
    add_idf_objects(idf=idf, idf_objects=preparation.idf_objects)  # Insert the snapshot's material and construction definitions first.
    change_construction_set(idf=idf, construction_set=preparation.construction_set)  # Assign those construction names to the matching surface categories.


class ConstructionSetConfigurator(IdfConfigurator):
    """Insert and assign the construction snapshot selected for this run."""

    def configure(self, *, idf: IDF, context: IdfBuildContext) -> None:
        construction_set(idf=idf, context=context)
