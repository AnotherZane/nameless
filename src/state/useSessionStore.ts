import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ShareRole } from "../astral/enums";
import { Share } from "./useShareStore";
import { useReceiverStore } from "./useReceiverStore";
import { loadFileProgress } from "../astral/transfers/TransferManager";
import { enableMapSet } from "immer";

enableMapSet();

interface SessionStore {
  id?: string;
  setId: (id: string) => void;

  code?: string;
  setCode: (code?: string) => void;

  role?: ShareRole;
  setRole: (role?: ShareRole) => void;

  reconnect?: string;
  reconnectShare: (shareId: string, share: Share) => void;

  hide: boolean;
  setHide: (hide: boolean) => void;

  transferComplete: boolean;
  setTransferComplete: (complete: boolean) => void;

  fileCount: number;
  incrementFileCount: () => void;

  startTime?: number;
  setStartTime: (time: number) => void;

  dataTransferred: Map<string, number>;
  incrementTransfer: (id: string, value: number) => void;
}

const useSessionStore = create(
  immer<SessionStore>((set) => ({
    setId: (id) =>
      set((state) => {
        state.id = id;
      }),
    setCode: (code) =>
      set((state) => {
        state.code = code;
      }),
    setRole: (role) =>
      set((state) => {
        state.role = role;
      }),
    reconnectShare: (shareId: string, share: Share) => {
      set((state) => {
        state.reconnect = shareId;
        state.id = shareId;
        state.role = share.role;
        state.code = share.code;
      });
      useReceiverStore.getState().addMetadata(...share.sharedMetadata);
      loadFileProgress(share.code, shareId);
    },
    hide: false,
    setHide: (hide: boolean) => set({ hide: hide }),
    transferComplete: false,
    setTransferComplete: (complete: boolean) =>
      set({ transferComplete: complete }),
    fileCount: 0,
    incrementFileCount: () =>
      set((state) => {
        return { fileCount: state.fileCount + 1 };
      }),
    setStartTime: (time: number) => set({ startTime: time }),
    dataTransferred: new Map(),
    incrementTransfer: (id: string, value: number) =>
      set((s) => {
        s.dataTransferred.set(id, (s.dataTransferred.get(id) ?? 0) + value);
      }),
  }))
);

export { useSessionStore };
