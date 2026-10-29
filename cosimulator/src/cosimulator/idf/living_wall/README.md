# Native indoor living-wall coupling

For each zone with positive selected green-wall area, the IDF builder creates:

- an `InternalMass` using the existing `Interior Partition` construction, with
  surface area equal to the calculated green-wall panel area;
- an `IndoorLivingWall` attached to that internal-mass surface name. Its total
  leaf area is scaled from the selected plant profile. The existing application
  cap of LAI 2.0 is retained by this refactor; it is not an EnergyPlus 26.1 limit;
- an availability schedule and an LED intensity schedule active from 08:00 to
  22:00. The nominal PPFD comes from the selected lighting preset.

EnergyPlus' native `IndoorLivingWall` model computes the plant surface heat and
moisture exchange. PhotosynEB remains active in the Python timestep callback
only for CO2 sink/source exchange. Its thermal flux fields are retained as
diagnostics and are not added to the zone a second time.

The lighting preset supplies PPFD, but the user has not specified grow-light
wattage. The generated wall therefore uses zero LED nominal power, so no
unsupported electricity or lamp heat is invented and counted alongside the
lighting already defined by the building IDF. Provide fixture power if the
wall's LED electricity is to be represented explicitly.

Package layout:

- `configurator.py`: load the selected plant geometry and configure native walls.
- `living_wall.py`: create one backing internal mass and living wall per covered zone.
- `geometry.py`: calculate panel coverage from net wall area.
- `schedules.py`: shared lighting hours, object names, and LED schedule.
- `plant_co2.py` and `co2_exchange.py`: create independent CO2 sinks and sources.
- `model/`: the CO2 source/sink input model.

The registry keeps CO2 setup before ventilation control and native wall setup
after the construction snapshot. Legacy plant `OtherEquipment` objects are
removed during preparation; no grid-derived sensible or latent loads are added.

The simulation request accepts `evapotranspiration_method`: `Penman-Monteith`
(the compatible default) or `Stanghellini`. Both use the same wall geometry,
lighting, and independent CO2 runtime control. Native wall temperature,
sensible heat, latent heat, ET, PPFD, and LED power are requested at every
timestep in the EnergyPlus output files for model comparison.
