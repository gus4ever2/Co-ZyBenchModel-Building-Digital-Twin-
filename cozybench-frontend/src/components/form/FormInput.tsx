import { Show, splitProps } from "solid-js";
import type { JSX } from "solid-js";

type FormInputProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "class"
> & {
  label: string;
  error?: string;
};

export default function FormInput(props: FormInputProps) {
  const [local, inputProps] = splitProps(props, ["label", "error"]);

  return (
    <div>
      <label
        for={inputProps.id}
        class="mb-2 block text-sm font-semibold text-graphite"
      >
        {local.label}
      </label>

      <input
        {...inputProps}
        class="form-input"
        aria-invalid={Boolean(local.error)}
        aria-describedby={local.error ? `${inputProps.id}-error` : undefined}
      />

      <Show when={local.error}>
        {(error) => (
          <p
            id={`${inputProps.id}-error`}
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
