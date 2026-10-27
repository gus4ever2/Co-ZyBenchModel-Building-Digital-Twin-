import { Link } from "@tanstack/solid-router";

const footerLinkClass =
  "w-fit text-sm text-cloud-white/65 transition hover:text-sky-mist";

export default function PublicFooter() {
  return (
    <footer class="border-t border-cloud-white/10 bg-graphite px-6 py-12 text-cloud-white sm:px-8 lg:py-16">
      <div class="mx-auto max-w-6xl">
        <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr] lg:gap-16">
          <div class="max-w-sm">
            <Link
              to="/"
              class="flex w-fit items-center gap-3 text-xl font-semibold tracking-tight"
            >
              <img src="/cozybench_icon.svg" alt="" class="size-9" />
              <span>CozyBench</span>
            </Link>
            <p class="mt-4 text-sm leading-6 text-cloud-white/60">
              Simulation-based benchmarking for thermal comfort and energy
              performance in smart buildings.
            </p>
          </div>

          <nav aria-label="Product links" class="flex flex-col gap-3">
            <h2 class="mb-1 text-sm font-semibold text-cloud-white">Product</h2>
            <a href="#features" class={footerLinkClass}>
              Features
            </a>
            <a
              href="https://www.computer.org/csdl/proceedings-article/percom-workshops/2024/10502756/1WnrIcXZjZC"
              class={footerLinkClass}
              target="_blank"
              rel="noreferrer"
            >
              Documentation
            </a>
            <a
              href="https://github.com/satrai-lab/cozybench"
              class={footerLinkClass}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </nav>

          <nav aria-label="Account links" class="flex flex-col gap-3">
            <h2 class="mb-1 text-sm font-semibold text-cloud-white">Account</h2>
            <Link to="/sign-in" class={footerLinkClass}>
              Sign in
            </Link>
            <Link to="/sign-up" class={footerLinkClass}>
              Create an account
            </Link>
          </nav>
        </div>

        <div class="mt-12 flex flex-col gap-3 border-t border-cloud-white/10 pt-6 text-xs text-cloud-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 CozyBench. All rights reserved.</p>
          <p>Smart building simulation and thermal comfort benchmarking.</p>
        </div>
      </div>
    </footer>
  );
}
