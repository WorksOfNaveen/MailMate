import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import {
  avatarColor,
  Email,
  formatDate,
  isUnread,
  parseSender,
} from '../utils/mailItemUtils';

type Props = { item: Email };

const MailItem = ({ item }: Props) => {
  const unread = isUnread(item.labels);
  const { name, initial } = parseSender(item.from);

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: avatarColor(name) }]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.topLine}>
          <Text
            style={[styles.sender, unread && styles.unreadText]}
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
        </View>

        <Text
          style={[styles.subject, unread && styles.unreadText]}
          numberOfLines={1}
        >
          {item.subject || '(no subject)'}
        </Text>

        <Text style={styles.snippet} numberOfLines={2}>
          {item.snippet}
        </Text>
      </View>
    </View>
  );
};

export default MailItem;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EAED',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  sender: {
    flex: 1,
    fontSize: 15,
    color: '#5F6368',
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    color: '#5F6368',
  },
  subject: {
    fontSize: 14,
    color: '#5F6368',
    marginBottom: 2,
  },
  snippet: {
    fontSize: 13,
    lineHeight: 18,
    color: '#80868B',
  },
  unreadText: {
    color: '#202124',
    fontWeight: '700',
  },
});
