export default function GreenWallInfo() {
    return (
        <div class="space-y-5">
            <p class="text-sm leading-relaxed text-graphite/60">
                Configure how the green wall is represented in the simulation. The
                selected plant model, green-wall coverage, lighting level and CO₂
                exchange mode determine how the plant system interacts with the indoor
                environment.
            </p>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    Plant model
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Select the plant model used to represent the physiological behaviour
                    of the green wall. The selected model determines how plant processes
                    such as photosynthetic CO₂ uptake and respiration are calculated
                    during the simulation.
                </p>
            </div>

            <div class="border-t border-warm-stone/15 pt-4">
                <p class="text-sm font-semibold text-graphite">
                    Green wall size
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Defines how much of each thermal zone's available wall area is
                    covered by the green wall. The actual green-wall area in m² is
                    calculated separately for every thermal zone.
                </p>
            </div>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    Small — 10%
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    The green wall occupies 10% of each thermal zone's available wall
                    area. This represents a relatively limited vegetation coverage.
                </p>
            </div>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    Medium — 30%
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    The green wall occupies 30% of each thermal zone's available wall
                    area, providing a moderate level of vegetation coverage.
                </p>
            </div>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    Large — 50%
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    The green wall occupies 50% of each thermal zone's available wall
                    area, representing substantial vegetation coverage.
                </p>
            </div>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    Very large — 75%
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    The green wall occupies 75% of each thermal zone's available wall
                    area, representing extensive vegetation coverage.
                </p>
            </div>

            <div class="border-t border-warm-stone/15 pt-4">
                <p class="text-sm font-semibold text-graphite">
                    Green wall lighting
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Defines the photosynthetic photon flux density (PPFD) supplied to the
                    green wall. The selected light level is active from 08:00 to 22:00.
                    Outside this interval, PPFD is zero.
                </p>
            </div>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    Low — 50 μmol m⁻² s⁻¹
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Represents a relatively low light level available for plant
                    photosynthesis.
                </p>
            </div>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    Medium — 100 μmol m⁻² s⁻¹
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Represents a moderate lighting condition for the green wall.
                </p>
            </div>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    High — 200 μmol m⁻² s⁻¹
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Represents a high light level, increasing the light available for
                    photosynthetic activity.
                </p>
            </div>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    Very high — 300 μmol m⁻² s⁻¹
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Represents the highest available lighting level for the green wall in
                    this simulation workflow.
                </p>
            </div>

            <div class="border-t border-warm-stone/15 pt-4">
                <p class="text-sm font-semibold text-graphite">
                    Plant CO₂ exchange
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Determines which components of the plant's CO₂ exchange with the
                    thermal zone are included in the simulation.
                </p>
            </div>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    Full CO₂ exchange
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Includes both photosynthetic CO₂ uptake and respiratory CO₂
                    emissions. This represents the complete CO₂ exchange calculated by
                    the plant model.
                </p>
            </div>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    Uptake-only scenario
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Includes plant CO₂ uptake but excludes respiratory emissions. This is
                    an explicit sensitivity scenario used to isolate the effect of CO₂
                    uptake and should not be interpreted as the plant's complete
                    physiological behaviour.
                </p>
            </div>

            <div class="border-t border-warm-stone/15 pt-4">
                <p class="text-sm font-semibold text-graphite">
                    Why do these settings matter?
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Green-wall area, lighting and plant physiology determine the magnitude
                    of the plant's interaction with the indoor environment. Changing these
                    parameters allows different green-wall configurations to be compared
                    and their effect on indoor CO₂ conditions and building operation to
                    be evaluated.
                </p>
            </div>
        </div>
    );
}