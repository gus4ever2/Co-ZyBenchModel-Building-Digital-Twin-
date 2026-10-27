import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/(auth)/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <main
      class="
        flex
        h-screen
        overflow-y-auto
        items-center
        justify-center
        bg-[url(/graphite.webp)]
        bg-cover
        bg-center
        bg-no-repeat
        px-4 py-8
        sm:px-6 sm:py-10
      "
    >
      <div
        class="
          mx-auto flex
          w-full
          max-w-7xl
          items-center
          justify-center
        "
      >
        <section
          class="
            grid
            w-full
            max-w-5xl
            overflow-hidden
            rounded-3xl
            bg-cloud-white
            shadow-2xl
            lg:grid-cols-2
          "
        >
          <div
            class="
              order-2
              p-8
              sm:p-10
              lg:order-1
              lg:p-10
            "
          >
            <Outlet />
          </div>

          <div
            class="
              order-1
              flex
              items-center
              justify-center
              bg-sky-mist/15
              p-6
              sm:p-8
              lg:order-2
              lg:p-10
            "
          >
            <img
              src="/cozybench-image.webp"
              alt=""
              class="
                max-h-72
                w-full
                object-contain
                lg:max-h-128
              "
            />
          </div>
        </section>
      </div>
    </main>
  );
}
