type AuthenticatedPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export default function AuthenticatedPlaceholder(
  props: AuthenticatedPlaceholderProps,
) {
  return (
    <section class="mx-auto max-w-6xl rounded-3xl border border-cloud-white/15 bg-cloud-white/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-citadel-blue">
        {props.eyebrow}
      </p>
      <h1 class="mt-3 text-3xl font-bold tracking-tight text-graphite sm:text-4xl">
        {props.title}
      </h1>
      <p class="mt-4 max-w-2xl leading-7 text-graphite/65">
        {props.description}
      </p>
    </section>
  );
}
