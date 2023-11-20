import { create } from "zustand";
import { StorageValue, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { MemberState, ShareRole } from "../astral/enums";
import { customAlphabet } from "nanoid";
import { enableMapSet } from "immer";
import { FileMetadata } from "../astral/models";

const nanoid = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
);

enableMapSet();

interface Share {
  code: string;
  role: ShareRole;
  connectionId: string;
  reconnectToken: string;
  sharedMetadata: FileMetadata[];
  created: number;
  state: MemberState;
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
  setState: (id: string, state: MemberState) => void;
  setCredentials: (
    id: string,
    connectionId: string,
    reconnectToken: string
  ) => void;
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
      ) => {
        const id = nanoid(12);

        set((state) => {
          state.shares.set(id, {
            code,
            role,
            connectionId,
            reconnectToken,
            sharedMetadata: [],
            created: Date.now(),
            state:
              role == ShareRole.Sender
                ? MemberState.OwnerConnected
                : MemberState.Receiver,
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
          const share = state.shares.get(id);
          if (share) {
            share.sharedMetadata = files;
          }
        }),
      setState: (id: string, memberState: MemberState) =>
        set((state) => {
          const share = state.shares.get(id);
          if (share) share.state = memberState;
        }),
      setCredentials: (
        id: string,
        connectionId: string,
        reconnectToken: string
      ) =>
        set((state) => {
          const share = state.shares.get(id);
          if (share) {
            share.connectionId = connectionId;
            share.reconnectToken = reconnectToken;
          }
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
export type { Share };
