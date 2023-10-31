import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ShareRole } from "../astral/enums";

interface SessionStore {
  id?: string;
  setId: (id: string) => void;

  code?: string;
  setCode: (code?: string) => void;

  role: ShareRole;
  setRole: (role: ShareRole) => void;
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
    role: ShareRole.Sender,
    setRole: (role) =>
      set((state) => {
        state.role = role;
      }),
  }))
);

export { useSessionStore };
