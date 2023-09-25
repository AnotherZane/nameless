import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeOptions = "dark" | "light";

interface ThemeStore {
  theme: ThemeOptions;
  setTheme: (theme: ThemeOptions) => void;
  toggleTheme: () => void;
}

const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme:
        window && window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      setTheme: (theme: ThemeOptions) => set({ theme: theme }),
      toggleTheme: () =>
        set({ theme: get().theme == "dark" ? "light" : "dark" }),
    }),
    {
      name: "theme",
    }
  )
);

export { useThemeStore };
