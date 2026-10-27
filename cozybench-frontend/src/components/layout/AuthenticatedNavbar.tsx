import type { Accessor, Component, Setter } from "solid-js";
import type { LucideProps } from "lucide-solid";
import { For, Show } from "solid-js";
import { Link, useNavigate } from "@tanstack/solid-router";
import {
  Building2,
  ChartNoAxesCombined,
  ChartLine,
  ExternalLink,
  FileText,
  History,
  Info,
  LayoutDashboard,
  Leaf,
  LogOut,
  Mail,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  X,
} from "lucide-solid";
import { logout } from "../../services/authService";
import { getAuthenticatedEmail } from "../../lib/api";

type AuthenticatedNavbarProps = {
  expanded: Accessor<boolean>;
  setExpanded: Setter<boolean>;
  mobileOpen: Accessor<boolean>;
  setMobileOpen: Setter<boolean>;
};

type NavigationItem = {
  label: string;
  to:
    | "/dashboard"
    | "/current-simulation"
    | "/simulations"
    | "/create-building-dt"
    | "/create-plant-dt"
    | "/new-simulation"
    | "/history"
    | "/about";
  icon: Component<LucideProps>;
};

const navigationItems: NavigationItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Current simulation", to: "/current-simulation", icon: ChartLine },
  {
    label: "Compare simulations",
    to: "/simulations",
    icon: ChartNoAxesCombined,
  },
  { label: "Create Building DT", to: "/create-building-dt", icon: Building2 },
  { label: "Create Plant DT", to: "/create-plant-dt", icon: Leaf },
  { label: "New Simulation", to: "/new-simulation", icon: PlusCircle },
  { label: "History", to: "/history", icon: History },
  { label: "About", to: "/about", icon: Info },
];

const navItemClass =
  "group flex h-11 items-center gap-3 rounded-xl text-sm font-medium text-cloud-white/75 hover:bg-cloud-white/10 hover:text-cloud-white data-[status=active]:bg-citadel-blue data-[status=active]:text-cloud-white data-[status=active]:shadow-lg data-[status=active]:shadow-black/15";

