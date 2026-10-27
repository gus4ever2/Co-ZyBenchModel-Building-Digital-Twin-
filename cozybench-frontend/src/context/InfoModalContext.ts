import { createContext, type Component, type Setter } from "solid-js";

type InfoModalContextValue = {
  setInfoModalOpen: Setter<boolean>;
  setInfoModalContent: Setter<Component | undefined>;
};

export const InfoModalContext = createContext<InfoModalContextValue>();
