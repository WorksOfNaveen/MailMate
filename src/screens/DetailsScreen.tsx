import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { MailStackParamList } from '../types/types';
import {
  avatarColor,
  formatDetailDate,
  parseSender,
} from '../utils/mailItemUtils';
import { normalizeEmailBody } from '../utils/mailBodyUtils';
import { getAttachmentData } from '../store/apiCall';

type RouteType = RouteProp<MailStackParamList, 'Details'>;

const screenWidth = Dimensions.get('window').width;

const DetailsScreen = () => {
  const { item } = useRoute<RouteType>().params;
  const { name, email, initial } = parseSender(item.from);
  const body = normalizeEmailBody(item.body?.trim() || item.snippet);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [imagesLoading, setImagesLoading] = useState(
    (item.images?.length ?? 0) > 0,
  );

  useEffect(() => {
    let cancelled = false;

    async function loadImages() {
      const images = item.images ?? [];
      if (images.length === 0) {
        setImagesLoading(false);
        return;
      }

      const uris: string[] = [];
      const toFetch = images.filter(img => !img.dataUri && img.attachmentId);

      for (const img of images) {
        if (img.dataUri) {
          uris.push(img.dataUri);
        }
      }

      if (toFetch.length === 0) {
        if (!cancelled) {
          setImageUris(uris);
          setImagesLoading(false);
        }
        return;
      }

      try {
        const { accessToken } = await GoogleSignin.getTokens();
        const fetched = await Promise.all(
          toFetch.map(img =>
            getAttachmentData(
              item.id,
              img.attachmentId!,
              accessToken,
              img.mimeType,
            ),
          ),
        );
        if (!cancelled) {
          setImageUris([...uris, ...fetched]);
        }
      } catch (error) {
        console.log('[MailMate] loadImages — error:', error);
        if (!cancelled) {
          setImageUris(uris);
        }
      } finally {
        if (!cancelled) {
          setImagesLoading(false);
        }
      }
    }

    loadImages();
    return () => {
      cancelled = true;
    };
  }, [item.id, item.images]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.subject}>{item.subject || '(no subject)'}</Text>

      <View style={styles.senderRow}>
        <View style={[styles.avatar, { backgroundColor: avatarColor(name) }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.senderInfo}>
          <View style={styles.senderTop}>
            <Text style={styles.senderName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.date}>{formatDetailDate(item.date)}</Text>
          </View>
          {email ? (
            <Text style={styles.senderEmail} numberOfLines={1}>
              {email}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.divider} />

      {imagesLoading ? (
        <ActivityIndicator
          style={styles.imagesLoading}
          color="#1A73E8"
          size="small"
        />
      ) : null}

      {imageUris.map((uri, index) => (
        <Image
          key={`${item.id}-img-${index}`}
          source={{ uri }}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel={item.images?.[index]?.filename ?? 'Email image'}
        />
      ))}

      <Text style={styles.body}>{body}</Text>
    </ScrollView>
  );
};

export default DetailsScreen;

const imageWidth = screenWidth - 32;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  subject: {
    fontSize: 22,
    fontWeight: '400',
    color: '#202124',
    lineHeight: 28,
    marginBottom: 20,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  senderInfo: {
    flex: 1,
    minWidth: 0,
  },
  senderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  senderName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#202124',
  },
  date: {
    fontSize: 12,
    color: '#5F6368',
    flexShrink: 0,
  },
  senderEmail: {
    marginTop: 2,
    fontSize: 12,
    color: '#5F6368',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8EAED',
    marginVertical: 20,
  },
  imagesLoading: {
    marginBottom: 12,
  },
  image: {
    width: imageWidth,
    height: imageWidth * 0.6,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#F1F3F4',
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: '#202124',
  },
});
