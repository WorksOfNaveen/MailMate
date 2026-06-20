import axios from 'axios';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Email } from '../utils/mailItemUtils';

const LOG = '[MailMate]';

function logAxiosError(label: string, error: unknown) {
  if (!axios.isAxiosError(error)) {
    console.log(LOG, label, '— error:', error);
    return;
  }
  console.log(LOG, label, '— status:', error.response?.status);
  console.log(
    LOG,
    label,
    '— data:',
    JSON.stringify(error.response?.data, null, 2),
  );
}

function decodeBody(data: string): string {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  return ReactNativeBlobUtil.base64.decode(base64);
}

function getBody(payload: any): string {
  if (payload.body?.data) {
    return decodeBody(payload.body.data);
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBody(part.body.data);
      }
    }
  }

  return '';
}

async function getMailContent(id: string, accessToken: string): Promise<Email> {
  try {
    const { data } = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          format: 'full',
        },
      },
    );

    const headers = data.payload.headers;

    return {
      id: data.id,
      subject: headers.find((h: any) => h.name === 'Subject')?.value ?? '',
      from: headers.find((h: any) => h.name === 'From')?.value ?? '',
      date: headers.find((h: any) => h.name === 'Date')?.value ?? '',
      snippet: data.snippet,
      labels: data.labelIds,
      body: getBody(data.payload),
    };
  } catch (error) {
    logAxiosError(`getMailContent(${id})`, error);
    throw error;
  }
}

async function getRecentMail(accessToken: string): Promise<Email[]> {
  try {
    const { data } = await axios.get(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          q: 'newer_than:7d',
        },
      },
    );

    const messageIds: { id: string }[] = data.messages ?? [];

    return Promise.all(
      messageIds.map(({ id }) => getMailContent(id, accessToken)),
    );
  } catch (error) {
    logAxiosError('getRecentMail', error);
    throw error;
  }
}

export { getRecentMail };
