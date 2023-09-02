import { create } from "zustand";
import { ShareRole } from "../astral/enums";

type ShareStore = {
  role: ShareRole;
  setRole: (role: ShareRole) => void;

  code?: string;
  setCode: (code?: string) => void;
};

const useShareStore = create<ShareStore>((set, get) => ({
  role: ShareRole.Sharer,
  setRole: (role: ShareRole) => set({ role: role }),
  setCode: (code?: string) => set({ code: code }),
}));

export { useShareStore };
