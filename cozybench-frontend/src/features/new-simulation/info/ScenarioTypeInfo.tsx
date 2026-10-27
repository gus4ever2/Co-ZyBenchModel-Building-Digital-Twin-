import { Show } from "solid-js";

type ScenarioTypeInfoProps = {
    open: boolean;
};

export default function ScenarioTypeInfo(props: ScenarioTypeInfoProps) {
    return (
        <Show when={props.open}>
            <div class="mt-4 rounded-2xl border border-citadel-blue/15 bg-cloud-white p-5 shadow-sm">
                <h3 class="text-sm font-bold text-graphite">
                    Scenario type
                </h3>

                <p class="mt-2 text-sm leading-relaxed text-graphite/60">
                    Choose how you want to configure your simulation.
                </p>

                <div class="mt-4 space-y-4">
                    <div>
                        <p class="text-sm font-semibold text-graphite">
                            Reference scenario
                        </p>

                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            Runs the predefined CozyBench reference experiment. The building
                            model, simulation configuration, and experimental conditions are
                            based on the reference setup, allowing you to reproduce the
                            baseline CozyBench simulation with minimal configuration.
                        </p>
                    </div>

                    <div>
                        <p class="text-sm font-semibold text-graphite">
                            Customized scenario
                        </p>

                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            Creates a simulation in which you can modify the available
                            configuration options. You can select the building and
                            construction configuration, climate conditions, and additional
                            simulation strategies such as plant simulation, operable windows,
                            and CO₂-based ventilation control.
                        </p>
                    </div>

                    <div class="border-t border-warm-stone/15 pt-4">
                        <p class="text-sm font-semibold text-graphite">
                            Which should I choose?
                        </p>

                        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                            Use the Reference scenario when you want to reproduce or use the
                            standard CozyBench experiment as a baseline. Use the Customized
                            scenario when you want to investigate how changes to the building
                            or control strategies affect energy consumption and indoor
                            environmental conditions.
                        </p>
                    </div>
                </div>
            </div>
        </Show>
    );
}
