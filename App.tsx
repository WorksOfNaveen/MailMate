import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GenerativeScreen from './src/screens/GenerativeScreen';
import SignIn from './src/screens/SignIn';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from './src/components/SplashScreen';
import { useAuthStore } from './src/store/state';
import { useEffect } from 'react';
import { getTkns, saveTkns } from './src/store/keyStore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import MailList from './src/screens/MailList';
const Tab = createBottomTabNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const log = useAuthStore(state => state.isLog);
  const loading = useAuthStore(state => state.loading);
  useEffect(() => {
    const init = async () => {
      try {
        // first try to login through signInSilently
        console.log('[MailMate] auth init — trying signInSilently');
        const res = await GoogleSignin.signInSilently();
        if (res.type === 'success') {
          console.log('[MailMate] auth init — silent sign-in OK:', res.data.user.email);
          const tokens = await GoogleSignin.getTokens();
          useAuthStore.getState().save({
            user: res.data.user,
            accessTkn: tokens.accessToken,
          });
          await saveTkns();
          return;
        }

        console.log('[MailMate] auth init — silent sign-in failed, trying keychain');

        // fall back to keychains
        const saved = await getTkns();
        if (saved?.accessTkn) {
          console.log('[MailMate] auth init — restored token from keychain');
          useAuthStore.getState().save({
            user: saved.user ?? null,
            accessTkn: saved.accessTkn,
          });
          return;
        }

        console.log('[MailMate] auth init — no saved session, show sign-in');
      } catch (error) {
        console.log('[MailMate] auth init — error:', error);
      } finally {
        useAuthStore.getState().setloading(false);
      }
    };
    init();
  }, []);

  if (loading) return <SplashScreen />;
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        {log ? <MainTabs /> : <SignInFunc />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="GenScreen" component={GenerativeScreen} />
      <Tab.Screen name="MailList" component={MailList} />
    </Tab.Navigator>
  );
}
function SignInFunc() {
  return <SignIn />;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
