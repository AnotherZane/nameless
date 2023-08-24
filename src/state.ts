import { create } from "zustand";
import HubConnector from "./astral/HubConnector";

type HubConnectorStore = {
    connector: HubConnector;
    started: boolean;
    start: () => void;
};

const useHubConnectorStore = create<HubConnectorStore>((set, get) => ({
    connector: new HubConnector(),
    started: false,
    start: () => {
        get().connector.start();
        set({started: true});
    }
}));

export {useHubConnectorStore};
