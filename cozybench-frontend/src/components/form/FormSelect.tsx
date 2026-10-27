import { For, Show, splitProps } from "solid-js";
import type { JSX } from "solid-js";

type SelectOption = {
  value: string;
  label: string;
};

type FormSelectProps = Omit<
  JSX.SelectHTMLAttributes<HTMLSelectElement>,
  "class"
> & {
  label: string;
  options: SelectOption[];
  error?: string;
};

export default function FormSelect(props: FormSelectProps) {
  const [local, selectProps] = splitProps(props, ["label", "options", "error"]);

  return (
    <div>
      <label
        for={selectProps.id}
        class="mb-2 block text-sm font-semibold text-graphite"
      >
        {local.label}
      </label>

      <select
        {...selectProps}
        class="form-input"
        aria-invalid={Boolean(local.error)}
        aria-describedby={local.error ? `${selectProps.id}-error` : undefined}
      >
        <For each={local.options}>
          {(option) => <option value={option.value}>{option.label}</option>}
        </For>
      </select>

      <Show when={local.error}>
        {(error) => (
          <p
            id={`${selectProps.id}-error`}
            class="mt-2 text-sm text-error"
            role="alert"
          >
            {error()}
          </p>
        )}
      </Show>
    </div>
  );
}
