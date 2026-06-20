import { create } from 'zustand';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getRecentMail } from './apiCall';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessTkn: null,
  isLog: false,
  loading: true,
  authenticated: false,
  mails: [],

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
  setLogout: async () => {
    await GoogleSignin.signOut();
    set({
      user: null,
      accessTkn: null,
      isLog: false,
    });
  },
  setMailsList: async () => {
    try {
      const { accessToken } = await GoogleSignin.getTokens();
      set({ accessTkn: accessToken });
      const res = await getRecentMail(accessToken);
      set({ mails: res });
    } catch (error) {
      console.log('[MailMate] setMailsList — failed:', error);
      throw error;
    }
  },
}));