export default function AuthenticatedNavbar(props: AuthenticatedNavbarProps) {
  const navigate = useNavigate();
  const email = getAuthenticatedEmail() ?? "Signed-in user";
  const avatarInitial = email.charAt(0).toUpperCase();

  const closeOnMobile = () => props.setMobileOpen(false);

  const handleLogout = async () => {
    logout();
    await navigate({ to: "/sign-in" });
  };

  return (
    <>
      <button
        type="button"
        class="fixed left-4 top-4 z-50 flex size-11 items-center justify-center rounded-xl border border-cloud-white/20 bg-graphite/80 text-cloud-white shadow-xl backdrop-blur-xl lg:hidden"
        aria-label="Open navigation"
        onClick={() => props.setMobileOpen(true)}
      >
        <Menu class="size-5" aria-hidden="true" />
      </button>

      <Show when={props.mobileOpen()}>
        <button
          type="button"
          class="fixed inset-0 z-40 bg-graphite/55 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation"
          onClick={closeOnMobile}
        />
      </Show>

      <aside
        class="fixed bottom-4 left-4 top-4 z-50 flex w-58 flex-col overflow-hidden rounded-3xl border-2 border-cloud-white/20 bg-graphite/60 p-2 text-cloud-white shadow-2xl shadow-black/30 backdrop-blur-xl transition-[width,transform] duration-300"
        classList={{
          "-translate-x-[calc(100%+2rem)] lg:translate-x-0":
            !props.mobileOpen(),
          "translate-x-0": props.mobileOpen(),
          "lg:w-58": props.expanded(),
          "lg:w-18": !props.expanded(),
        }}
      >
        <div
          class="relative flex items-center justify-center"
          classList={{
            "h-14 gap-3 px-2": props.expanded(),
            "h-24 flex-col justify-center gap-1": !props.expanded(),
          }}
        >
          <Link
            to="/dashboard"
            onClick={closeOnMobile}
            class="group relative flex shrink-0 items-center justify-center"
            aria-label="Go to dashboard from the CozyBench logo"
            classList={{
              "h-14 w-full": props.expanded(),
              "size-8": !props.expanded(),
            }}
          >
            <img
              src="/cozybench_icon.svg"
              alt=""
              class="block shrink-0"
              classList={{
                "absolute left-2 size-9": props.expanded(),
                "size-8": !props.expanded(),
              }}
            />
            <Show when={props.expanded()}>
              <span class="truncate px-12 text-center text-lg font-semibold tracking-tight text-cloud-white group-hover:text-citadel-blue">
                CozyBench
              </span>
            </Show>
          </Link>

          <button
            type="button"
            class="z-10 hidden size-8 shrink-0 items-center justify-center rounded-lg text-cloud-white/65 hover:bg-cloud-white/10 hover:text-cloud-white lg:flex"
            classList={{
              "absolute right-0": props.expanded(),
              "mt-2": !props.expanded(),
            }}
            aria-label={
              props.expanded() ? "Collapse navigation" : "Expand navigation"
            }
            onClick={() => props.setExpanded((value) => !value)}
          >
            <Show
              when={props.expanded()}
              fallback={<PanelLeftOpen class="size-5" />}
            >
              <PanelLeftClose class="size-5" />
            </Show>
          </button>

          <button
            type="button"
            class="absolute right-0 flex size-9 items-center justify-center rounded-lg text-cloud-white/70 hover:bg-cloud-white/10 lg:hidden"
            aria-label="Close navigation"
            onClick={closeOnMobile}
          >
            <X class="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav
          class="mt-3 flex min-h-0 flex-1 flex-col"
          aria-label="Authenticated navigation"
        >
          <ul class="space-y-1">
            <For each={navigationItems}>
              {(item) => (
                <li>
                  <Link
                    to={item.to}
                    title={!props.expanded() ? item.label : undefined}
                    class={`${navItemClass} ${
                      props.expanded()
                        ? "w-full justify-start px-3"
                        : "mx-auto w-11 justify-center px-0"
                    }`}
                    onClick={closeOnMobile}
                  >
                    <item.icon class="size-5 shrink-0" aria-hidden="true" />
                    <Show when={props.expanded()}>
                      <span class="truncate">{item.label}</span>
                    </Show>
                  </Link>
                </li>
              )}
            </For>
          </ul>

          <div class="mt-auto space-y-1 border-t border-cloud-white/10 pt-3">
            <a
              href="https://www.computer.org/csdl/proceedings-article/percom-workshops/2024/10502756/1WnrIcXZjZC"
              class={`${navItemClass} text-cloud-white/75 hover:bg-cloud-white/10 hover:text-cloud-white`}
              classList={{
                "w-full justify-start px-3": props.expanded(),
                "mx-auto w-11 justify-center px-0": !props.expanded(),
              }}
              title={!props.expanded() ? "Documentation" : undefined}
              target="_blank"
              rel="noreferrer"
            >
              <FileText class="size-5 shrink-0" aria-hidden="true" />
              <Show when={props.expanded()}>
                <span class="truncate">Documentation</span>
                <ExternalLink
                  class="ml-auto size-3.5 opacity-50"
                  aria-hidden="true"
                />
              </Show>
            </a>

            <a
              href="mailto:contact@cozybench.org"
              class={`${navItemClass} text-cloud-white/75 hover:bg-cloud-white/10 hover:text-cloud-white`}
              classList={{
                "w-full justify-start px-3": props.expanded(),
                "mx-auto w-11 justify-center px-0": !props.expanded(),
              }}
              title={!props.expanded() ? "Contact" : undefined}
            >
              <Mail class="size-5 shrink-0" aria-hidden="true" />
              <Show when={props.expanded()}>
                <span class="truncate">Contact</span>
              </Show>
            </a>

            <div class="my-2 border-t border-cloud-white/10 pt-3">
              <div
                class="flex h-11 items-center rounded-xl"
                classList={{
                  "w-full gap-3 px-2": props.expanded(),
                  "mx-auto w-11 justify-center": !props.expanded(),
                }}
                title={!props.expanded() ? email : undefined}
              >
                <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-citadel-blue text-sm font-bold text-cloud-white shadow-lg shadow-black/15">
                  {avatarInitial}
                </span>
                <Show when={props.expanded()}>
                  <span class="min-w-0">
                    <span class="block text-xs text-cloud-white/45">
                      Signed in as
                    </span>
                    <span class="block truncate text-sm font-medium text-cloud-white/80">
                      {email}
                    </span>
                  </span>
                </Show>
              </div>
            </div>

            <button
              type="button"
              class={`${navItemClass} text-cloud-white/75 hover:bg-error/20 hover:text-cloud-white`}
              classList={{
                "w-full justify-start px-3": props.expanded(),
                "mx-auto w-11 justify-center px-0": !props.expanded(),
              }}
              title={!props.expanded() ? "Logout" : undefined}
              onClick={() => void handleLogout()}
            >
              <LogOut class="size-5 shrink-0" aria-hidden="true" />
              <Show when={props.expanded()}>
                <span class="truncate">Logout</span>
              </Show>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
