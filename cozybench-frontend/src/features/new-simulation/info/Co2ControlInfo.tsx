export default function Co2ControlInfo() {
  return (
    <>
      <h3 class="text-sm font-bold text-graphite">CO₂ control</h3>
      <p class="mt-2 text-sm leading-relaxed text-graphite/60">
        Enable EnergyPlus demand-controlled mechanical ventilation. The HVAC
        system adjusts its outdoor-air supply according to indoor CO₂ concentration.
      </p>
      <div class="mt-5 space-y-4">
        <div>
          <p class="text-sm font-semibold text-graphite">CO₂ setpoint</p>
          <p class="mt-1 text-xs leading-relaxed text-graphite/55">
            Choose a target concentration between 500 and 1,000 ppm (parts per
            million). This target controls mechanical ventilation; it is not a
            fixed concentration or a guaranteed maximum.
          </p>
        </div>
        <div>
          <p class="text-sm font-semibold text-graphite">Lower and higher targets</p>
          <p class="mt-1 text-xs leading-relaxed text-graphite/55">
            A lower target generally requires more outdoor air and can increase
            heating or cooling demand. The achieved concentration depends on
            occupant CO₂ emissions, plant CO₂ exchange, outdoor CO₂ and the
            available ventilation capacity.
          </p>
        </div>
        <div>
          <p class="text-sm font-semibold text-graphite">Zones with HVAC</p>
          <p class="mt-1 text-xs leading-relaxed text-graphite/55">
            Control applies to thermal zones served by compatible mechanical
            outdoor-air systems. Zones without HVAC are skipped.
          </p>
        </div>
        <div>
          <p class="text-sm font-semibold text-graphite">Plants and the green wall</p>
          <p class="mt-1 text-xs leading-relaxed text-graphite/55">
            When a green wall is enabled, its modeled CO₂ exchange contributes
            to the indoor concentration used by ventilation control. Net plant
            uptake can reduce ventilation demand, while net CO₂ release from
            respiration can increase it. The effect depends on lighting, plant
            properties, wall coverage and the selected exchange mode; plants
            do not replace the ventilation system.
          </p>
        </div>
        <div>
          <p class="text-sm font-semibold text-graphite">Economizer (free cooling)</p>
          <p class="mt-1 text-xs leading-relaxed text-graphite/55">
            CO₂ control also enables a differential dry-bulb economizer on
            compatible outdoor-air controllers. It compares outdoor and
            return-air temperatures and can increase outdoor airflow when
            conditions allow free cooling. Airflow may therefore exceed the
            amount required for CO₂ control alone.
          </p>
        </div>
        <div class="border-t border-warm-stone/15 pt-4">
          <p class="text-sm font-semibold text-graphite">Combining options</p>
          <p class="mt-1 text-xs leading-relaxed text-graphite/55">
            CO₂ control is separate from automatic window opening. It can be
            combined with open windows and a green wall in the same simulation.
          </p>
        </div>
      </div>
    </>
  );
}
