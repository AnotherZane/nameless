import { create } from "zustand";

interface SenderStore {
  sharedFiles: File[];
  addFiles: (...files: File[]) => void;
  removeFile: (file: File) => void;
  clearFiles: () => void;
}

const useSenderStore = create<SenderStore>((set, get) => ({
  sharedFiles: [],
  addFiles: (...files: File[]) => {
    const shared = get().sharedFiles;
    shared.push(...files);
    set({ sharedFiles: shared });
  },
  removeFile: (file: File) => {
    const shared = get().sharedFiles;

    const idx = shared.indexOf(file);
    if (idx > -1) {
      shared.splice(idx, 1);
    }

    set({ sharedFiles: shared });
  },
  clearFiles: () => set({ sharedFiles: [] }),
}));

export { useSenderStore };
