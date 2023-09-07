import { create } from "zustand";
import { FileMetadata } from "../astral/models";

interface ReceiverStore {
  sharedMetadata: FileMetadata[];
  addMetadata: (...files: FileMetadata[]) => void;
  removeMetadata: (file: FileMetadata) => void;
  clearMetadata: () => void;
}

const useReceiverStore = create<ReceiverStore>((set, get) => ({
  sharedMetadata: [],
  addMetadata: (...files: FileMetadata[]) => {
    const shared = get().sharedMetadata;
    shared.push(...files);
    set({ sharedMetadata: shared });
  },
  removeMetadata: (file: FileMetadata) => {
    const shared = get().sharedMetadata;

    const idx = shared.indexOf(file);
    if (idx > -1) {
      shared.splice(idx, 1);
    }

    set({ sharedMetadata: shared });
  },
  clearMetadata: () => set({ sharedMetadata: [] }),
}));

export { useReceiverStore };
