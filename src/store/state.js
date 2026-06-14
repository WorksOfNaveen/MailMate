import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessTkn: null,
  isLog: false,

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
}));
