export default function CustomizedScenarioInfo() {
  return (
    <div class="space-y-4">
      <h3 class="text-sm font-bold text-graphite">Customized scenario</h3>
      <p class="text-sm leading-relaxed text-graphite/60">
        Choose Customized when your experiment needs a different building or
        occupant setup instead of the reference office.
      </p>
      <div>
        <p class="text-sm font-semibold text-graphite">Building and HVAC</p>
        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
          Specify the building type, floor area, number of floors and thermal zones.
          Choose an HVAC system type, weather location and construction set.
        </p>
      </div>
      <div>
        <p class="text-sm font-semibold text-graphite">Occupants and configuration files</p>
        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
          Define occupant numbers and profiles. The form also provides file
          selections for building models, occupant profiles, trajectories and events.
        </p>
      </div>
      <div class="border-t border-warm-stone/15 pt-4">
        <p class="text-sm font-semibold text-graphite">Current availability</p>
        <p class="mt-1 text-xs leading-relaxed text-graphite/55">
          Customized scenarios are currently saved as configurations. Selecting
          files records their details; their contents are not yet imported and
          an EnergyPlus run is not launched.
        </p>
      </div>
    </div>
  );
}
