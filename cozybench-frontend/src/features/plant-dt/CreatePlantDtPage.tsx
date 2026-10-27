import { Info, Leaf, LoaderCircle, OctagonX, X } from "lucide-solid";
import { Show, createSignal, onCleanup, onMount, useContext, type Component, type JSX } from "solid-js";
import EditorNotification from "../../components/building-dt/EditorNotification";
import { InfoModalContext } from "../../context/InfoModalContext";
import WorkspaceHeader from "../../components/layout/WorkspaceHeader";
import WorkspaceIntroPanel from "../../components/layout/WorkspaceIntroPanel";
import PlantThreeViewer from "./PlantThreeViewer";
import {
  createPlantDigitalTwin,
  cancelPlantGeneration,
  loadPlant,
  loadPlants,
  type PlantCreationEvent,
} from "./plantDtService";

type Status = "idle" | "uploading" | "running" | "completed" | "error";

export default function CreatePlantDtPage() {
  const [name, setName] = createSignal("");
  const [reflectance, setReflectance] = createSignal(0.09);
  const [transmittance, setTransmittance] = createSignal(0.06);
  const [vcmax, setVcmax] = createSignal(28.4);
  const [jmax, setJmax] = createSignal(51.1);
  const [rd, setRd] = createSignal(0.42);
  const [objFile, setObjFile] = createSignal<File>();
  const [plantId, setPlantId] = createSignal("");
  const [status, setStatus] = createSignal<Status>("idle");
  const [progress, setProgress] = createSignal(0);
  const [message, setMessage] = createSignal("");
  const [messageIsError, setMessageIsError] = createSignal(true);
  const [checkingName, setCheckingName] = createSignal(false);
  const [modelReady, setModelReady] = createSignal(false);
  const [restoring, setRestoring] = createSignal(true);
  const [cancelling, setCancelling] = createSignal(false);
  let polling: ReturnType<typeof setInterval> | undefined;
  let completionReset: ReturnType<typeof setTimeout> | undefined;
  const infoModal = useContext(InfoModalContext);

  const openInfo = (content: Component) => {
    infoModal?.setInfoModalContent(() => content);
    infoModal?.setInfoModalOpen(true);
  };

  const checkName = async () => {
    const candidate = name().trim();
    if (!candidate || checkingName()) return;
    setCheckingName(true);
    try {
      const plants = await loadPlants();
      if (name().trim() !== candidate) return;
      const exists = plants.some((plant) => plant.name.trim().toLowerCase() === candidate.toLowerCase());
      setMessageIsError(exists);
      setMessage(exists ? "A plant with this name already exists." : "This plant name is available.");
    } catch {
      setMessageIsError(true);
      setMessage("The plant name could not be checked. Please try again.");
    } finally {
      setCheckingName(false);
    }
  };

  const resetCreateForm = () => {
    setName("");
    setObjFile();
    setPlantId("");
    setProgress(0);
    setModelReady(false);
    setMessage("");
    setStatus("idle");
  };

  const canCreate = () =>
    Boolean(
      name().trim() &&
       objFile() &&
       Number.isFinite(reflectance()) &&
       reflectance() >= 0 &&
       Number.isFinite(transmittance()) &&
       transmittance() >= 0 &&
       reflectance() + transmittance() < 1 &&
      Number.isFinite(vcmax()) &&
      vcmax() > 0 &&
      Number.isFinite(jmax()) &&
      jmax() > 0 &&
      Number.isFinite(rd()) &&
      rd() >= 0,
    );

  const watchProgress = (id: string) => {
    if (polling) clearInterval(polling);
    const poll = async () => {
      try {
        const data: PlantCreationEvent = await loadPlant(id);
        if (typeof data.progress === "number") setProgress(data.progress);
        setModelReady(Boolean(data.modelReady));
        if (data.error) {
          setMessageIsError(true);
          setMessage(data.error);
          setStatus("error");
          if (polling) clearInterval(polling);
        } else if (data.status === "COMPLETED") {
          setProgress(100);
          setStatus("completed");
          if (polling) clearInterval(polling);
          if (completionReset) clearTimeout(completionReset);
          completionReset = setTimeout(resetCreateForm, 1200);
        } else if (data.status === "ERROR") {
          setMessageIsError(true);
          setMessage("Plant generation failed in the Python service.");
          setStatus("error");
          if (polling) clearInterval(polling);
        } else {
          setStatus("running");
        }
      } catch {
        setMessageIsError(true);
        setMessage("The plant status could not be loaded from Spring.");
        setStatus("error");
        if (polling) clearInterval(polling);
      }
    };
    void poll();
    polling = setInterval(() => void poll(), 1500);
  };

  onMount(async () => {
    try {
      const plants = await loadPlants();
      const active = plants.find((plant) =>
        ["PENDING", "RUNNING"].includes(plant.status.toUpperCase()),
      );
      if (active) {
        setPlantId(active.id);
        setProgress(active.progress ?? 0);
        setModelReady(Boolean(active.modelReady));
        setStatus("running");
        watchProgress(active.id);
      }
    } catch {
      setMessageIsError(true);
      setMessage(
        "The current plant generation state could not be loaded from Spring.",
      );
    } finally {
      setRestoring(false);
    }
  });

  const createPlant = async () => {
    const obj = objFile();
    if (!canCreate() || !obj) return;
    setMessage("");
    setProgress(0);
    setModelReady(false);
    setStatus("uploading");
    try {
      const id = await createPlantDigitalTwin(
        name().trim(),
        reflectance(),
        transmittance(),
        vcmax(),
        jmax(),
        rd(),
        obj,
      );
      setPlantId(id);
      watchProgress(id);
    } catch {
      setMessageIsError(true);
      setMessage("The OBJ file could not be uploaded to Spring.");
      setStatus("error");
    }
  };

  const cancelGeneration = async () => {
    const id = plantId();
    if (!id || cancelling()) return;
    setCancelling(true);
    try {
      await cancelPlantGeneration(id);
      if (polling) clearInterval(polling);
      setStatus("idle");
      setPlantId("");
      setProgress(0);
      setModelReady(false);
      setMessage("Plant generation was cancelled.");
      setMessageIsError(false);
    } catch {
      setMessageIsError(true);
      setMessage("Plant generation could not be cancelled.");
    } finally {
      setCancelling(false);
    }
  };

  onCleanup(() => {
    if (polling) clearInterval(polling);
    if (completionReset) clearTimeout(completionReset);
  });

  return (
    <section class="mx-auto flex h-[calc(100vh-10rem)] min-h-0 w-full max-w-6xl flex-col gap-4 lg:h-[calc(100vh-4rem)]">
      <EditorNotification message={message()} error={messageIsError()} onDismiss={() => setMessage("")} />
      <WorkspaceHeader
        eyebrow="Digital twin workspace"
        title="Create Plant Digital Twin"
        backTo="/create-plant-dt"
      />

      <main class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-cloud-white/60 bg-cloud-white/95 p-5 shadow-2xl shadow-black/15 sm:p-7">
        <WorkspaceIntroPanel
          eyebrow="Plant model"
          title="Create plant digital twin"
          description="Add the required plant files, create your plant model and explore it in 3D."
        />

        <Show
          when={!restoring()}
          fallback={
            <div class="grid min-h-72 flex-1 place-items-center">
              <LoaderCircle class="size-8 animate-spin text-citadel-blue" />
            </div>
          }
        >
          <Show
            when={
              status() === "uploading" ||
              status() === "running" ||
              status() === "completed"
            }
            fallback={
              <div class="mt-5 grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(20rem,0.85fr)_minmax(0,1.15fr)]">
                <section class="flex min-h-0 flex-col rounded-2xl border border-warm-stone/20 bg-sky-mist/10 p-4">
                  <div class="cozy-scrollbar min-h-0 flex-1 overflow-y-auto pr-3">
                  <div>
                    <span class="mb-2 block text-sm font-semibold text-graphite">
                      Plant name
                    </span>
                    <div class="flex gap-2">
                    <input
                      class="form-input"
                      value={name()}
                      aria-label="Plant name"
                      placeholder="Example: Spathiphyllum"
                      onInput={(event) => setName(event.currentTarget.value)}
                    />
                    <button type="button" disabled={!name().trim() || checkingName()} onClick={() => void checkName()} class="shrink-0 rounded-xl border border-citadel-blue/30 px-3 text-sm font-semibold text-citadel-blue hover:bg-sky-mist/30 disabled:opacity-45">
                      {checkingName() ? "Checking…" : "Check name"}
                    </button>
                    </div>
                    <p class="mt-2 text-xs text-graphite/55">
                      Check name availability before creating the plant.
                    </p>
                  </div>

                  <div class="mt-5">
                    <div class="mb-3 flex items-end justify-between gap-4">
                      <div>
                        <h2 class="flex items-center gap-2 text-sm font-bold text-graphite">
                          OBJ plant geometry
                          <InfoButton label="OBJ geometry information" onClick={() => openInfo(GeometryInfo)} />
                        </h2>
                        <p class="mt-0.5 text-xs text-graphite/45">
                          Upload the OBJ geometry for a 1 m² plant panel.
                        </p>
                      </div>
                      <span class="rounded-full bg-cloud-white px-3 py-1 text-xs font-bold text-citadel-blue shadow-sm">
                        {objFile() ? "1/1" : "0/1"} file
                      </span>
                    </div>
                    <div class="space-y-3">
                      <PlantFileInput
                        icon={<Leaf class="size-5" />}
                        label="Plant OBJ"
                        extension=".obj"
                        file={objFile()}
                        onChange={setObjFile}
                      />
                    </div>
                  </div>

                  <div class="mt-5">
                    <h2 class="flex items-center gap-2 text-sm font-bold text-graphite">
                      Plant model parameters
                      <InfoButton label="Plant model parameters information" onClick={() => openInfo(ParametersInfo)} />
                    </h2>
                    <p class="mt-0.5 text-xs text-graphite/45">
                      Optical and physiological parameters used for the SPICE
                      and CO₂-response grid.
                    </p>
                    <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <PhysiologyInput label="Reflectance" value={reflectance()} min={0} max={0.99} onChange={setReflectance} />
                      <PhysiologyInput label="Transmittance" value={transmittance()} min={0} max={0.99} onChange={setTransmittance} />
                      <PhysiologyInput
                        label="Vcmax"
                        value={vcmax()}
                        min={0.01}
                        onChange={setVcmax}
                      />
                      <PhysiologyInput
                        label="Jmax"
                        value={jmax()}
                        min={0.01}
                        onChange={setJmax}
                      />
                      <PhysiologyInput
                        label="Rd"
                        value={rd()}
                        min={0}
                        onChange={setRd}
                      />
                    </div>
                  </div>

                  </div>

                  <button
                    type="button"
                    disabled={
                      !canCreate() ||
                      status() === "uploading" ||
                      status() === "running"
                    }
                    onClick={createPlant}
                    class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-citadel-blue px-5 py-3 font-semibold text-cloud-white shadow-lg shadow-citadel-blue/20 hover:bg-citadel-blue/90 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Show
                      when={status() === "uploading" || status() === "running"}
                      fallback={<Leaf class="size-4" />}
                    >
                      <LoaderCircle class="size-4 animate-spin" />
                    </Show>
                    {status() === "uploading"
                      ? "Uploading files…"
                      : status() === "running"
                        ? "Generating plant…"
                        : "Create plant"}
                  </button>

                  <Show
                    when={status() === "running" || status() === "completed"}
                  >
                    <div class="mt-5">
                      <div class="mb-2 flex justify-between text-xs font-semibold text-graphite/65">
                        <span>Plant generation</span>
                        <span>{Math.round(progress())}%</span>
                      </div>
                      <div class="h-2 overflow-hidden rounded-full bg-sky-mist/35">
                        <div
                          class="h-full rounded-full bg-citadel-blue transition-[width]"
                          style={{ width: `${progress()}%` }}
                        />
                      </div>
                    </div>
                  </Show>
                </section>

                <section class="flex min-h-0 flex-col rounded-2xl border border-warm-stone/20 bg-cloud-white p-4">
                  <div class="mb-3 shrink-0">
                    <h2 class="font-bold text-graphite">Plant 3D preview</h2>
                    <p class="mt-0.5 text-xs text-graphite/50">
                      Explore your plant model from every angle.
                    </p>
                  </div>
                  <Show
                    when={status() === "completed" && plantId()}
                    fallback={
                      <div class="grid min-h-72 flex-1 place-items-center rounded-2xl border border-dashed border-warm-stone/30 bg-sky-mist/10 p-6 text-center">
                        <div>
                          <Leaf class="mx-auto size-10 text-citadel-blue/55" />
                          <p class="mt-3 text-sm font-semibold text-graphite/55">
                            The interactive plant model will appear here when
                            generation is complete.
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <PlantThreeViewer plantId={plantId()} />
                  </Show>
                </section>
              </div>
            }
          >
            <div class="mt-5 grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)]">
              <section class="flex min-h-0 flex-col justify-between rounded-2xl border border-warm-stone/20 bg-sky-mist/10 p-6">
                <div>
                  <div class="flex items-center gap-3">
                    <span class="grid size-11 place-items-center rounded-xl bg-citadel-blue text-cloud-white">
                      <LoaderCircle class="size-5 animate-spin" />
                    </span>
                    <div>
                      <p class="text-xs font-bold uppercase tracking-[0.16em] text-citadel-blue">
                        Plant generation
                      </p>
                      <h2 class="mt-1 text-lg font-bold text-graphite">
                        {status() === "completed"
                          ? "Plant completed"
                          : "Creating your plant model"}
                      </h2>
                    </div>
                  </div>

                  <div class="mt-8">
                    <div class="mb-2 flex justify-between text-sm font-semibold text-graphite/70">
                      <span>
                        {modelReady()
                          ? "Generating simulation profiles"
                          : "Building 3D model"}
                      </span>
                      <span>{Math.round(progress())}%</span>
                    </div>
                    <div class="h-3 overflow-hidden rounded-full bg-cloud-white shadow-inner">
                      <div
                        class="h-full rounded-full bg-citadel-blue transition-[width] duration-500"
                        style={{ width: `${progress()}%` }}
                      />
                    </div>
                    <p class="mt-3 text-xs leading-relaxed text-graphite/50">
                      You can leave this page safely. Returning here will
                      reconnect to the active plant generation.
                    </p>
                  </div>
                </div>

                <div>
                  <Show when={status() !== "completed"}>
                    <button
                      type="button"
                      disabled={cancelling()}
                      onClick={() => void cancelGeneration()}
                      class="flex w-full items-center justify-center gap-2 rounded-xl border border-error/30 bg-cloud-white px-5 py-3 font-semibold text-error transition hover:bg-error hover:text-cloud-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Show
                        when={cancelling()}
                        fallback={<OctagonX class="size-4" />}
                      >
                        <LoaderCircle class="size-4 animate-spin" />
                      </Show>
                      {cancelling() ? "Cancelling…" : "Cancel generation"}
                    </button>
                  </Show>
                </div>
              </section>

              <section class="flex min-h-0 flex-col rounded-2xl border border-warm-stone/20 bg-cloud-white p-4">
                <div class="mb-3 shrink-0">
                  <h2 class="font-bold text-graphite">Plant 3D preview</h2>
                  <p class="mt-0.5 text-xs text-graphite/50">
                    The model appears as soon as its OBJ and MTL files are
                    ready.
                  </p>
                </div>
                <Show
                  when={modelReady() && plantId()}
                  fallback={
                    <div class="grid min-h-72 flex-1 place-items-center rounded-2xl border border-dashed border-warm-stone/30 bg-sky-mist/10 p-6 text-center">
                      <div>
                        <LoaderCircle class="mx-auto size-9 animate-spin text-citadel-blue/60" />
                        <p class="mt-3 text-sm font-semibold text-graphite/55">
                          Building the interactive plant model…
                        </p>
                      </div>
                    </div>
                  }
                >
                  <PlantThreeViewer plantId={plantId()} />
                </Show>
              </section>
            </div>
          </Show>
        </Show>
      </main>
    </section>
  );
}

function InfoButton(props: { label: string; onClick: () => void }) {
  return <button type="button" aria-label={props.label} onClick={props.onClick} class="text-citadel-blue hover:text-citadel-blue/70"><Info class="size-4" /></button>;
}

function GeometryInfo() {
  return (
    <div class="space-y-5 text-sm leading-relaxed text-graphite/75">
      <div>
        <h2 class="text-lg font-bold text-graphite">OBJ plant geometry</h2>
        <p class="mt-2">Prepare a representative plant panel and export it as an OBJ file.</p>
      </div>
      <section class="space-y-2">
        <h3 class="font-semibold text-graphite">Size and orientation</h3>
        <p>Use metres and make the panel 1 m × 1 m. Orient the front, where the plants face, towards +Z. The panel normal should be (0, 0, 1).</p>
        <p>Diffuse light comes from a hemisphere in front of the panel, centred on +Z. Individual leaves can face different directions. The OBJ origin does not need to be at the panel centre.</p>
      </section>
      <section class="space-y-2">
        <h3 class="font-semibold text-graphite">Identifying the leaves</h3>
        <p>Place leaf faces in OBJ groups or objects named <code>leaf_...</code>. Alternatively, if there are no leaf groups, assign them the <code>leaf_green</code> material. If leaf groups exist, only faces in those groups are used.</p>
        <p>Stems, the wall and other geometry are not treated as obstacles during ray tracing.</p>
      </section>
      <section class="space-y-2">
        <h3 class="font-semibold text-graphite">Example</h3>
        <p>This simplified example shows one triangular leaf. A complete model would contain all the leaves of the 1 m × 1 m panel.</p>
        <pre class="overflow-x-auto rounded-lg bg-sky-mist/20 p-3 text-xs leading-relaxed text-graphite"><code>{`# Coordinates in metres
v 0.40 0.40 0.05
v 0.60 0.40 0.05
v 0.50 0.55 0.10

g leaf_001
f 1 2 3`}</code></pre>
        <p>Each <code>v</code> defines a vertex; <code>f</code> connects three vertices to make a leaf face. Use a separate <code>leaf_...</code> group for each leaf.</p>
      </section>
    </div>
  );
}

function ParametersInfo() {
  return (
    <div class="space-y-5 text-sm leading-relaxed text-graphite/75">
      <div>
        <h2 class="text-lg font-bold text-graphite">Plant model parameters</h2>
        <p class="mt-2">Choose values suitable for the plant species and growing conditions; the defaults are not universal.</p>
      </div>
      <section class="space-y-2">
        <h3 class="font-semibold text-graphite">Optical properties</h3>
        <p><strong>Reflectance:</strong> fraction of light reflected by a leaf.</p>
        <p><strong>Transmittance:</strong> fraction of light passing through a leaf.</p>
        <p>Use fractions, not percentages. Their sum must be less than 1.</p>
      </section>
      <section class="space-y-2">
        <h3 class="font-semibold text-graphite">Leaf physiology</h3>
        <p><strong>Vcmax:</strong> maximum carboxylation capacity.</p>
        <p><strong>Jmax:</strong> maximum electron transport capacity.</p>
        <p><strong>Rd:</strong> leaf respiration rate.</p>
      </section>
    </div>
  );
}

function PhysiologyInput(props: {
  label: string;
  value: number;
  min: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label class="block">
      <span class="mb-1.5 block text-xs font-semibold text-graphite/70">
        {props.label}
      </span>
      <input
        class="form-input"
        type="number"
        min={props.min}
        max={props.max}
        step="0.01"
        value={props.value}
        onInput={(event) => props.onChange(event.currentTarget.valueAsNumber)}
      />
    </label>
  );
}

function PlantFileInput(props: {
  icon: JSX.Element;
  label: string;
  extension: ".obj";
  file?: File;
  onChange: (file?: File) => void;
}) {
  const id = `plant-${props.extension.slice(1)}`;
  const [dragActive, setDragActive] = createSignal(false);

  const acceptFile = (file?: File) => {
    if (file?.name.toLowerCase().endsWith(props.extension)) {
      props.onChange(file);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Upload ${props.label} ${props.extension} file`}
      class="group min-h-20 cursor-pointer rounded-xl border-2 border-dashed px-4 py-3 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-citadel-blue/20"
      classList={{
        "border-citadel-blue bg-sky-mist/35 shadow-md": dragActive(),
        "border-citadel-blue/45 bg-sky-mist/18":
          Boolean(props.file) && !dragActive(),
        "border-warm-stone/30 bg-cloud-white hover:border-citadel-blue/55 hover:bg-sky-mist/10":
          !props.file && !dragActive(),
      }}
      onClick={() => !props.file && document.getElementById(id)?.click()}
      onKeyDown={(event) => {
        if (!props.file && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          document.getElementById(id)?.click();
        }
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
        setDragActive(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setDragActive(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        acceptFile(event.dataTransfer?.files?.[0]);
      }}
    >
      <Show
        when={props.file}
        fallback={
          <div class="flex h-full items-center gap-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-mist/25 text-citadel-blue">
              {props.icon}
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-graphite">{props.label}</p>
              <p class="mt-1 truncate text-xs text-graphite/45">
                Drop the file here or{" "}
                <span class="font-semibold text-citadel-blue">browse</span>
              </p>
            </div>
            <span class="flex h-9 min-w-11 shrink-0 items-center justify-center rounded-lg border border-citadel-blue/20 bg-sky-mist/15 px-2 text-xs font-bold uppercase text-citadel-blue">
              {props.extension}
            </span>
          </div>
        }
      >
        <div class="flex h-full items-center gap-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-citadel-blue text-cloud-white">
            {props.icon}
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-graphite">{props.label}</p>
            <p
              class="mt-1 truncate text-xs font-semibold text-citadel-blue"
              title={props.file?.name}
            >
              {props.file?.name}
            </p>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              props.onChange();
            }}
            class="grid size-9 shrink-0 place-items-center rounded-full bg-citadel-blue text-cloud-white hover:bg-error"
            aria-label={`Remove ${props.label}`}
          >
            <X class="size-4" />
          </button>
        </div>
      </Show>
      <input
        id={id}
        type="file"
        class="sr-only"
        accept={props.extension}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          acceptFile(file);
          event.currentTarget.value = "";
        }}
      />
    </div>
  );
}
