import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";
import { createForm } from "@tanstack/solid-form";
import {
  createMutation,
  createQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/solid-query";
import {
  Copy,
  Cuboid,
  Library,
  LoaderCircle,
  Save,
  Trash2,
} from "lucide-solid";
import { z } from "zod";
import EditorIdentityHeader from "../../components/form/EditorIdentityHeader";
import EditorEmptyState from "../../components/building-dt/EditorEmptyState";
import { EditorCreateButton } from "../../components/building-dt/EditorSidebarControls";
import EditorWorkspace, {
  EditorMain,
  EditorSidebar,
} from "../../components/building-dt/EditorWorkspace";
import EditorNotification from "../../components/building-dt/EditorNotification";
import {
  materialType,
  materialTypes,
  formatFieldName,
  type MaterialType,
} from "./materialTypes";
import { materialIddMetadata } from "./materialIddMetadata.generated";
import {
  addLibraryMaterial,
  createMaterial,
  deleteMaterial,
  duplicateMaterial,
  loadMaterials,
  updateMaterial,
  type MaterialComponent,
  type MaterialDescriptor,
  type MaterialsState,
} from "./materialsService";

type IddField = {
  label: string;
  required: boolean;
  type: string;
  keys: readonly string[];
  unit?: string;
  min?: number;
  max?: number;
  exclusiveMin?: boolean;
  exclusiveMax?: boolean;
};
const iddMetadata = materialIddMetadata as unknown as Record<
  MaterialType,
  Record<string, IddField>
>;
const getIddField = (type: MaterialType, name: string) =>
  iddMetadata[type]?.[name];

function valueSchema(type: MaterialType, name: string) {
  const definition = getIddField(type, name);
  if (!definition) return z.string();

  return z.string().superRefine((value, context) => {
    const trimmed = value.trim();
    if (!trimmed) {
      if (definition.required)
        context.addIssue({
          code: "custom",
          message: `${definition.label} is required.`,
        });
      return;
    }

    if (
      definition.type === "choice" &&
      definition.keys.length > 0 &&
      !definition.keys.includes(trimmed)
    ) {
      context.addIssue({
        code: "custom",
        message: `Select a valid ${definition.label.toLowerCase()}.`,
      });
      return;
    }
    if (definition.type !== "real" && definition.type !== "integer") return;

    const number = Number(trimmed);
    if (!Number.isFinite(number)) {
      context.addIssue({ code: "custom", message: "Enter a valid number." });
      return;
    }
    if (definition.type === "integer" && !Number.isInteger(number)) {
      context.addIssue({ code: "custom", message: "Enter a whole number." });
    }
    if (
      definition.min !== undefined &&
      (definition.exclusiveMin
        ? number <= definition.min
        : number < definition.min)
    ) {
      context.addIssue({
        code: "custom",
        message: `Value must be ${definition.exclusiveMin ? "greater than" : "at least"} ${definition.min}.`,
      });
    }
    if (
      definition.max !== undefined &&
      (definition.exclusiveMax
        ? number >= definition.max
        : number > definition.max)
    ) {
      context.addIssue({
        code: "custom",
        message: `Value must be ${definition.exclusiveMax ? "less than" : "at most"} ${definition.max}.`,
      });
    }
  });
}

function normalizeProperties(component: MaterialComponent | null) {
  return Object.fromEntries(
    Object.entries(component?.properties ?? {}).map(([key, value]) => [
      key,
      value == null ? "" : String(value),
    ]),
  );
}

export default function MaterialManager() {
  const client = useQueryClient();
  const [selectedId, setSelectedId] = createSignal("0");
  const [openType, setOpenType] = createSignal<MaterialType | null>("MATERIAL");
  const [openLibraryType, setOpenLibraryType] =
    createSignal<MaterialType | null>("MATERIAL");
  const [notice, setNotice] = createSignal("");
  const [error, setError] = createSignal("");

  const materials = createQuery(() => ({
    queryKey: ["materials", selectedId()],
    queryFn: () => loadMaterials(selectedId()),
    placeholderData: keepPreviousData,
  }));
  const [displayedData, setDisplayedData] = createSignal<MaterialsState>();

  createEffect(() => {
    const completedData = materials.data;
    if (!completedData) return;

    setDisplayedData(completedData);
  });

  const refresh = async (id = selectedId()) => {
    setSelectedId(id);
    await client.invalidateQueries({ queryKey: ["materials"] });
  };

  const runMutation = (
    action: () => Promise<unknown>,
    success: string,
    nextId?: string,
  ) => {
    setError("");
    setNotice("");
    return action()
      .then(() => refresh(nextId))
      .then(() => setNotice(success))
      .catch(() =>
        setError(
          "The operation failed. Check that Spring and MongoDB are running, then try again.",
        ),
      );
  };

  const runMutationAndSelectCreated = async (
    action: () => Promise<unknown>,
    type: MaterialType,
    success: string,
  ) => {
    setError("");
    setNotice("");

    const existingIds = new Set(
      displayedData()?.componentDescriptions.componentParts.map(
        (item) => item.id,
      ) ?? [],
    );

    try {
      await action();

      const overview = await loadMaterials("0");
      const created = overview.componentDescriptions.componentParts.find(
        (item) => item.type === type && !existingIds.has(item.id),
      );

      if (!created) {
        setDisplayedData(overview);
        await refresh("0");
        setNotice(success);
        return;
      }

      setSelectedId(created.id);
      const selectedState = await loadMaterials(created.id);
      setDisplayedData(selectedState);
      await client.invalidateQueries({ queryKey: ["materials"] });
      setNotice(success);
    } catch {
      setError(
        "The operation failed. Check that Spring and MongoDB are running, then try again.",
      );
    }
  };

  const createAction = createMutation(() => ({
    mutationFn: (type: MaterialType) =>
      runMutationAndSelectCreated(
        () => createMaterial(type),
        type,
        "Material created.",
      ),
  }));
  const duplicateAction = createMutation(() => ({
    mutationFn: (component: MaterialComponent) =>
      runMutationAndSelectCreated(
        () => duplicateMaterial(component.id, component.type),
        component.type,
        "Material duplicated.",
      ),
  }));
  const deleteAction = createMutation(() => ({
    mutationFn: (id: string) =>
      runMutation(() => deleteMaterial(id), "Material deleted.", "0"),
  }));
  const libraryAction = createMutation(() => ({
    mutationFn: (item: MaterialDescriptor) =>
      runMutationAndSelectCreated(
        () => addLibraryMaterial(item),
        item.type,
        "Material added from the library.",
      ),
  }));

  const component = createMemo(() => displayedData()?.component ?? null);
  const form = createForm(() => ({
    defaultValues: {} as Record<string, string>,
    onSubmit: async ({ value }) => {
      const selected = component();
      if (!selected) return;
      await runMutation(
        () => updateMaterial(selected, value),
        "Material saved.",
      );
    },
  }));

  createEffect(() => form.reset(normalizeProperties(component())));

  const userItems = (type: MaterialType) =>
    displayedData()?.componentDescriptions.componentParts.filter(
      (item) => item.type === type,
    ) ?? [];
  const libraryItems = (type: MaterialType) =>
    displayedData()?.libraryDescriptions.componentParts.filter(
      (item) => item.type === type,
    ) ?? [];

  return (
    <EditorWorkspace>
      <EditorSidebar>
        <p class="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-citadel-blue">
          Material types
        </p>
        <div class="cozy-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          <For each={materialTypes}>
            {(type) => (
              <div class="overflow-hidden rounded-xl border border-warm-stone/20">
                <button
                  type="button"
                  class="flex w-full items-center justify-between bg-sky-mist/20 px-3 py-2 text-left text-sm font-semibold text-graphite"
                  onClick={() =>
                    setOpenType((current) =>
                      current === type[0] ? null : type[0],
                    )
                  }
                >
                  <span>{type[2]}</span>
                  <span class="text-citadel-blue">
                    {openType() === type[0] ? "−" : "+"}
                  </span>
                </button>
                <Show when={openType() === type[0]}>
                  <div class="space-y-2 border-t border-warm-stone/15 p-2">
                    <EditorCreateButton
                      label="New material"
                      onClick={() => createAction.mutate(type[0])}
                    />
                    <For
                      each={userItems(type[0])}
                      fallback={
                        <p class="px-2 py-2 text-xs text-graphite/45">
                          No materials yet.
                        </p>
                      }
                    >
                      {(item) => (
                        <button
                          type="button"
                          title={item.name}
                          class="block w-full min-w-0 overflow-hidden rounded-lg border px-3 py-2 text-left text-xs font-medium"
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
                </Show>
              </div>
            )}
          </For>
        </div>
      </EditorSidebar>

      <EditorMain>
        <EditorNotification message={error() || notice()} error={Boolean(error())} onDismiss={() => { setError(""); setNotice(""); }} />
        <Switch>
          <Match when={materials.isPending && !displayedData()}>
            <div class="flex min-h-[28rem] items-center justify-center text-citadel-blue">
              <LoaderCircle class="mr-2 size-5 animate-spin" /> Loading
              materials…
            </div>
          </Match>
          <Match when={materials.isError && !displayedData()}>
            <p class="rounded-xl bg-error/10 p-4 text-sm text-error">
              Materials could not be loaded. Check the backend connection.
            </p>
          </Match>
          <Match when={!component()}>
            <EditorEmptyState
              icon={<Cuboid class="size-7" />}
              title="Select or create a material"
              description="Choose a material on the left, create a new one, or add one from the EnergyPlus library."
            />
          </Match>
          <Match when={component()}>
            {(selected) => (
              <form
                class="flex h-full min-h-0 flex-col"
                novalidate
                onSubmit={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void form.handleSubmit();
                }}
              >
                <EditorIdentityHeader
                  eyebrow={materialType(selected().type)?.[2] ?? "Material"}
                  title="Material properties"
                  actions={
                    <div class="flex gap-2">
                      <button
                        type="button"
                        class="rounded-xl border border-citadel-blue/25 p-2.5 text-citadel-blue hover:bg-citadel-blue/10"
                        title="Duplicate"
                        onClick={() => duplicateAction.mutate(selected())}
                      >
                        <Copy class="size-4" />
                      </button>
                      <button
                        type="button"
                        class="rounded-xl border border-error/25 p-2.5 text-error hover:bg-error/10"
                        title="Delete"
                        onClick={() => deleteAction.mutate(selected().id)}
                      >
                        <Trash2 class="size-4" />
                      </button>
                    </div>
                  }
                />
                <div class="mb-5 grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
                  <form.Field
                    name={"Name" as any}
                    validators={{
                      onBlur: valueSchema(selected().type, "Name") as any,
                      onSubmit: valueSchema(selected().type, "Name") as any,
                    }}
                  >
                    {(field) => (
                      <label class="block min-w-0">
                        <span class="mb-1.5 block text-sm font-semibold text-graphite">
                          Name
                        </span>
                        <input
                          class="form-input py-2.5"
                          type="text"
                          value={field().state.value ?? ""}
                          aria-invalid={field().state.meta.errors.length > 0}
                          onBlur={field().handleBlur}
                          onInput={(event) =>
                            field().handleChange(event.currentTarget.value)
                          }
                        />
                        <Show
                          when={
                            field().state.meta.isTouched &&
                            field().state.meta.errors[0]
                          }
                        >
                          {(message) => (
                            <span class="mt-1 block text-xs text-error">
                              {String((message() as any)?.message ?? message())}
                            </span>
                          )}
                        </Show>
                      </label>
                    )}
                  </form.Field>
                  <form.Subscribe
                    selector={(state) => ({
                      canSubmit: state.canSubmit,
                      isSubmitting: state.isSubmitting,
                    })}
                  >
                    {(state) => (
                      <button
                        type="submit"
                        disabled={!state().canSubmit || state().isSubmitting}
                        class="inline-flex h-[2.9rem] items-center gap-2 rounded-xl bg-citadel-blue px-5 font-semibold text-cloud-white shadow-lg shadow-citadel-blue/20 hover:bg-citadel-blue/90 disabled:opacity-50"
                      >
                        <Save class="size-4" />
                        <span class="hidden sm:inline">
                          {state().isSubmitting ? "Saving..." : "Save material"}
                        </span>
                        <span class="sm:hidden">Save</span>
                      </button>
                    )}
                  </form.Subscribe>
                </div>
                <div class="cozy-scrollbar min-h-0 flex-1 overflow-y-auto pr-2">
                  <div class="grid gap-x-5 gap-y-4 md:grid-cols-2">
                    <For
                      each={Object.entries(selected().properties).filter(
                        ([name]) => name !== "Name",
                      )}
                    >
                      {([name]) => {
                        const definition = getIddField(selected().type, name);
                        const options = definition?.keys ?? [];

                        return (
                          <form.Field
                            name={name as any}
                            validators={{
                              onBlur: valueSchema(selected().type, name) as any,
                              onSubmit: valueSchema(
                                selected().type,
                                name,
                              ) as any,
                            }}
                          >
                            {(field) => (
                              <label class="block min-w-0">
                                <span class="mb-1.5 block text-sm font-semibold text-graphite">
                                  {formatFieldName(name)}
                                </span>
                                <Show
                                  when={options.length > 0}
                                  fallback={
                                    <input
                                      class="form-input py-2.5"
                                      type={
                                        definition?.type === "real" ||
                                        definition?.type === "integer"
                                          ? "number"
                                          : "text"
                                      }
                                      step="any"
                                      value={field().state.value ?? ""}
                                      aria-invalid={
                                        field().state.meta.errors.length > 0
                                      }
                                      onBlur={field().handleBlur}
                                      onInput={(event) =>
                                        field().handleChange(
                                          event.currentTarget.value,
                                        )
                                      }
                                    />
                                  }
                                >
                                  <select
                                    class="form-input py-2.5"
                                    value={field().state.value ?? ""}
                                    onBlur={field().handleBlur}
                                    onChange={(event) =>
                                      field().handleChange(
                                        event.currentTarget.value,
                                      )
                                    }
                                  >
                                    <option value="">Select…</option>
                                    <For each={options}>
                                      {(option) => (
                                        <option value={option}>{option}</option>
                                      )}
                                    </For>
                                  </select>
                                </Show>
                                <Show
                                  when={
                                    field().state.meta.isTouched &&
                                    field().state.meta.errors[0]
                                  }
                                >
                                  {(message) => (
                                    <span class="mt-1 block text-xs text-error">
                                      {String(
                                        (message() as any)?.message ??
                                          message(),
                                      )}
                                    </span>
                                  )}
                                </Show>
                              </label>
                            )}
                          </form.Field>
                        );
                      }}
                    </For>
                  </div>
                </div>
                <Show when={false}>
                  <form.Subscribe
                    selector={(state) => ({
                      canSubmit: state.canSubmit,
                      isSubmitting: state.isSubmitting,
                    })}
                  >
                    {(state) => (
                      <button
                        type="submit"
                        disabled={!state().canSubmit || state().isSubmitting}
                        class="mt-6 inline-flex items-center gap-2 rounded-xl bg-citadel-blue px-5 py-3 font-semibold text-cloud-white shadow-lg shadow-citadel-blue/20 hover:bg-citadel-blue/90 disabled:opacity-50"
                      >
                        <Save class="size-4" />
                        {state().isSubmitting ? "Saving…" : "Save material"}
                      </button>
                    )}
                  </form.Subscribe>
                </Show>
              </form>
            )}
          </Match>
        </Switch>
      </EditorMain>

      <EditorSidebar>
        <p class="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-citadel-blue">
          <Library class="size-4" /> Materials library
        </p>
        <div class="cozy-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          <For each={materialTypes}>
            {(type) => (
              <div class="overflow-hidden rounded-xl border border-warm-stone/20">
                <button
                  type="button"
                  class="flex w-full items-center justify-between bg-sky-mist/20 px-3 py-2 text-left text-xs font-semibold text-graphite"
                  onClick={() =>
                    setOpenLibraryType((current) =>
                      current === type[0] ? null : type[0],
                    )
                  }
                >
                  <span>{type[2]}</span>
                  <span>{openLibraryType() === type[0] ? "−" : "+"}</span>
                </button>
                <Show when={openLibraryType() === type[0]}>
                  <div class="space-y-2 p-2">
                    <For
                      each={libraryItems(type[0])}
                      fallback={
                        <p class="p-2 text-xs text-graphite/45">
                          No library items.
                        </p>
                      }
                    >
                      {(item) => (
                        <button
                          type="button"
                          title={item.name}
                          class="block w-full min-w-0 overflow-hidden rounded-lg border border-warm-stone/20 px-3 py-2 text-left text-xs text-graphite hover:border-citadel-blue hover:bg-citadel-blue/10"
                          onClick={() => libraryAction.mutate(item)}
                        >
                          <span class="block truncate font-semibold">
                            {item.name}
                          </span>
                          <span class="mt-0.5 block truncate text-[11px] text-citadel-blue">
                            Add to workspace
                          </span>
                        </button>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </div>
      </EditorSidebar>
    </EditorWorkspace>
  );
}
