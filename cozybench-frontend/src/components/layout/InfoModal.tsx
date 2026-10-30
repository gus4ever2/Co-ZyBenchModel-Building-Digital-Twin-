import {X} from "lucide-solid";
import { Show, type Component } from "solid-js";
import { Dynamic } from "solid-js/web";

type InfoModalProps = {
    infoModal: boolean;
    infoModalContent?: Component;
    onClose: () => void;
}

type InfoModalContent = Component & {
    infoModalSize?: "expanded";
};

export default function InfoModal(props: InfoModalProps) {
    const usesExpandedLayout = () => (props.infoModalContent as InfoModalContent | undefined)?.infoModalSize === "expanded";

    return(
        <>
            <Show when={props.infoModal}>
                <div
                    class={`fixed inset-0 z-[100] grid place-items-center bg-black/50 ${usesExpandedLayout() ? "p-2" : "p-5"}`}
                    role="presentation"
                    onClick={props.onClose}
                >
                    <section
                        class={`
          relative
          flex
          w-full
          ${usesExpandedLayout() ? "h-[calc(100vh-1rem)] max-w-[calc(100vw-1rem)] rounded-3xl" : "h-[min(42rem,calc(100vh-2.5rem))] max-w-3xl"}
          flex-col
          overflow-hidden
          rounded-2xl
          bg-cloud-white
          p-6
          shadow-2xl
        `}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Information"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            class="
            absolute
            right-4
            top-4
            z-10
            rounded-md
            p-1
            text-graphite/50
            transition
            hover:bg-sky-mist
            hover:text-graphite
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-citadel-blue/50
          "
                            aria-label="Close information"
                            onClick={props.onClose}
                        >
                            <X class="size-5" />
                        </button>

                        <div
                            class={`
            mt-8
            min-h-0
            flex-1
            rounded-2xl
            border
            border-citadel-blue/15
            bg-cloud-white
            p-5
            shadow-sm
            ${usesExpandedLayout() ? "overflow-hidden" : "cozy-scrollbar overflow-y-auto"}
          `}
                        >
                            <Show when={props.infoModalContent}>
                                {(InfoContent) => <Dynamic component={InfoContent()} />}
                            </Show>
                        </div>
                    </section>
                </div>
            </Show>
        </>

    );



}
