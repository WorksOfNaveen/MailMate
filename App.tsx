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
const Tab = createBottomTabNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const log = useAuthStore(state => state.isLog);
  const loading = useAuthStore(state => state.loading);
  useEffect(() => {
    const init = async () => {
      try {
        // first try to login through signInSilently
        const res = await GoogleSignin.signInSilently();
        if (res.type === 'success') {
          const tokens = await GoogleSignin.getTokens();
          useAuthStore.getState().save({
            user: res.data.user,
            accessTkn: tokens.accessToken,
          });
          await saveTkns();
          return;
        }

        // fall back to keychains
        const saved = await getTkns();
        if (saved?.accessTkn) {
          useAuthStore.getState().save({
            user: saved.user ?? null,
            accessTkn: saved.accessTkn,
          });
          return;
        }

        // if both fails which means fresh login
      } catch (error) {
        console.log(error);
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
    </Tab.Navigator>
  );
}
function SignInFunc() {
  return <Tab.Screen name="SignIn" component={SignIn} />;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
