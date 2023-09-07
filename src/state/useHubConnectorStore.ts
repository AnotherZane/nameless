import { create } from "zustand";
import { HubConnector } from "../astral/connectors";

interface HubConnectorStore {
  connector: HubConnector;
  connected: boolean;
}

const useHubConnectorStore = create<HubConnectorStore>(() => ({
  connector: new HubConnector(),
  connected: false,
}));

export { useHubConnectorStore };
