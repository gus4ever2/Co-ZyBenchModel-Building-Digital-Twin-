import { Show, createSignal } from "solid-js";
import { Link, createFileRoute, useNavigate } from "@tanstack/solid-router";
import { createForm } from "@tanstack/solid-form";
import { z } from "zod";
import FormInput from "../../../components/form/FormInput";
import FormSelect from "../../../components/form/FormSelect";
import { signUp, type ProfileType } from "../../../services/authService";

const emailSchema = z
  .email("Enter a valid email address.")
  .max(254, "Email is too long.");
const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Password must not exceed 72 characters.");
const nameSchema = z
  .string()
  .trim()
  .min(1, "This field is required.")
  .max(50, "Use no more than 50 characters.");

const profileOptions: { value: ProfileType; label: string }[] = [
  { value: "STUDENT", label: "Student" },
  { value: "EDUCATOR", label: "Educator" },
  { value: "RESEARCHER", label: "Researcher" },
  { value: "BUILDING_PROFESSIONAL", label: "Building professional" },
  { value: "OTHER", label: "Other" },
];

export const Route = createFileRoute("/(auth)/_auth/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = createSignal("");

  const form = createForm(() => ({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      profileType: "STUDENT" as ProfileType,
    },
    onSubmit: async ({ value }) => {
      setSubmitError("");

      try {
        await signUp({
          email: value.email,
          password: value.password,
          firstName: value.firstName,
          lastName: value.lastName,
          profileType: value.profileType,
        });
        await navigate({ to: "/dashboard" });
      } catch {
        setSubmitError(
          "Unable to create the account. The email may already be in use.",
        );
      }
    },
  }));

  return (
    <>
      <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-[0.2em] text-citadel-blue">
          Get started
        </p>
        <h1 class="mt-3 text-3xl font-bold tracking-tight text-graphite">
          Create your account
        </h1>
        <p class="mt-3 leading-7 text-graphite/65">
          Start exploring smart-building simulations with CozyBench.
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
        <div class="grid gap-5 sm:grid-cols-2">
          <form.Field name="firstName" validators={{ onBlur: nameSchema }}>
            {(field) => (
              <FormInput
                id={field().name}
                name={field().name}
                type="text"
                label="First name"
                autocomplete="given-name"
                placeholder="Your first name"
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

          <form.Field name="lastName" validators={{ onBlur: nameSchema }}>
            {(field) => (
              <FormInput
                id={field().name}
                name={field().name}
                type="text"
                label="Last name"
                autocomplete="family-name"
                placeholder="Your last name"
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
        </div>

        <form.Field name="email" validators={{ onBlur: emailSchema }}>
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

        <form.Field name="profileType">
          {(field) => (
            <FormSelect
              id={field().name}
              name={field().name}
              label="Profile type"
              value={field().state.value}
              options={profileOptions}
              onBlur={field().handleBlur}
              onChange={(event) =>
                field().handleChange(event.currentTarget.value as ProfileType)
              }
            />
          )}
        </form.Field>

        <form.Field name="password" validators={{ onBlur: passwordSchema }}>
          {(field) => (
            <FormInput
              id={field().name}
              name={field().name}
              type="password"
              label="Password"
              autocomplete="new-password"
              placeholder="At least 8 characters"
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
          name="confirmPassword"
          validators={{
            onBlur: ({ value, fieldApi }) =>
              value === fieldApi.form.getFieldValue("password")
                ? undefined
                : "Passwords do not match.",
          }}
        >
          {(field) => (
            <FormInput
              id={field().name}
              name={field().name}
              type="password"
              label="Confirm password"
              autocomplete="new-password"
              placeholder="Repeat your password"
              value={field().state.value}
              onBlur={field().handleBlur}
              onInput={(event) =>
                field().handleChange(event.currentTarget.value)
              }
              error={
                field().state.meta.isTouched
                  ? String(field().state.meta.errors[0] ?? "") || undefined
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
              {state().isSubmitting ? "Creating account..." : "Create account"}
            </button>
          )}
        </form.Subscribe>
      </form>

      <p class="mt-6 text-center text-sm text-graphite/65">
        Already have an account?{" "}
        <Link
          to="/sign-in"
          class="font-semibold text-citadel-blue hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
