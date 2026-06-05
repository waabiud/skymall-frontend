import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      isDark: false,
      toggle: () => set((state) => {
        const next = !state.isDark;
        document.documentElement.classList.toggle('dark', next);
        return { isDark: next };
      }),
      init: () => {
        const stored = JSON.parse(localStorage.getItem('skymall-theme') || '{}');
        if (stored?.state?.isDark) {
          document.documentElement.classList.add('dark');
        }
      },
    }),
    { name: 'skymall-theme' }
  )
);

export default useThemeStore;
