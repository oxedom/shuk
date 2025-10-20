import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GlobalState {
  sidebarExpanded: boolean;
  isMobileSidebarOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  currentThemeName: string | null;
  setCurrentThemeName: (themeName: string) => void;
  toggleGlobalLoading: (loading: boolean) => void;
  globalLoading: boolean;
  handleLinkClick: (path: string) => void;
  closeSidebar: () => void;
}

const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      sidebarExpanded: true, // Default to expanded on desktop
      isMobileSidebarOpen: false,
      globalLoading: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
      toggleMobileSidebar: () =>
        set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
      closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
      closeSidebar: () => set({ sidebarExpanded: false }),
      currentThemeName: null,
      setCurrentThemeName: (themeName: string) =>
        set({ currentThemeName: themeName }),
      toggleGlobalLoading: (loading: boolean) =>
        set({ globalLoading: loading }),
      handleLinkClick: (path: string) => {
        if (!path || window.location.pathname === path) {
          console.warn("no path or same path");
          return;
        }
        set({ globalLoading: true });
      },
    }),
    {
      name: "global-storage",
      partialize: (state) => ({
        sidebarExpanded: state.sidebarExpanded,
        isMobileSidebarOpen: state.isMobileSidebarOpen,
        currentThemeName: state.currentThemeName,
      }),
    },
  ),
);

export default useGlobalStore;
