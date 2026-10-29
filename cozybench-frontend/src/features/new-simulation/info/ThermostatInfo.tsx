export default function ThermostatInfo() {
  return (
    <>
      <h3 class="text-sm font-bold text-graphite">Temperature setpoints</h3>
      <p class="mt-2 text-sm leading-relaxed text-graphite/60">
        Choose the occupied heating and cooling thresholds for zones with HVAC.
        The defaults are 21°C for heating and 24°C for cooling.
        Heating must remain lower than cooling.
      </p>
      <p class="mt-3 text-sm leading-relaxed text-graphite/60">
        The existing schedule determines when these temperatures apply.
        Heating setback remains 15°C and cooling setback remains 30°C.
        This step does not change operating times, ventilation or supply-air temperature.
      </p>
      <p class="mt-3 text-sm leading-relaxed text-graphite/60">
        These are control thresholds, not guaranteed room temperatures.
        The simulated temperature also depends on weather, heat gains, airflow and the living wall.
      </p>
    </>
  );
}
