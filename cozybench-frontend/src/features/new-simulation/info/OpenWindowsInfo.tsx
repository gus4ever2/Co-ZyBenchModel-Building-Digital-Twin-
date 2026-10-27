export default function OpenWindowsInfo() {
    return (
        <div class="space-y-5">
            <p class="text-sm leading-relaxed text-graphite/60">
                Configure the automatic window-opening strategy used for natural
                ventilation. Window operation depends on indoor CO₂ concentration and
                temperature conditions, allowing outdoor air to enter the thermal zones
                when the configured conditions are satisfied.
            </p>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    Window opening strategy
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Defines how the opening factor of the operable windows changes once
                    the conditions for natural ventilation are satisfied.
                </p>
            </div>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    Linear
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Gradually adjusts the window opening factor according to the
                    temperature condition. Instead of immediately switching between
                    closed and fully open, the opening level varies progressively within
                    the configured temperature margin.
                </p>
            </div>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    On–Off
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Uses a binary opening strategy. When all required conditions are
                    satisfied, the windows are fully opened. Otherwise, they remain
                    closed.
                </p>
            </div>

            <div class="border-t border-warm-stone/15 pt-4">
                <p class="text-sm font-semibold text-graphite">
                    CO₂ concentration threshold
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Defines the indoor CO₂ concentration at which the CO₂ condition for
                    automatic window opening becomes active. Concentration is expressed
                    in parts per million (ppm).
                </p>
            </div>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    500 ppm
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Uses the lowest available CO₂ threshold. The ventilation strategy can
                    respond at comparatively low indoor CO₂ concentrations.
                </p>
            </div>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    600 ppm
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Uses a low CO₂ threshold, allowing automatic window opening to respond
                    relatively early as indoor CO₂ concentration increases.
                </p>
            </div>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    700 ppm
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Uses an intermediate-low CO₂ threshold for triggering the CO₂
                    condition of the natural-ventilation strategy.
                </p>
            </div>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    800 ppm
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Uses an intermediate CO₂ threshold, providing a balance between
                    earlier window operation and allowing some increase in indoor CO₂
                    concentration before ventilation is requested.
                </p>
            </div>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    900 ppm
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Uses a higher CO₂ threshold, so the CO₂ condition is reached later as
                    indoor concentration increases.
                </p>
            </div>

            <div>
                <p class="text-sm font-semibold text-graphite">
                    1,000 ppm
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Uses the highest available CO₂ threshold. Window opening due to the
                    CO₂ condition is therefore delayed until a higher indoor
                    concentration is reached.
                </p>
            </div>

            <div class="border-t border-warm-stone/15 pt-4">
                <p class="text-sm font-semibold text-graphite">
                    Temperature margin from HVAC setpoint
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    Defines the temperature margin used together with the HVAC setpoint
                    when deciding whether automatic window opening is permitted. This
                    prevents the natural-ventilation strategy from responding only to CO₂
                    concentration while ignoring the thermal condition of the zone.
                </p>
            </div>

            <div class="border-t border-warm-stone/15 pt-4">
                <p class="text-sm font-semibold text-graphite">
                    Why do these settings matter?
                </p>

                <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                    The CO₂ threshold determines when additional ventilation is requested,
                    while the temperature condition determines whether opening the
                    windows is thermally appropriate. The opening strategy then determines
                    whether the windows open progressively or switch directly between
                    closed and fully open.
                </p>
            </div>
        </div>
    );
}