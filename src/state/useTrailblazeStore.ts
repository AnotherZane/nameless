import { create } from "zustand";
import { TrailblazeClient } from "../astral/trailblaze";

interface TrailblazeStore {
  client: TrailblazeClient;
}

const useTrailblazeStore = create<TrailblazeStore>(() => ({
  client: new TrailblazeClient(),
}));

export { useTrailblazeStore };
