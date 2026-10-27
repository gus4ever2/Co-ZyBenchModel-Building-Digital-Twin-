import {X} from "lucide-solid";
import { Show, type Component } from "solid-js";
import { Dynamic } from "solid-js/web";

type InfoModalProps = {
    infoModal: boolean;
    infoModalContent?: Component;
    onClose: () => void;
}

export default function InfoModal(props: InfoModalProps) {
    return(
        <>
            <Show when={props.infoModal}>
                <div
                    class="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-5"
                    role="presentation"
                    onClick={props.onClose}
                >
                    <section
                        class="
          relative
          flex
          h-[min(42rem,calc(100vh-2.5rem))]
          w-full
          max-w-3xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-cloud-white
          p-6
          shadow-2xl
        "
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
                            class="
            cozy-scrollbar
            mt-8
            min-h-0
            flex-1
            overflow-y-auto
            rounded-2xl
            border
            border-citadel-blue/15
            bg-cloud-white
            p-5
            shadow-sm
          "
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
