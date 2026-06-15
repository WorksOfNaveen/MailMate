import { create } from 'zustand';
// import 

export const useAuthStore = create((set, get) => ({
  user: null,
  accessTkn: null,
  isLog: false,
  loading: true,
  authenticated: false,

  save: ({ user, accessTkn, refreshTkn }) =>
    set({
      user,
      accessTkn,
      isLog: true,
    }),
  clearAuth: () =>
    set({
      user: null,
      accessTkn: null,
      isLog: false,
    }),
  setloading: loading => set({ loading }),
  setIsAuth: () =>
    set({
      authenticated: !get().authenticated,
    }),
}));
