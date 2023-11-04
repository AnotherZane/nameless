import { create } from "zustand";
import { FileMetadata } from "../astral/models";
import { useShareStore } from "./useShareStore";
import { useSessionStore } from "./useSessionStore";
interface ReceiverStore {
  sharedMetadata: FileMetadata[];
  progress: Map<number, number>;
  addMetadata: (...files: FileMetadata[]) => void;
  removeMetadata: (file: FileMetadata) => void;
  clearMetadata: () => void;
  setProgress: (id: number, val: number) => void;
}

const useReceiverStore = create<ReceiverStore>((set, get) => ({
  sharedMetadata: [],
  progress: new Map<number, number>(),
  addMetadata: (...files: FileMetadata[]) => {
    const shared = get().sharedMetadata;
    set({ sharedMetadata: [...shared, ...files] });

    for (const file of files) {
      get().setProgress(file.id, 0);
    }

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
  setProgress: (id: number, val: number) => {
    const prog = get().progress;
    prog.set(id, val);

    set({ progress: prog });
  },
}));

export { useReceiverStore };
