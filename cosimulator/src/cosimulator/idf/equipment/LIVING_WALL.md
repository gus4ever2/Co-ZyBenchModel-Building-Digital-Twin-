# Native indoor living-wall coupling

For each zone with positive selected green-wall area, the IDF builder creates:

- an `InternalMass` using the existing `Interior Partition` construction, with
  surface area equal to the calculated green-wall panel area;
- an `IndoorLivingWall` attached to that internal-mass surface name. Its total
  leaf area is scaled from the selected plant profile and capped at EnergyPlus'
  documented LAI limit of 2.0;
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
