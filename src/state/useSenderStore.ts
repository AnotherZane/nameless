import { create } from "zustand";
import { getRandomInt } from "../utils";

interface SenderStore {
  sharedFiles: Map<number, File>;
  addFiles: (...files: File[]) => File[];
  removeFile: (id: number) => void;
  clearFiles: () => void;
}

const useSenderStore = create<SenderStore>((set, get) => ({
  sharedFiles: new Map<number, File>(),
  addFiles: (...files: File[]) => {
    const shared = get().sharedFiles;
    const alreadyExists = [];

    for (const file of files) {
      if (
        Array.from(shared.values()).findIndex(
          (x) =>
            x.name == file.name &&
            x.size == file.size &&
            x.lastModified == file.lastModified &&
            x.webkitRelativePath == file.webkitRelativePath
        ) != -1
      ) {
        alreadyExists.push(file);
        continue;
      }

      let rand = getRandomInt(0, 4294967294);
      while (shared.has(rand)) {
        rand = getRandomInt(0, 4294967294);
      }

      shared.set(rand, file);
    }

    set({ sharedFiles: shared });

    return alreadyExists;
  },
  removeFile: (id: number) => {
    const shared = get().sharedFiles;
    shared.delete(id);
    set({ sharedFiles: shared });
  },
  clearFiles: () => set({ sharedFiles: new Map<number, File>() }),
}));

export { useSenderStore };
