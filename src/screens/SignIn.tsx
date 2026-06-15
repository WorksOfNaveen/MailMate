import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import { useAuthStore } from '../store/state';
import { saveTkns } from '../store/keyStore';
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
  scopes: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
  ],
});
const SignIn = () => {
  const isLog = useAuthStore(state => state.isLog);
  const user = useAuthStore(state => state.user);
  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (response.type === 'cancelled') return;
      const { user: googleUser } = response.data;
      const tokens = await GoogleSignin.getTokens();
      useAuthStore.getState().save({
        user: googleUser,
        accessTkn: tokens.accessToken,
      });
      await saveTkns(); // persist for next app launch
    } catch (e) {
      console.log(e);
    }
  };

  //  shows auto login
  if (isLog) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Signed in successfully</Text>
        <Text style={styles.subtitle}>{user?.name ?? 'Welcome'}</Text>
        {user?.email ? <Text style={styles.text}>{user.email}</Text> : null}
      </View>
    );
  }

  return (
    // shows sign in
    <View style={styles.container}>
      <Text style={styles.title}>MailMate</Text>
      <Text style={styles.subtitle}>Sign in to access your mail</Text>
      <Pressable style={styles.button} onPress={signIn}>
        <Text style={styles.buttonText}>Continue with Google</Text>
      </Pressable>
    </View>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 220,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
