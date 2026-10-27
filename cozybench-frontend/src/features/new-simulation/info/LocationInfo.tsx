export function LocationInfo  () {
    return (
        <>
                <h3 class="text-sm font-bold text-graphite">
                    Location and climate
                </h3>

                <p class="mt-2 text-sm leading-relaxed text-graphite/60">
                    Select the weather and climate conditions used by the building
                    simulation. The selected location determines the EnergyPlus weather
                    data, including outdoor temperature, humidity, solar radiation and
                    wind conditions.
                </p>

                <div class="mt-5 space-y-4">
                    <div>
                        <p class="text-sm font-semibold text-graphite">
                            Paris — ASHRAE Climate Zone 4A · Mixed–Humid
                        </p>
                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            Represents a mixed and humid climate with both heating and cooling
                            periods.
                        </p>
                    </div>

                    <div>
                        <p class="text-sm font-semibold text-graphite">
                            Andravida — ASHRAE Climate Zone 3A · Warm–Humid
                        </p>
                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            Represents a warm and humid climate where cooling, ventilation
                            and humidity conditions have an important influence on building
                            performance.
                        </p>
                    </div>

                    <div>
                        <p class="text-sm font-semibold text-graphite">
                            Los Angeles — ASHRAE Climate Zone 3B · Warm–Dry
                        </p>
                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            Represents a warm and dry climate, useful for evaluating cooling
                            and natural-ventilation strategies under lower outdoor humidity.
                        </p>
                    </div>

                    <div>
                        <p class="text-sm font-semibold text-graphite">
                            Mumbai — ASHRAE Climate Zone 0A · Extremely Hot–Humid
                        </p>
                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            Represents extremely hot and humid conditions, with significant
                            cooling and ventilation requirements.
                        </p>
                    </div>

                    <div>
                        <p class="text-sm font-semibold text-graphite">
                            Scranton — ASHRAE Climate Zone 5A · Cool–Humid
                        </p>
                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            Represents a cool and humid climate with stronger heating
                            requirements.
                        </p>
                    </div>

                    <div>
                        <p class="text-sm font-semibold text-graphite">
                            Beijing — ASHRAE Climate Zone 4A · Mixed–Humid
                        </p>
                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            Represents a mixed climate with cold winters and hot summers,
                            useful for evaluating both heating and cooling performance.
                        </p>
                    </div>

                    <div class="border-t border-warm-stone/15 pt-4">
                        <p class="text-sm font-semibold text-graphite">
                            ASHRAE climate zones
                        </p>
                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            ASHRAE climate zones classify locations according to thermal and
                            moisture conditions. The number identifies the thermal
                            classification, while A represents humid climates, B dry climates
                            and C marine climates.
                        </p>
                    </div>

                    <div>
                        <p class="text-sm font-semibold text-graphite">
                            Why does location matter?
                        </p>
                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            The same building and control strategy can produce different
                            heating, cooling, ventilation and indoor-environmental results
                            under different weather conditions.
                        </p>
                    </div>
                </div>
            </>
    );
};
