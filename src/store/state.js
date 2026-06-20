import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';
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
    await Keychain.resetGenericPassword();
    await GoogleSignin.signOut();
    set({
      user: null,
      accessTkn: null,
      isLog: false,
    });
  },
  setMailsList: async () => {
    const accessTkn = get().accessTkn;
    if (!accessTkn) {
      console.log('[MailMate] setMailsList — no access token, skipping');
      return;
    }

    console.log('[MailMate] setMailsList — fetching mail...');
    try {
      const res = await getRecentMail(accessTkn);
      console.log('[MailMate] setMailsList — loaded', res.length, 'mails');
      set({ mails: res });
    } catch (error) {
      console.log('[MailMate] setMailsList — failed:', error);
      throw error;
    }
  },
}));
