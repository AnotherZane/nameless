import { create } from "zustand";
import { HubConnector, RTCConnector } from "../astral/connectors";

interface ConnectorStore {
  hub: HubConnector;
  hubConnected: boolean;
  rtcConnections: Map<string, RTCConnector>;
  addRTC: (id: string, connector: RTCConnector) => void;
  getRTC: (id: string) => RTCConnector | undefined;
  removeRTC: (id: string) => RTCConnector | undefined;
}

const useConnectorStore = create<ConnectorStore>((set, get) => ({
  hub: new HubConnector(),
  hubConnected: false,
  rtcConnections: new Map<string, RTCConnector>(),
  addRTC: (id: string, connector: RTCConnector) =>
    set((s) => ({ rtcConnections: s.rtcConnections.set(id, connector) })),
  getRTC: (id: string) => get().rtcConnections.get(id),
  removeRTC: (id: string) => {
    const connectors = get().rtcConnections;
    const con = connectors.get(id);

    if (con) {
      connectors.delete(id);
      set({ rtcConnections: connectors });
    }

    return con;
  },
}));

export { useConnectorStore };
