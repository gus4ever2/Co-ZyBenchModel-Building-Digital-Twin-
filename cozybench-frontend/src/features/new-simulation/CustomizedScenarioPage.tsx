import { Link } from "@tanstack/solid-router";
import {
  Building2,
  Fan,
  FileUp,
  Play,
  RotateCcw,
  Upload,
  Users,
  X,
} from "lucide-solid";
import { For, Show, createSignal, type JSX } from "solid-js";
import { createMutation, createQuery } from "@tanstack/solid-query";
import WorkspaceHeader from "../../components/layout/WorkspaceHeader";
import WorkspaceIntroPanel from "../../components/layout/WorkspaceIntroPanel";
import {
  loadSimulationConstructionSets,
  startCustomSimulation,
} from "./newSimulationService";

const buildingTypes = [
  { id: "small-office", name: "Small Office" },
  { id: "large-office", name: "Large Office" },
  { id: "hospital", name: "Hospital" },
  { id: "retail", name: "Retail Store" },
  { id: "school", name: "School" },
];

const hvacSystems = [
  { id: "cav", name: "CAV", description: "Constant Air Volume" },
  { id: "vav", name: "VAV", description: "Variable Air Volume" },
  { id: "vrf", name: "VRF", description: "Variable Refrigerant Flow" },
];

type UploadKey =
  "buildingModel" | "occupantProfiles" | "trajectories" | "events";
type UploadedFiles = Partial<Record<UploadKey, File>>;

