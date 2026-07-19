import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeState } from "@/types";

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "light",

      toggle: () =>
        set((state) => {
          const newMode = state.mode === "light" ? "dark" : "light";
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", newMode === "dark");
          }
          return { mode: newMode };
        }),

      setMode: (mode) => {
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", mode === "dark");
        }
        set({ mode });
      },
    }),
    {
      name: "minutely-theme",
      onRehydrateStorage: () => (state) => {
        if (state?.mode === "dark" && typeof document !== "undefined") {
          document.documentElement.classList.add("dark");
        }
      },
    }
  )
);
