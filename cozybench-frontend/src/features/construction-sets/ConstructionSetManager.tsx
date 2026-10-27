import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";
import {
  createMutation,
  createQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/solid-query";
import {
  Copy,
  Library,
  LoaderCircle,
  PanelsTopLeft,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-solid";
import { z } from "zod";
import {
  EditorAccordion,
  EditorCreateButton,
} from "../../components/building-dt/EditorSidebarControls";
import EditorEmptyState from "../../components/building-dt/EditorEmptyState";
import EditorWorkspace, {
  EditorMain,
  EditorSidebar,
} from "../../components/building-dt/EditorWorkspace";
import EditorNotification from "../../components/building-dt/EditorNotification";
import { constructionSetGroups } from "./constructionSetGroups";
import {
  addConstructionSet,
  createConstructionSet,
  deleteConstructionSet,
  duplicateConstructionSet,
  loadConstructionSets,
  updateConstructionSet,
  type ConstructionSetComponent,
} from "./constructionSetService";

const nameSchema = z
  .string()
  .trim()
  .min(1, "Construction set name is required.");

export default function ConstructionSetManager() {
  const client = useQueryClient();
  const [selectedId, setSelectedId] = createSignal("0");
  const [activeGroup, setActiveGroup] = createSignal<string>(
    constructionSetGroups[0].id,
  );
  const [openSlot, setOpenSlot] = createSignal<string | null>(null);
  const [userSetOpen, setUserSetOpen] = createSignal(true);
  const [librarySetOpen, setLibrarySetOpen] = createSignal(true);
  const [name, setName] = createSignal("");
  const [assignments, setAssignments] = createSignal<Record<string, string>>(
    {},
  );
  const [nameError, setNameError] = createSignal("");
  const [message, setMessage] = createSignal("");
  const [requestError, setRequestError] = createSignal("");

  const state = createQuery(() => ({
    queryKey: ["construction-sets", selectedId()],
    queryFn: () => loadConstructionSets(selectedId()),
    placeholderData: keepPreviousData,
  }));
  const component = createMemo(() => state.data?.component ?? null);
  const group = createMemo(() =>
    constructionSetGroups.find((item) => item.id === activeGroup())!,
  );

  createEffect(() => {
    const current = component();
    setName(current?.properties.Name ?? "");
    setAssignments(
      Object.fromEntries(
        Object.entries(current?.properties ?? {}).map(([key, value]) => [
          key,
          value ?? "",
        ]),
      ),
    );
    setNameError("");
    setOpenSlot(null);
  });

  const refresh = async (id = selectedId()) => {
    setSelectedId(id);
    await client.invalidateQueries({ queryKey: ["construction-sets"] });
  };
  const run = async (
    action: () => Promise<unknown>,
    success: string,
    nextId?: string,
  ) => {
    setMessage("");
    setRequestError("");
    try {
      await action();
      await refresh(nextId);
      setMessage(success);
    } catch {
      setRequestError("The operation failed. Please try again.");
    }
  };
  const createAction = createMutation(() => ({
    mutationFn: () =>
      run(createConstructionSet, "Construction set created.", "0"),
  }));
  const duplicateAction = createMutation(() => ({
    mutationFn: (current: ConstructionSetComponent) =>
      run(
        () => duplicateConstructionSet(current.id),
        "Construction set duplicated.",
        "0",
      ),
  }));
  const deleteAction = createMutation(() => ({
    mutationFn: (id: string) =>
      run(() => deleteConstructionSet(id), "Construction set deleted.", "0"),
  }));
  const libraryAction = createMutation(() => ({
    mutationFn: (id: string) =>
      run(
        () => addConstructionSet(id),
        "Construction set and its dependencies were added.",
        "0",
      ),
  }));

  const save = async () => {
    const parsed = nameSchema.safeParse(name());
    if (!parsed.success) {
      setNameError(parsed.error.issues[0]?.message ?? "Name is required.");
      return;
    }
    const current = component();
    if (!current) return;
    setNameError("");
    await run(
      () =>
        updateConstructionSet(current, { ...assignments(), Name: parsed.data }),
      "Construction set saved.",
    );
  };

  return (
    <EditorWorkspace>
      <EditorSidebar>
        <p class="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-citadel-blue">
          Construction set types
        </p>
        <EditorAccordion
          label="Construction Set"
          open={userSetOpen()}
          onToggle={() => setUserSetOpen((open) => !open)}
          fillWhenOpen
        >
          <div class="flex h-full min-h-0 flex-col p-2">
            <div class="mb-2">
              <EditorCreateButton
                label="New construction set"
                onClick={() => createAction.mutate()}
              />
            </div>
            <div class="cozy-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              <For
                each={state.data?.componentDescriptions?.componentParts ?? []}
                fallback={
                  <p class="p-2 text-xs text-graphite/45">
                    No construction sets yet.
                  </p>
                }
              >
                {(item) => (
                  <button
                    type="button"
                    title={item.name}
                    class="block w-full min-w-0 overflow-hidden rounded-xl border px-3 py-2.5 text-left text-xs font-semibold"
                    classList={{
                      "border-citadel-blue bg-citadel-blue/10 text-citadel-blue":
                        selectedId() === item.id,
                      "border-warm-stone/20 text-graphite hover:bg-sky-mist/15":
                        selectedId() !== item.id,
                    }}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <span class="block truncate">{item.name}</span>
                  </button>
                )}
              </For>
            </div>
          </div>
        </EditorAccordion>
      </EditorSidebar>

      <EditorMain>
        <EditorNotification message={requestError() || message()} error={Boolean(requestError())} onDismiss={() => { setRequestError(""); setMessage(""); }} />
        <Switch>
          <Match when={state.isPending && !state.data}>
            <div class="flex min-h-[28rem] items-center justify-center text-citadel-blue">
              <LoaderCircle class="mr-2 size-5 animate-spin" /> Loading
              construction sets…
            </div>
          </Match>
          <Match when={state.isError}>
            <EditorEmptyState
              icon={<PanelsTopLeft class="size-7" />}
              title="Could not load construction sets"
              description="The server did not return construction-set data. Refresh the page or check that the constructions endpoint is running."
            />
          </Match>
          <Match when={!component()}>
            <EditorEmptyState
              icon={<PanelsTopLeft class="size-7" />}
              title="Select or create a construction set"
              description="Choose a construction set on the left, create a new one, or add one from the EnergyPlus library."
            />
          </Match>
          <Match when={component()}>
            {(current) => (
              <div class="flex h-full min-h-0 flex-col">
                <div class="mb-5 flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-warm-stone/20 pb-5">
                  <div>
                    <p class="text-xs font-bold uppercase tracking-[0.16em] text-citadel-blue">
                      Construction set
                    </p>
                    <h2 class="mt-1 text-2xl font-bold text-graphite">
                      Construction set properties
                    </h2>
                  </div>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      title="Duplicate"
                      class="rounded-xl border border-citadel-blue/25 p-2.5 text-citadel-blue hover:bg-citadel-blue/10"
                      onClick={() => duplicateAction.mutate(current())}
                    >
                      <Copy class="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      class="rounded-xl border border-error/25 p-2.5 text-error hover:bg-error/10"
                      onClick={() => deleteAction.mutate(current().id)}
                    >
                      <Trash2 class="size-4" />
                    </button>
                  </div>
                </div>
                <div class="mb-5 flex flex-wrap items-end justify-between gap-4">
                  <label class="min-w-[15rem] flex-1">
                    <span class="mb-1.5 block text-sm font-semibold text-graphite">
                      Construction set name
                    </span>
                    <input
                      class="form-input py-2.5"
                      value={name()}
                      aria-invalid={Boolean(nameError())}
                      onInput={(event) => setName(event.currentTarget.value)}
                    />
                    <Show when={nameError()}>
                      <span class="mt-1 block text-xs text-error">
                        {nameError()}
                      </span>
                    </Show>
                  </label>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-xl bg-citadel-blue px-4 py-2.5 text-sm font-semibold text-cloud-white shadow-lg shadow-citadel-blue/20 hover:bg-citadel-blue/90"
                      onClick={() => void save()}
                    >
                      <Save class="size-4" />
                      <span class="hidden 2xl:inline">
                        Save construction set
                      </span>
                      <span class="2xl:hidden">Save</span>
                    </button>
                  </div>
                </div>
                <div class="cozy-scrollbar mb-5 flex shrink-0 gap-2 overflow-x-auto rounded-2xl bg-sky-mist/15 p-2">
                  <For each={constructionSetGroups}>
                    {(item) => (
                      <button
                        type="button"
                        class="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold"
                        classList={{
                          "bg-cloud-white text-graphite shadow-sm":
                            activeGroup() === item.id,
                          "text-graphite/55 hover:bg-cloud-white/60":
                            activeGroup() !== item.id,
                        }}
                        onClick={() => {
                          setActiveGroup(item.id);
                          setOpenSlot(null);
                        }}
                      >
                        {item.title}
                      </button>
                    )}
                  </For>
                </div>
                <h2 class="mb-4 shrink-0 text-lg font-bold text-graphite">
                  {group().title}
                </h2>
                <div class="cozy-scrollbar min-h-0 flex-1 overflow-y-auto pr-2">
                  <div class="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    <For each={group().fields}>
                      {(field) => {
                        const key = field[0];
                        const label = field[1];
                        return (
                          <article class="relative min-h-36 rounded-2xl border border-warm-stone/20 bg-sky-mist/8 p-4">
                            <p class="mb-3 text-sm font-bold text-graphite">
                              {label}
                            </p>
                            <Show
                              when={assignments()[key]}
                              fallback={
                                <button
                                  type="button"
                                  class="flex w-full items-center justify-between rounded-xl border border-dashed border-citadel-blue/35 bg-cloud-white px-3 py-3 text-left text-sm font-semibold text-citadel-blue hover:bg-citadel-blue/5"
                                  onClick={() =>
                                    setOpenSlot((value) =>
                                      value === key ? null : key,
                                    )
                                  }
                                >
                                  <span>Assign construction</span>
                                  <Plus class="size-4" />
                                </button>
                              }
                            >
                              {(assigned) => (
                                <div class="flex items-start gap-2 rounded-xl border border-citadel-blue/25 bg-citadel-blue/8 p-3">
                                  <span
                                    title={assigned()}
                                    class="min-w-0 flex-1 break-words text-sm font-semibold leading-5 text-graphite"
                                  >
                                    {assigned()}
                                  </span>
                                  <button
                                    type="button"
                                    aria-label={`Remove ${assigned()}`}
                                    class="flex size-7 shrink-0 items-center justify-center rounded-full bg-citadel-blue text-cloud-white"
                                    onClick={() =>
                                      setAssignments((values) => ({
                                        ...values,
                                        [key]: "",
                                      }))
                                    }
                                  >
                                    <X class="size-3.5" />
                                  </button>
                                </div>
                              )}
                            </Show>
                            <Show when={openSlot() === key}>
                              <div class="cozy-scrollbar absolute left-4 right-4 top-[5.8rem] z-30 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-warm-stone/25 bg-cloud-white p-2 shadow-2xl">
                                <For
                                  each={
                                    state.data?.selectableComponentDescriptions
                                      ?.componentParts ?? []
                                  }
                                  fallback={
                                    <p class="p-3 text-xs text-graphite/50">
                                      No constructions available.
                                    </p>
                                  }
                                >
                                  {(option) => (
                                    <button
                                      type="button"
                                      title={option.name}
                                      class="block w-full rounded-lg px-3 py-2.5 text-left hover:bg-sky-mist/20"
                                      onClick={() => {
                                        setAssignments((values) => ({
                                          ...values,
                                          [key]: option.name,
                                        }));
                                        setOpenSlot(null);
                                      }}
                                    >
                                      <span class="block break-words text-xs font-semibold leading-5 text-graphite">
                                        {option.name}
                                      </span>
                                      <Show when={option.type}>
                                        {(type) => (
                                          <span class="mt-0.5 block text-[10px] uppercase tracking-wide text-citadel-blue">
                                            {type().replaceAll("_", " ")}
                                          </span>
                                        )}
                                      </Show>
                                    </button>
                                  )}
                                </For>
                              </div>
                            </Show>
                          </article>
                        );
                      }}
                    </For>
                  </div>
                </div>
              </div>
            )}
          </Match>
        </Switch>
      </EditorMain>

      <EditorSidebar>
        <p class="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-citadel-blue">
          <Library class="size-4" /> Construction sets library
        </p>
        <EditorAccordion
          label="Construction Set"
          open={librarySetOpen()}
          onToggle={() => setLibrarySetOpen((open) => !open)}
          fillWhenOpen
        >
          <div class="cozy-scrollbar h-full min-h-0 space-y-2 overflow-y-auto p-2 pr-1">
            <For
              each={state.data?.libraryDescriptions?.componentParts ?? []}
              fallback={
                <p class="p-2 text-xs text-graphite/45">No library sets.</p>
              }
            >
              {(item) => (
                <button
                  type="button"
                  title={item.name}
                  class="block w-full min-w-0 overflow-hidden rounded-xl border border-warm-stone/20 px-3 py-2.5 text-left hover:border-citadel-blue hover:bg-citadel-blue/10"
                  onClick={() => libraryAction.mutate(item.id)}
                >
                  <span class="block truncate text-xs font-semibold text-graphite">
                    {item.name}
                  </span>
                  <span class="mt-1 block text-[11px] text-citadel-blue">
                    Add to workspace
                  </span>
                </button>
              )}
            </For>
          </div>
        </EditorAccordion>
      </EditorSidebar>
    </EditorWorkspace>
  );
}
