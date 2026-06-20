import { FlatList, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/state';
import SplashScreen from '../components/SplashScreen';
import MailItem from '../components/MailItem';
import { Email } from '../utils/mailItemUtils';
import { MailStackParamList } from '../types/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
type nav = NativeStackNavigationProp<MailStackParamList, 'MailList'>;
const MailList = () => {
  const [mails, setMails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<nav>();
  useEffect(() => {
    useAuthStore
      .getState()
      .setMailsList()
      .then(() => {
        setMails(useAuthStore.getState().mails);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <SplashScreen />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={mails}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <MailItem
          item={item}
          onPress={() => navigation.navigate('Details', { item })}
        />
      )}
      contentContainerStyle={mails.length === 0 ? styles.empty : undefined}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default MailList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  empty: {
    flexGrow: 1,
  },
});
