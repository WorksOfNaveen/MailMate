import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MailList from '../screens/MailList';
import DetailsScreen from '../screens/DetailsScreen';
import { MailStackParamList } from '../types/types';

const Stack = createNativeStackNavigator<MailStackParamList>();

export default function MailStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerShadowVisible: false,
        headerTintColor: '#5F6368',
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen
        name="MailList"
        component={MailList}
        options={{ title: 'Inbox' }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{ title: '', headerBackTitle: 'Inbox' }}
      />
    </Stack.Navigator>
  );
}