export default function CustomizedScenarioPage() {
  const [files, setFiles] = createSignal<UploadedFiles>({});
  const [building, setBuilding] = createSignal({
    name: "",
    type: "",
    area: 0,
    floors: 0,
    zones: 0,
  });
  const [occupants, setOccupants] = createSignal({
    count: 1,
    profiles: [] as string[],
  });
  const [profileInput, setProfileInput] = createSignal("");
  const [hvacSystem, setHvacSystem] = createSignal("");
  const [city, setCity] = createSignal("andravida");
  const [constructionSet, setConstructionSet] = createSignal("");
  const constructionSets = createQuery(() => ({
    queryKey: ["new-simulation", "construction-sets"],
    queryFn: loadSimulationConstructionSets,
  }));
  const submit = createMutation(() => ({ mutationFn: startCustomSimulation }));

  const setFile = (key: UploadKey, file?: File) =>
    setFiles((current) => ({ ...current, [key]: file }));

  const addProfile = () => {
    const value = profileInput().trim();
    if (!value) return;
    setOccupants((current) => ({
      ...current,
      profiles: [...current.profiles, value],
    }));
    setProfileInput("");
  };

  return (
    <section class="mx-auto flex h-[calc(100vh-10rem)] min-h-0 w-full max-w-6xl flex-col gap-4 lg:h-[calc(100vh-4rem)]">
      <WorkspaceHeader
        eyebrow="Customized scenario"
        title="Configure simulation"
        backTo="/new-simulation"
      />

      <main class="cozy-scrollbar min-h-0 flex-1 overflow-y-auto rounded-3xl border border-cloud-white/60 bg-cloud-white/95 p-5 shadow-2xl shadow-black/15 sm:p-7">
        <WorkspaceIntroPanel
          eyebrow="Custom configuration"
          title="Customized scenario"
          description="Customize your simulation scenario by importing files or using manual configuration."
        />

        <form
          class="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!building().name.trim() || !constructionSet()) return;
            submit.mutate({
              name: building().name.trim(),
              city: city(),
              constructionSet: constructionSet(),
              configuration: {
                building: building(),
                occupants: occupants(),
                hvacSystem: hvacSystem(),
                files: Object.fromEntries(
                  Object.entries(files()).map(([key, file]) => [
                    key,
                    file
                      ? {
                          name: file.name,
                          size: file.size,
                          mediaType: file.type,
                        }
                      : null,
                  ]),
                ),
              },
            });
          }}
        >
          <Section
            number="0"
            title="Scenario identity"
            icon={<Building2 class="size-5" />}
          >
            <div class="grid gap-4 md:grid-cols-2">
              <Field label="City">
                <select
                  class="form-input"
                  value={city()}
                  onChange={(event) => setCity(event.currentTarget.value)}
                >
                  <option value="andravida">Andravida</option>
                  <option value="paris">Paris</option>
                  <option value="beijing">Beijing</option>
                </select>
              </Field>
              <Field label="Construction set">
                <select
                  class="form-input"
                  value={constructionSet()}
                  onChange={(event) =>
                    setConstructionSet(event.currentTarget.value)
                  }
                >
                  <option value="">Select construction set</option>
                  <For each={[true, false]}>
                    {(isDefault) => (
                      <optgroup label={isDefault ? "Default construction sets" : "My construction sets"}>
                        <For each={(constructionSets.data ?? []).filter(item => !!item.defaultOption === isDefault)}>
                          {item => <option value={isDefault ? item.name : item.id}>{item.displayName ?? item.name}</option>}
                        </For>
                      </optgroup>
                    )}
                  </For>
                </select>
              </Field>
            </div>
          </Section>
          <Section
            number="1"
            title="Import configuration files"
            icon={<FileUp class="size-5" />}
          >
            <div class="grid gap-5 md:grid-cols-2">
              <FileUpload
                label="Building Model"
                accept=".idf,.json"
                description="Upload IDF or NGSI-LD file"
                file={files().buildingModel}
                onChange={(file) => setFile("buildingModel", file)}
              />
              <FileUpload
                label="Occupant Profiles"
                accept=".csv,.json"
                description="Upload CSV or JSON file"
                file={files().occupantProfiles}
                onChange={(file) => setFile("occupantProfiles", file)}
              />
            </div>
            <Show when={Object.values(files()).filter(Boolean).length > 0}>
              <div class="mt-5 rounded-xl border border-warm-stone/20 bg-sky-mist/10 p-4">
                <p class="text-sm font-bold text-graphite">Uploaded files</p>
                <ul class="mt-2 space-y-1 text-xs text-graphite/55">
                  <For
                    each={Object.entries(files()).filter(([, file]) =>
                      Boolean(file),
                    )}
                  >
                    {([key, file]) => (
                      <li>
                        {key}: {file?.name}
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            </Show>
          </Section>

          <Section
            number="2"
            title="Manual configuration"
            icon={<Building2 class="size-5" />}
          >
            <ConfigurationGroup
              icon={<Building2 class="size-5" />}
              title="Building Configuration"
            >
              <div class="grid gap-4 md:grid-cols-2">
                <Field label="Building Name">
                  <input
                    class="form-input"
                    value={building().name}
                    onInput={(e) =>
                      setBuilding((v) => ({
                        ...v,
                        name: e.currentTarget.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Building Type">
                  <select
                    class="form-input"
                    value={building().type}
                    onChange={(e) =>
                      setBuilding((v) => ({
                        ...v,
                        type: e.currentTarget.value,
                      }))
                    }
                  >
                    <option value="">Select type</option>
                    <For each={buildingTypes}>
                      {(type) => <option value={type.id}>{type.name}</option>}
                    </For>
                  </select>
                </Field>
                <Field label="Area (m²)">
                  <input
                    class="form-input"
                    type="number"
                    min="0"
                    value={building().area}
                    onInput={(e) =>
                      setBuilding((v) => ({
                        ...v,
                        area: e.currentTarget.valueAsNumber,
                      }))
                    }
                  />
                </Field>
                <Field label="Number of Floors">
                  <input
                    class="form-input"
                    type="number"
                    min="1"
                    value={building().floors}
                    onInput={(e) =>
                      setBuilding((v) => ({
                        ...v,
                        floors: e.currentTarget.valueAsNumber,
                      }))
                    }
                  />
                </Field>
                <Field label="Number of Zones">
                  <input
                    class="form-input"
                    type="number"
                    min="1"
                    value={building().zones}
                    onInput={(e) =>
                      setBuilding((v) => ({
                        ...v,
                        zones: e.currentTarget.valueAsNumber,
                      }))
                    }
                  />
                </Field>
              </div>
              <button
                type="button"
                onClick={() =>
                  setBuilding({
                    name: "",
                    type: "",
                    area: 0,
                    floors: 0,
                    zones: 0,
                  })
                }
                class="mt-4 flex items-center gap-2 text-sm font-semibold text-red-wine hover:underline"
              >
                <RotateCcw class="size-4" /> Reset
              </button>
            </ConfigurationGroup>

            <ConfigurationGroup
              icon={<Users class="size-5" />}
              title="Occupant Configuration"
            >
              <div class="grid gap-4 md:grid-cols-2">
                <Field label="Number of Occupants">
                  <input
                    class="form-input"
                    type="number"
                    min="1"
                    value={occupants().count}
                    onInput={(e) =>
                      setOccupants((v) => ({
                        ...v,
                        count: e.currentTarget.valueAsNumber,
                      }))
                    }
                  />
                </Field>
                <Field label="Add Occupant Profile">
                  <div class="flex gap-2">
                    <input
                      class="form-input"
                      value={profileInput()}
                      placeholder="Enter profile type"
                      onInput={(e) => setProfileInput(e.currentTarget.value)}
                    />
                    <button
                      type="button"
                      onClick={addProfile}
                      class="rounded-xl bg-citadel-blue px-4 font-bold text-cloud-white hover:bg-citadel-blue/85"
                    >
                      Add
                    </button>
                  </div>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <For each={occupants().profiles}>
                      {(profile, index) => (
                        <span class="flex items-center gap-1 rounded-full bg-sky-mist/25 px-2.5 py-1 text-xs text-graphite">
                          {profile}
                          <button
                            type="button"
                            aria-label={`Remove ${profile}`}
                            onClick={() =>
                              setOccupants((v) => ({
                                ...v,
                                profiles: v.profiles.filter(
                                  (_, i) => i !== index(),
                                ),
                              }))
                            }
                          >
                            <X class="size-3" />
                          </button>
                        </span>
                      )}
                    </For>
                  </div>
                </Field>
                <FileUpload
                  label="Occupant trajectories"
                  accept=".csv"
                  description="Upload CSV file"
                  file={files().trajectories}
                  onChange={(file) => setFile("trajectories", file)}
                />
                <FileUpload
                  label="Events and schedules"
                  accept=".json"
                  description="Upload JSON file"
                  file={files().events}
                  onChange={(file) => setFile("events", file)}
                />
              </div>
            </ConfigurationGroup>

            <ConfigurationGroup
              icon={<Fan class="size-5" />}
              title="HVAC Configuration"
            >
              <Field label="HVAC System Type">
                <select
                  class="form-input"
                  value={hvacSystem()}
                  onChange={(e) => setHvacSystem(e.currentTarget.value)}
                >
                  <option value="">Select HVAC system</option>
                  <For each={hvacSystems}>
                    {(system) => (
                      <option value={system.id}>
                        {system.name} - {system.description}
                      </option>
                    )}
                  </For>
                </select>
              </Field>
            </ConfigurationGroup>
          </Section>

          <Section
            number="3"
            title="Start simulation"
            icon={<Play class="size-5" />}
          >
            <Show when={submit.isSuccess}>
              <div class="mb-4 rounded-xl border border-olive-moss/25 bg-olive-moss/10 p-4 text-sm text-olive-moss">
                The customized scenario was validated and stored by Spring.
                Python execution is intentionally not enabled for this scenario
                yet.
              </div>
            </Show>
            <Show when={submit.isError}>
              <div class="mb-4 rounded-xl border border-red-wine/25 bg-red-wine/5 p-4 text-sm text-red-wine">
                The customized scenario could not be stored. Select a
                construction set and complete the required fields.
              </div>
            </Show>
            <button
              type="submit"
              disabled={
                submit.isPending ||
                !building().name.trim() ||
                !constructionSet()
              }
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-citadel-blue py-3 font-bold text-cloud-white shadow-lg shadow-citadel-blue/15 hover:bg-citadel-blue/85 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Play class="size-4" />{" "}
              {submit.isPending
                ? "Saving scenario…"
                : "Create customized simulation"}
            </button>
          </Section>
        </form>

        <Link
          to="/new-simulation"
          class="mt-5 inline-flex text-sm font-semibold text-citadel-blue hover:underline"
        >
          Change scenario type
        </Link>
      </main>
    </section>
  );
}

function Section(props: {
  number: string;
  title: string;
  icon: JSX.Element;
  children: JSX.Element;
}) {
  return (
    <section class="rounded-2xl border border-warm-stone/20 bg-cloud-white p-5 shadow-sm sm:p-6">
      <div class="mb-5 flex items-center gap-3 border-b border-warm-stone/15 pb-4">
        <span class="grid size-9 place-items-center rounded-xl bg-graphite text-sm font-bold text-cloud-white">
          {props.number}
        </span>
        <span class="text-citadel-blue">{props.icon}</span>
        <h2 class="text-lg font-bold text-graphite">{props.title}</h2>
      </div>
      {props.children}
    </section>
  );
}

function ConfigurationGroup(props: {
  icon: JSX.Element;
  title: string;
  children: JSX.Element;
}) {
  return (
    <section class="border-b border-warm-stone/15 py-6 first:pt-0 last:border-0 last:pb-0">
      <div class="mb-4 flex items-center gap-2 text-citadel-blue">
        {props.icon}
        <h3 class="text-base font-bold text-graphite">{props.title}</h3>
      </div>
      {props.children}
    </section>
  );
}

function Field(props: { label: string; children: JSX.Element }) {
  return (
    <label class="block">
      <span class="mb-2 block text-sm font-semibold text-graphite">
        {props.label}
      </span>
      {props.children}
    </label>
  );
}

function FileUpload(props: {
  label: string;
  accept: string;
  description: string;
  file?: File;
  onChange: (file?: File) => void;
}) {
  const id = `upload-${props.label.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <div>
      <p class="mb-2 text-sm font-semibold text-graphite">{props.label}</p>
      <input
        id={id}
        class="sr-only"
        type="file"
        accept={props.accept}
        onChange={(event) => props.onChange(event.currentTarget.files?.[0])}
      />
      <label
        for={id}
        class="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-warm-stone/30 bg-sky-mist/8 px-4 text-center hover:border-citadel-blue/50 hover:bg-sky-mist/18"
      >
        <Upload class="size-6 text-citadel-blue" />
        <span class="mt-2 text-sm text-graphite/50">{props.description}</span>
        <Show when={props.file}>
          <span class="mt-2 max-w-full truncate text-sm font-semibold text-citadel-blue">
            {props.file?.name}
          </span>
        </Show>
      </label>
      <Show when={props.file}>
        <button
          type="button"
          onClick={() => props.onChange()}
          class="mt-2 text-sm font-semibold text-red-wine hover:underline"
        >
          Reset
        </button>
      </Show>
    </div>
  );
}
