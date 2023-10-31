import { create } from "zustand";
import { StorageValue, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { ShareRole } from "../astral/enums";
import { nanoid } from "nanoid";
import { enableMapSet } from "immer";
import { FileMetadata } from "../astral/models";

enableMapSet();

interface Share {
  code: string;
  role: ShareRole;
  connectionId: string;
  reconnectToken: string;
  sharedMetadata: FileMetadata[];
}

interface ShareStore {
  shares: Map<string, Share>;
  addShare: (
    code: string,
    role: ShareRole,
    connectionId: string,
    reconnectToken: string
    // ownerId: string
  ) => string;
  getShare: (id: string) => Share | undefined;
  deleteShare: (id: string) => void;

  setMetadata: (id: string, files: FileMetadata[]) => void;
}

const useShareStore = create<ShareStore>()(
  persist(
    immer<ShareStore>((set, get) => ({
      shares: new Map(),
      addShare: (
        code: string,
        role: ShareRole,
        connectionId: string,
        reconnectToken: string
        // ownerId: string
      ) => {
        const id = nanoid(12);

        set((state) => {
          state.shares.set(id, {
            code,
            role,
            connectionId,
            reconnectToken,
            sharedMetadata: [],
          });
        });

        return id;
      },
      getShare: (id: string) => get().shares.get(id),
      deleteShare: (id: string) =>
        set((state) => {
          state.shares.delete(id);
        }),
      setMetadata: (id: string, files: FileMetadata[]) =>
        set((state) => {
          state.shares.get(id)?.sharedMetadata.push(...files);
        }),
    })),
    {
      name: "shareStore",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              shares: new Map(state.shares),
            },
          };
        },
        setItem: (name, newValue: StorageValue<ShareStore>) => {
          const str = JSON.stringify({
            state: {
              ...newValue.state,
              shares: Array.from(newValue.state.shares.entries()),
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export { useShareStore };
