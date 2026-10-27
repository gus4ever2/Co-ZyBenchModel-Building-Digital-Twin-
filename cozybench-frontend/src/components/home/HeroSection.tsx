import { Link } from "@tanstack/solid-router";

const HeroSection = () => {
  return (
    <>
      <div
        class="
                    max-w-6xl
                    w-full
                    mt-[20vh]
                    mx-auto

                    lg:mx-10 lg:w-[50vw] lg:px-8
                  "
      >
        <section
          class="
                      relative overflow-hidden
                      rounded-2xl
                    "
        >
          {/* Transparent blue background */}
          <div
            class="
                            absolute inset-0
                            bg-linear-to-r
                            bg-olive-moss
                            opacity-50
                            backdrop-blur-sm
                          "
            aria-hidden="true"
          />

          {/* Card content */}
          <div
            class="
                            relative z-10
                            p-6
                            text-cloud-white
                            sm:p-8
                            lg:p-10
                          "
          >
            {/* Small category title */}
            <div class="flex items-center gap-3">
              <span
                class="
                                h-px w-8
                                bg-cloud-white/70
                              "
                aria-hidden="true"
              />

              <p
                class="
                                text-xs font-semibold
                                uppercase tracking-[0.2em]
                                text-cloud-white/85
                                sm:text-sm
                              "
              >
                Smart Building Simulation
              </p>
            </div>

            {/* Main title */}
            <h1
              class="
                              mt-5
                              max-w-2xl
                              text-3xl font-bold
                              leading-tight tracking-tight
                              text-cloud-white
                              sm:text-4xl
                              lg:text-5xl
                            "
            >
              Simulate smarter buildings.
            </h1>

            {/* Supporting headline */}
            <p
              class="
                              mt-2
                              text-lg font-medium
                              text-cloud-white/85
                              sm:text-xl
                              lg:text-2xl
                            "
            >
              Balance comfort and energy.
            </p>

            {/* Description */}
            <p
              class="
                              mt-5
                              max-w-2xl
                              text-sm leading-6
                              text-cloud-white/90
                              sm:text-base sm:leading-7
                            "
            >
              CozyBench is a simulation-based benchmarking platform for thermal
              provision systems in smart buildings. It integrates Building and
              Occupant Digital Twins with HVAC and co-simulation models to
              evaluate energy performance and occupant thermal comfort.
            </p>

            {/* Actions */}
            <div
              class="
                              mt-7
                              flex flex-col gap-3
                              sm:flex-row
                            "
            >
              <Link
                to="/sign-up"
                class="
                                    rounded-xl
                                    bg-cloud-white
                                    px-6 py-3
                                    text-sm font-semibold
                                    text-graphite
                                    shadow-lg shadow-graphite/20
                                    transition duration-200
                                    hover:-translate-y-0.5
                                    hover:shadow-xl hover:shadow-graphite/30
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-cloud-white
                                    focus-visible:ring-offset-2
                                    focus-visible:ring-offset-graphite
                                  "
              >
                Start Simulating
              </Link>

              <a
                href="#features"
                class="
                                    rounded-xl
                                    border border-white/35
                                    bg-white/10
                                    px-6 py-3
                                    text-center
                                    text-sm font-semibold
                                    text-white
                                    transition duration-200
                                    hover:-translate-y-0.5
                                    hover:bg-white/20
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-white
                                  "
              >
                Explore Features
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HeroSection;
