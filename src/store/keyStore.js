import * as Keychain from 'react-native-keychain';
import { useAuthStore } from './state';

const saveTkns = async () => {
  try {
    // const user = useAuthStore.getState().user;
    const accessTkn = useAuthStore.getState().accessTkn;

    await Keychain.setGenericPassword(
      `user`,
      JSON.stringify({
        accessTkn,
      }),
    );
  } catch (error) {
    console.log(error);
  }
};
const getTkns = async () => {
  try {
    const creds = await Keychain.getGenericPassword();
    if (!creds) {
      return null;
    }
    const tokens = JSON.parse(creds.password);

    return tokens;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export { saveTkns, getTkns };
