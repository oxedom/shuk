import { UserInstance, UserRole } from "@oxedom/shared-shuk";

import { create } from "zustand";

export interface UserState {
  roles: UserRole[];
  addRole: (role: UserRole) => void;
  removeRole: (role: UserRole) => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  resetRoles: () => void;
  loadedRoles: boolean;
  setLoadedRoles: (loaded: boolean) => void;
  user: UserInstance | null;
  setUser: (user: UserInstance | null) => void;
}

const useUserStore = create<UserState>()((set, get) => {
  return {
    roles: [UserRole.TRAINEE],
    addRole: (role) =>
      set((state) => ({
        roles: state.roles.includes(role)
          ? state.roles
          : [...state.roles, role],
      })),
    resetRoles: () => set({ roles: [UserRole.TRAINEE] }),
    removeRole: (role) =>
      set((state) => ({
        roles: state.roles.filter((r) => r !== role),
      })),
    loadedRoles: false,
    user: null,
    setUser: (user) => set({ user }),
    hasRole: (role) => get().roles.includes(role),
    hasAnyRole: (roles) => get().roles.some((role) => roles.includes(role)),
    setLoadedRoles: (loaded) => set({ loadedRoles: loaded }),
  };
});

export default useUserStore;
