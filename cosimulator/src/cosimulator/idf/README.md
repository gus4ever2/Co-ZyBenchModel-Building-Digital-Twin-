# Preparing the simulation IDF

`build_idf` loads a fresh copy of the input IDF for each simulation and invokes
the ordered configurators in `registry.py`. Every configurator receives the IDF
and the per-run `IdfBuildContext`, and modifies that IDF in place. The context
contains the user's simulation settings and the saved construction snapshot.

The order is intentional: weather, schedule definitions, occupied thermostat setpoints, CO2, airflow and
outputs are configured first. The construction snapshot is then inserted and
assigned to surfaces, followed by the native living walls. Construction cleanup
is last, after every package has had a chance to add references.

`thermostat` applies optional occupied heating/cooling setpoints to the existing
zone thermostat schedules. It preserves setback values, weekend rules, schedule
times, supply-air temperature and the source input IDF. Requests without these
settings retain the original thermostat schedules.

`co2_control` owns the building CO2 balance and ventilation control.
`living_wall` owns the plant CO2 source/sink objects, wall coverage, lighting
schedules, and per-zone `InternalMass` and native `IndoorLivingWall` objects.
The plant grid supplies only CO2 exchange to the runtime callback; EnergyPlus
calculates the wall heat and moisture exchange.
The wall-area utility is shared with the simulation callbacks. The plant grid
and runtime simulation remain outside this IDF package.

An empty construction-set slot leaves the surface's original construction in
place. Cleanup conservatively keeps any construction or material referenced by
another IDF object, including material dependencies of retained constructions.

IDF object types with Pydantic models have one model per file. The common
`insert_idf_model` and `upsert_idf_model` functions write those models; each
package remains responsible for choosing its own replacement policy. Snapshot
objects are dynamic and preserve the EnergyPlus fields supplied by Spring.
