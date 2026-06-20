import axios from 'axios';
import { Email } from '../utils/mailItemUtils';
import {
  extractBodyFromPayload,
  extractImagesFromPayload,
  toDataUri,
} from '../utils/mailBodyUtils';

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
      body: extractBodyFromPayload(data.payload),
      images: extractImagesFromPayload(data.payload),
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
          q: 'in:inbox -category:promotions -in:spam newer_than:7d',
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

async function getAttachmentData(
  messageId: string,
  attachmentId: string,
  accessToken: string,
  mimeType: string,
): Promise<string> {
  const { data } = await axios.get(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return toDataUri(mimeType, data.data);
}

export { getRecentMail, getAttachmentData };
