# PhotosynEB plant equipment and CO2 coupling

CozyBench does not use EnergyPlus `IndoorLivingWall`. When a plant simulation
is selected, the IDF builder creates two `OtherEquipment` objects per eligible
zone, both with `Fuel Type = None` and `Design Level = 1 W`:

- `Plant Latent Load`: `Fraction Latent = 1`; it applies the water-vapour
  energy flux calculated by PhotosynEB.
- `Plant Sensible Load`: fully convective; it applies the signed leaf-to-air
  sensible flux calculated by PhotosynEB.

Python actuates their `Schedule:Constant` values at every EnergyPlus timestep.
Because the design level is 1 W, a schedule value is the physical load in W.
Neither object is a real appliance or adds electric end-use energy.

The existing plant CO2 sink/source schedules remain independent of these
thermal loads. They receive the PhotosynEB CO2 exchange in m3/s.

Plant response grids must be schema version 5. Each grid point includes net
CO2 exchange, transpiration, latent and sensible leaf fluxes, plus shortwave,
net-radiation and longwave terms for diagnostic energy-balance checks. The
runtime applies only latent and leaf-to-air convective fluxes to the zone;
radiative diagnostics are not added as internal gains because that would
double-count the radiation already balanced by the leaf model.

The current model does not create a PVC backing, `InternalMass`, LED object or
`IndoorLivingWall`. If real LED electrical power is introduced later, it must
be modeled separately as a physical lighting end use rather than hidden in the
plant thermal loads.
