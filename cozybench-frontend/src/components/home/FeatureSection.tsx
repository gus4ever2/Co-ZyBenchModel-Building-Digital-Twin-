type FeatureSectionProps = {
  id?: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
  muted?: boolean;
};

export default function FeatureSection(props: FeatureSectionProps) {
  return (
    <section
      id={props.id}
      classList={{
        "bg-cloud-white": !props.muted,
        "bg-sky-mist": props.muted,
      }}
    >
      <div
        class="mx-auto grid max-w-5xl items-center gap-0 px-5 py-14 sm:px-8 sm:py-18 lg:px-8 lg:py-20"
        classList={{
          "lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]": !props.reverse,
          "lg:grid-cols-[minmax(0,1.28fr)_minmax(0,0.72fr)]": props.reverse,
        }}
      >
        <article
          class="z-10 rounded-3xl bg-citadel-blue p-7 text-cloud-white shadow-2xl shadow-graphite/20 sm:p-8 lg:p-9"
          classList={{
            "lg:mr-[-2rem]": !props.reverse,
            "lg:order-2 lg:ml-[-2rem]": props.reverse,
          }}
        >
          <h2 class="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {props.title}
          </h2>
          <p class="mt-4 text-base leading-7 text-cloud-white/85 sm:text-lg">
            {props.description}
          </p>
        </article>

        <div
          class="mt-[-1.5rem] overflow-hidden rounded-3xl shadow-xl shadow-graphite/15 lg:mt-0"
          classList={{ "lg:order-1": props.reverse }}
        >
          <img
            src={props.image}
            alt={props.imageAlt}
            class="h-auto w-full object-contain"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
