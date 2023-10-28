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
      theme: window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",
      setTheme: (theme: ThemeOptions) => {
        set({ theme: theme });
        window.gtag("event", "update_theme", {
          theme: theme,
        });
      },
      toggleTheme: () => {
        const newTheme = get().theme == "dark" ? "light" : "dark";
        set({ theme: newTheme });
        window.gtag("event", "update_theme", {
          theme: newTheme,
        });
      },
    }),
    {
      name: "theme",
    }
  )
);

export { useThemeStore };
