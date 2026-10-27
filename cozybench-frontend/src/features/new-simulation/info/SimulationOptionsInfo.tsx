export default function SimulationOptionsInfo() {
    return (
        <>

                <h3 class="text-sm font-bold text-graphite">
                    Simulation options
                </h3>

                <p class="mt-2 text-sm leading-relaxed text-graphite/60">
                    Configure the optional features that will be included in this
                    simulation. These settings define which additional control strategies
                    or digital-twin components will be active during the experiment.
                </p>

                <div class="mt-5 space-y-4">
                    <InfoSection title="Simulation name">
                        Give the simulation a short descriptive name. This name is used to
                        identify the simulation later when reviewing or comparing results.
                    </InfoSection>

                    <InfoSection title="Green wall simulation">
                        Enable the plant digital twin and include a green wall in the
                        simulation. Additional options allow you to configure the plant
                        model, green-wall size or coverage, lighting conditions, and the
                        plant–environment exchange model.
                    </InfoSection>

                    <InfoSection title="Automatic open windows">
                        Enable automatic window operation to simulate natural ventilation.
                        Window opening can respond to indoor CO₂ concentration and
                        temperature conditions. The opening strategy, CO₂ threshold, and
                        temperature margin can then be configured.
                    </InfoSection>

                    <InfoSection title="CO₂ control">
                        Enable demand-controlled mechanical ventilation based on indoor CO₂
                        concentration. EnergyPlus adjusts the outdoor-air supply according
                        to the specified CO₂ setpoint.
                    </InfoSection>

                    <div class="border-t border-warm-stone/15 pt-4">
                        <InfoSection title="Combining options">
                            These options can be enabled independently or combined in the
                            same simulation. Different configurations can later be compared
                            to evaluate their effect on energy consumption and indoor
                            environmental conditions.
                        </InfoSection>
                    </div>
                </div>
                </>
    );
}

function InfoSection(props: {
    title: string;
    children: string;
}) {
    return (
        <div>
            <p class="text-sm font-semibold text-graphite">
                {props.title}
            </p>

            <p class="mt-1 text-xs leading-relaxed text-graphite/55">
                {props.children}
            </p>
        </div>
    );
}
