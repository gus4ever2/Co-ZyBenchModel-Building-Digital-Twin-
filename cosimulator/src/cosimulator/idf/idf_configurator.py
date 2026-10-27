"""Small callable base used by the ordered IDF configuration registry."""

from eppy.modeleditor import IDF

from cosimulator.idf.idf_build_context import IdfBuildContext


class IdfConfigurator:
    """Base implementation for one ordered, in-place IDF configuration step."""

    def __call__(self, idf: IDF, context: IdfBuildContext) -> None:
        """Keep the registry concise while delegating behaviour to ``configure``."""
        self.configure(idf=idf, context=context)

    def configure(self, *, idf: IDF, context: IdfBuildContext) -> None:
        """Apply this package's configuration to the current working IDF.

        Concrete packages override this ordinary method; no abstract-class
        mechanism is needed because the registry contains only concrete steps.
        """
        raise NotImplementedError("Each IDF configurator implements configure")
