import { create } from "zustand";
import { HubConnector } from "../astral/connectors";

type HubConnectorStore = {
  connector: HubConnector;
  connected: boolean;
};

const useHubConnectorStore = create<HubConnectorStore>(() => ({
  connector: new HubConnector(),
  connected: false,
}));

export { useHubConnectorStore };
