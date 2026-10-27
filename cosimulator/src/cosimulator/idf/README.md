# Preparing the simulation IDF

`build_idf` loads a fresh copy of the input IDF for each simulation and invokes
the ordered configurators in `registry.py`. Every configurator receives the IDF
and the per-run `IdfBuildContext`, and modifies that IDF in place. The context
contains the user's simulation settings and the saved construction snapshot.

The order is intentional: weather, schedule definitions, CO2, airflow and
outputs are configured first. The construction snapshot is then inserted and
assigned to surfaces, followed by the plant equipment. Construction cleanup
is last, after every package has had a chance to add references.

`co2_control` owns CO2 sources, sinks and ventilation control. `equipment` owns
the plant's sensible and latent loads.
The wall-area utility is shared with the simulation callbacks. The plant grid
and runtime simulation remain outside this IDF package.

An empty construction-set slot leaves the surface's original construction in
place. Cleanup conservatively keeps any construction or material referenced by
another IDF object, including material dependencies of retained constructions.

IDF object types with Pydantic models have one model per file. The common
`insert_idf_model` and `upsert_idf_model` functions write those models; each
package remains responsible for choosing its own replacement policy. Snapshot
objects are dynamic and preserve the EnergyPlus fields supplied by Spring.
