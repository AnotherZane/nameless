import { create } from "zustand";
import { FileMetadata } from "../astral/models";
import streamSaver from "streamsaver";

interface ReceiverStore {
  sharedMetadata: FileMetadata[];
  addMetadata: (...files: FileMetadata[]) => void;
  removeMetadata: (file: FileMetadata) => void;
  clearMetadata: () => void;
  writers: Map<number, WritableStreamDefaultWriter>;
  getOrCreateWriter: (id: number) => WritableStreamDefaultWriter;
  removeWriter: (id: number) => void;
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
  writers: new Map<number, WritableStreamDefaultWriter>(),
  getOrCreateWriter: (id: number) => {
    const writers = get().writers;
    let writer = writers.get(id);

    if (!writer) {
      const meta = get().sharedMetadata.find((m) => m.id == id)!;

      streamSaver.mitm = "/stream/mitm.html";
      const downloadStream = streamSaver.createWriteStream(meta.name, {
        size: meta.size,
      });

      writer = downloadStream.getWriter();
      writers.set(id, writer);
      set({ writers: writers });
    }

    return writer;
  },
  removeWriter: (id: number) => {
    const writers = get().writers;
    writers.delete(id);
    set({ writers: writers });
  },
}));

export { useReceiverStore };
