import { Link } from "@tanstack/solid-router";
import { For } from "solid-js";

type NavLinkProps = {
  label: string;
  href: string;
};

const NavLink = ({ label, href }: NavLinkProps) => {
  return (
    <li class="group relative">
      <Link
        class="
                  block px-4 py-2
                  text-sm font-medium text-cloud-white/90
                  transition-colors duration-500
                  hover:text-cloud-white
                "
        to={href}
      >
        {label}
      </Link>

      <span
        aria-hidden="true"
        class="
                  absolute bottom-0
                  h-0.5 w-0
                  rounded-full
                  bg-citadel-blue
                  transition-[width] duration-700 ease-in-out
                  group-hover:w-full
                "
      />
    </li>
  );
};

const navLinks = [
  {
    label: "Features",
    href: "/",
  },
  {
    label: "Documentation",
    href: "https://www.computer.org/csdl/proceedings-article/percom-workshops/2024/10502756/1WnrIcXZjZC",
  },
  {
    label: "GitHub",
    href: "https://github.com/satrai-lab/cozybench",
  },
  {
    label: "Contact",
    href: "/",
  },
];

const PublicNavbar = () => {
  return (
    <nav
      class="
        mx-auto flex max-w-7xl
        items-center justify-between

        rounded-full
        border border-white/15
        bg-graphite/85

        px-6 py-3
        text-cloud-white

        shadow-xl shadow-black/20
        backdrop-blur-xl

        transition-all duration-500


        sm:px-10
         "
    >
      <Link
        class="
                flex items-center gap-3
                font-sans text-xl font-semibold
                tracking-tight text-cloud-white
                transition-line duration-500 ease-in-out
                hover:text-citadel-blue
              "
        to="/"
      >
        <img
          class="h-8 w-8 object-contain font-white"
          src="/cozybench_icon.svg"
          alt=""
        />

        <span>CozyBench</span>
      </Link>

      <ul class="hidden items-center gap-2 lg:flex">
        <For each={navLinks}>
          {(item) => <NavLink label={item.label} href={item.href} />}
        </For>
      </ul>

      <div class="flex items-center gap-2">
        <Link
          to="/sign-in"
          class="hidden rounded-full px-4 py-2 text-sm font-semibold text-cloud-white transition hover:bg-white/10 sm:inline-flex"
        >
          Sign in
        </Link>
        <Link
          to="/sign-up"
          class="inline-flex rounded-full bg-citadel-blue px-4 py-2 text-sm font-semibold text-cloud-white shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:bg-citadel-blue/90 sm:px-5"
        >
          Sign up
        </Link>
      </div>
    </nav>
  );
};

export default PublicNavbar;
