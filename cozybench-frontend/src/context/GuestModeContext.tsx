import { createContext, onCleanup, useContext, type Accessor, type ParentProps } from "solid-js";
import { GUEST_MODE_KEY } from "../lib/api";

const GuestModeContext = createContext<Accessor<boolean>>(() => false);

export function GuestModeProvider(props: ParentProps) {
  if (typeof window !== "undefined") sessionStorage.setItem(GUEST_MODE_KEY, "true");
  onCleanup(() => {
    if (typeof window !== "undefined") sessionStorage.removeItem(GUEST_MODE_KEY);
  });

  return (
    <GuestModeContext.Provider value={() => true}>
      {props.children}
    </GuestModeContext.Provider>
  );
}

export function useGuestMode() {
  return useContext(GuestModeContext);
}
