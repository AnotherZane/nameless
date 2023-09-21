import { create } from "zustand";
import { AkiviliConnector, Trailblazer } from "../astral/connectivity";

interface ConnectivityStore {
  akivili: AkiviliConnector;
  pathConnected: boolean;
  nameless: Map<string, Trailblazer>;
  addNameless: (id: string, connector: Trailblazer) => void;
  getNameless: (id: string) => Trailblazer | undefined;
  removeNameless: (id: string) => Trailblazer | undefined;
}

const useConnectivityStore = create<ConnectivityStore>((set, get) => ({
  akivili: new AkiviliConnector(),
  pathConnected: false,
  nameless: new Map<string, Trailblazer>(),
  addNameless: (id: string, connector: Trailblazer) =>
    set((s) => ({ nameless: s.nameless.set(id, connector) })),
  getNameless: (id: string) => get().nameless.get(id),
  removeNameless: (id: string) => {
    const connectors = get().nameless;
    const con = connectors.get(id);

    if (con) {
      connectors.delete(id);
      set({ nameless: connectors });
    }

    return con;
  },
}));

export { useConnectivityStore };
