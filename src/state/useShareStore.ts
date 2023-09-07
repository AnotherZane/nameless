import { create } from "zustand";
import { ShareRole } from "../astral/enums";

interface ShareStore {
  role: ShareRole;
  setRole: (role: ShareRole) => void;

  code?: string;
  setCode: (code?: string) => void;
}

const useShareStore = create<ShareStore>((set) => ({
  role: ShareRole.Sender,
  setRole: (role: ShareRole) => set({ role: role }),
  setCode: (code?: string) => set({ code: code }),
}));

export { useShareStore };
