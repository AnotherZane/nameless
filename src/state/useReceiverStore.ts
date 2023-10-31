import { create } from "zustand";
import { FileMetadata } from "../astral/models";
import { useShareStore } from "./useShareStore";
import { useSessionStore } from "./useSessionStore";
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
    set({ sharedMetadata: [...shared, ...files] });

    const sid = useSessionStore.getState().id;
    if (sid) {
      useShareStore.getState().setMetadata(sid, [...shared, ...files]);
    }
  },
  removeMetadata: (file: FileMetadata) => {
    const shared = get().sharedMetadata;

    const idx = shared.indexOf(file);
    if (idx > -1) {
      shared.splice(idx, 1);
    }

    set({ sharedMetadata: shared });

    const sid = useSessionStore.getState().id;
    if (sid) {
      useShareStore.getState().setMetadata(sid, shared);
    }
  },
  clearMetadata: () => {
    set({ sharedMetadata: [] });

    const sid = useSessionStore.getState().id;
    if (sid) {
      useShareStore.getState().setMetadata(sid, []);
    }
  },
}));

export { useReceiverStore };
