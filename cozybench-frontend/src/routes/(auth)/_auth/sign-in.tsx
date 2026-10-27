import { Show, createSignal } from "solid-js";
import { Link, createFileRoute, useNavigate } from "@tanstack/solid-router";
import { createForm } from "@tanstack/solid-form";
import { z } from "zod";
import FormInput from "../../../components/form/FormInput";
import { login } from "../../../services/authService";

const emailSchema = z
  .email("Enter a valid email address.")
  .max(254, "Email is too long.");

const passwordSchema = z
  .string()
  .min(1, "Password is required.")
  .max(72, "Password must not exceed 72 characters.");

export const Route = createFileRoute("/(auth)/_auth/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = createSignal("");

  const form = createForm(() => ({
    defaultValues: {
      email: "",
      password: "",
    },

    onSubmit: async ({ value }) => {
      setSubmitError("");

      try {
        await login(value);
        await navigate({ to: "/dashboard" });
      } catch {
        setSubmitError("Unable to sign in. Check your email and password.");
      }
    },
  }));

  return (
    <>
      <header class="mb-8">
        <p
          class="
                    text-sm
                    font-medium
                    uppercase
                    tracking-[0.2em]
                    text-citadel-blue
                "
        >
          Welcome back
        </p>

        <h1
          class="
                    mt-3
                    text-3xl
                    font-bold
                    tracking-tight
                    text-graphite
                "
        >
          Sign in CozyBench
        </h1>

        <p
          class="
                mt-3
                leading-7
                text-graphite/65
            "
        >
          Access your simulations, benchmarks, and saved configurations.
        </p>
      </header>

      <form
        class="space-y-5"
        novalidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="email"
          validators={{
            onBlur: emailSchema,
          }}
        >
          {(field) => (
            <FormInput
              id={field().name}
              name={field().name}
              type="email"
              label="Email address"
              autocomplete="email"
              placeholder="you@example.com"
              value={field().state.value}
              onBlur={field().handleBlur}
              onInput={(event) =>
                field().handleChange(event.currentTarget.value)
              }
              error={
                field().state.meta.isTouched
                  ? field().state.meta.errors[0]?.message
                  : undefined
              }
            />
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onBlur: passwordSchema,
          }}
        >
          {(field) => (
            <FormInput
              id={field().name}
              name={field().name}
              type="password"
              label="Password"
              autocomplete="current-password"
              placeholder="Enter your password"
              value={field().state.value}
              onBlur={field().handleBlur}
              onInput={(event) =>
                field().handleChange(event.currentTarget.value)
              }
              error={
                field().state.meta.isTouched
                  ? field().state.meta.errors[0]?.message
                  : undefined
              }
            />
          )}
        </form.Field>

        <Show when={submitError()}>
          {(message) => (
            <p
              class="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error"
              role="alert"
            >
              {message()}
            </p>
          )}
        </Show>

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
              class="form-submit-button"
            >
              {state().isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          )}
        </form.Subscribe>
      </form>

      <p class="mt-6 text-center text-sm text-graphite/65">
        New to CozyBench?{" "}
        <Link
          to="/sign-up"
          class="font-semibold text-citadel-blue hover:underline"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}
