"""Remove unreferenced construction definitions after configuration."""

from eppy.modeleditor import IDF

from cosimulator.idf.construction_set.utils.remove_unused_constructions_and_materials import (
    remove_unused_constructions_and_materials,
)
from cosimulator.idf.idf_build_context import IdfBuildContext
from cosimulator.idf.idf_configurator import IdfConfigurator


def cleanup_construction_set(idf: IDF, context: IdfBuildContext) -> None:
    """Remove unreferenced definitions after all packages have finished."""
    remove_unused_constructions_and_materials(idf)  # Run last, after all packages have had a chance to add references.


class ConstructionSetCleanupConfigurator(IdfConfigurator):
    """Remove construction definitions left unreferenced by all IDF steps."""

    def configure(self, *, idf: IDF, context: IdfBuildContext) -> None:
        cleanup_construction_set(idf=idf, context=context)
