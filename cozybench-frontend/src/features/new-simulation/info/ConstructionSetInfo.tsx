export function ConstructionSetInfo() {
    return (
        <>
                <h3 class="text-sm font-bold text-graphite">
                    Construction set
                </h3>

                <p class="mt-2 text-sm leading-relaxed text-graphite/60">
                    A construction set defines the constructions used by the building
                    envelope, including walls, floors, roofs, windows, doors and
                    ground-contact surfaces. The selected construction set affects heat
                    transfer through the envelope and therefore influences heating,
                    cooling and indoor thermal conditions.
                </p>

                <div class="mt-5 space-y-4">
                    <div>
                        <p class="text-sm font-semibold text-graphite">
                            Predefined construction sets
                        </p>

                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            These are predefined ASHRAE 189.1-2009 office construction sets
                            associated with different climate zones. They provide ready-to-use
                            building-envelope configurations for running reference
                            simulations.
                        </p>
                    </div>

                    <div>
                        <p class="text-sm font-semibold text-graphite">
                            ASHRAE Climate Zone 1
                        </p>

                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            Reference office envelope for very hot climates where cooling
                            demand dominates building operation.
                        </p>
                    </div>

                    <div>
                        <p class="text-sm font-semibold text-graphite">
                            ASHRAE Climate Zone 2
                        </p>

                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            Reference office envelope for hot climates with predominantly
                            cooling-driven thermal requirements.
                        </p>
                    </div>

                    <div>
                        <p class="text-sm font-semibold text-graphite">
                            ASHRAE Climate Zone 3
                        </p>

                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            Reference office envelope for warm climates, where cooling is
                            important but seasonal heating requirements are also present.
                        </p>
                    </div>

                    <div>
                        <p class="text-sm font-semibold text-graphite">
                            ASHRAE Climate Zone 4
                        </p>

                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            Reference office envelope for mixed climates where both heating
                            and cooling performance are important.
                        </p>
                    </div>

                    <div>
                        <p class="text-sm font-semibold text-graphite">
                            ASHRAE Climate Zone 5
                        </p>

                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            Reference office envelope for cool climates, with greater
                            emphasis on reducing heat loss while still supporting summer
                            cooling.
                        </p>
                    </div>

                    <div>
                        <p class="text-sm font-semibold text-graphite">
                            ASHRAE Climate Zone 6
                        </p>

                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            Reference office envelope for cold climates, where insulation
                            and winter thermal performance become increasingly important.
                        </p>
                    </div>

                    <div>
                        <p class="text-sm font-semibold text-graphite">
                            ASHRAE Climate Zones 7–8
                        </p>

                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            Reference office envelope for very cold and subarctic climates,
                            where reducing heat transfer through the building envelope is
                            particularly important.
                        </p>
                    </div>

                    <div class="border-t border-warm-stone/15 pt-4">
                        <p class="text-sm font-semibold text-graphite">
                            My construction sets
                        </p>

                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            These are construction sets created in the Building Digital Twin
                            editor. They allow you to use your own materials, construction
                            assemblies and envelope configuration in the simulation.
                        </p>
                    </div>

                    <div>
                        <p class="text-sm font-semibold text-graphite">
                            Which should I choose?
                        </p>

                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            Use a predefined construction set when you want a standard
                            ASHRAE-based reference envelope. Use one of your own construction
                            sets when you want to evaluate a specific building design or
                            compare alternative envelope configurations.
                        </p>
                    </div>
                </div>
            </>
    );
};