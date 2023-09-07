import { create } from "zustand";
import { RTCConnector } from "../astral/connectors";

interface RTCStore {
  connectors: Map<string, RTCConnector>;
  // createConnector: (id: string, config?: RTCConfiguration) => RTCConnector;
  addConnector: (id: string, connector: RTCConnector) => void;
  getConnector: (id: string) => RTCConnector | undefined;
  removeConnector: (id: string) => RTCConnector | undefined;
}

const useRTCStore = create<RTCStore>((set, get) => ({
  connectors: new Map<string, RTCConnector>(),
  addConnector: (id: string, connector: RTCConnector) =>
    set((s) => ({ connectors: s.connectors.set(id, connector) })),
  getConnector: (id: string) => get().connectors.get(id),
  removeConnector: (id: string) => {
    const connectors = get().connectors;
    const con = connectors.get(id);

    if (con) {
      connectors.delete(id);
      set({ connectors: connectors });
    }

    return con;
  },
}));

export { useRTCStore };
