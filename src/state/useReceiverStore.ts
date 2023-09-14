import { create } from "zustand";
import { FileMetadata } from "../astral/models";

interface ReceiverStore {
  sharedMetadata: FileMetadata[];
  addMetadata: (...files: FileMetadata[]) => void;
  removeMetadata: (file: FileMetadata) => void;
  clearMetadata: () => void;
  tempDls: Map<number, Uint8Array[]>;
  appendDl: (id: number, idx: number, arr: Uint8Array) => void;
  removeDl: (id: number) => void;
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
  tempDls: new Map<number, Uint8Array[]>(),
  appendDl: (id: number, idx: number, arr: Uint8Array) => {
    const dls = get().tempDls;
    const curr = dls.get(id) ?? [];
    curr[idx] = arr;
    dls.set(id, curr);
    set({ tempDls: dls });
  },
  removeDl: (id: number) => {
    const dls = get().tempDls;
    dls.delete(id);
    set({ tempDls: dls });
  },
}));

export { useReceiverStore };
