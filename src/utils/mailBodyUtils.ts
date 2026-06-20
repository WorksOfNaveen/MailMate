import ReactNativeBlobUtil from 'react-native-blob-util';

type GmailPart = {
  mimeType?: string;
  filename?: string;
  body?: { data?: string; attachmentId?: string };
  parts?: GmailPart[];
};

export type EmailImageRef = {
  attachmentId?: string;
  mimeType: string;
  filename?: string;
  dataUri?: string;
};

export function toDataUri(mimeType: string, base64url: string): string {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return `data:${mimeType};base64,${padded}`;
}

/* eslint-disable no-bitwise -- UTF-8 decoding requires bitwise byte operations */
function utf8Decode(bytes: Uint8Array): string {
  let result = '';
  let i = 0;

  while (i < bytes.length) {
    const byte1 = bytes[i++];

    if (byte1 < 0x80) {
      result += String.fromCharCode(byte1);
      continue;
    }

    if ((byte1 & 0xe0) === 0xc0) {
      const byte2 = bytes[i++];
      result += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
      continue;
    }

    if ((byte1 & 0xf0) === 0xe0) {
      const byte2 = bytes[i++];
      const byte3 = bytes[i++];
      result += String.fromCharCode(
        ((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f),
      );
      continue;
    }

    if ((byte1 & 0xf8) === 0xf0) {
      const byte2 = bytes[i++];
      const byte3 = bytes[i++];
      const byte4 = bytes[i++];
      let codePoint =
        ((byte1 & 0x07) << 18) |
        ((byte2 & 0x3f) << 12) |
        ((byte3 & 0x3f) << 6) |
        (byte4 & 0x3f);
      codePoint -= 0x10000;
      result += String.fromCharCode(
        0xd800 + (codePoint >> 10),
        0xdc00 + (codePoint & 0x3ff),
      );
    }
  }

  return result;
}
/* eslint-enable no-bitwise */

function decodeBase64Body(data: string): string {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = ReactNativeBlobUtil.base64.decode(padded);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return utf8Decode(bytes);
}

function htmlToPlainText(html: string): string {
  let text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|h[1-6])>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '');

  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

export function normalizeEmailBody(text: string): string {
  return (
    text
      .replace(/\u00A0/g, ' ')
      .replace(/\u00C2\u00A0/g, ' ')
      .replace(/\u00C2(?=\s|$)/g, '')
      // remove bracketed URLs: [https://...]
      .replace(/\s*\[https?:\/\/[^\]]+\]/g, '')
      // remove bare URLs (http/https)
      .replace(/https?:\/\/\S+/g, '')
      // normalise line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // join soft-wrapped lines: a single \n between two non-empty lines
      // becomes a space so they flow as one paragraph
      .replace(/([^\n])\n([^\n])/g, '$1 $2')
      // collapse 3+ blank lines to one blank line
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

function decodePart(part: GmailPart): string {
  if (!part.body?.data) {
    return '';
  }

  const raw = decodeBase64Body(part.body.data);
  if (part.mimeType === 'text/html') {
    return normalizeEmailBody(htmlToPlainText(raw));
  }
  return normalizeEmailBody(raw);
}

function collectLeafParts(parts: GmailPart[], result: GmailPart[]) {
  for (const part of parts) {
    if (part.parts?.length) {
      collectLeafParts(part.parts, result);
    } else if (part.body?.data) {
      result.push(part);
    }
  }
}

export function extractBodyFromPayload(payload: GmailPart): string {
  if (payload.parts?.length) {
    const leaves: GmailPart[] = [];
    collectLeafParts(payload.parts, leaves);

    const plain = leaves.find(
      part => part.mimeType === 'text/plain' && part.body?.data,
    );
    if (plain) {
      return decodePart(plain);
    }

    const html = leaves.find(
      part => part.mimeType === 'text/html' && part.body?.data,
    );
    if (html) {
      return decodePart(html);
    }
  }

  if (payload.body?.data) {
    return decodePart(payload);
  }

  return '';
}

function collectImageParts(part: GmailPart, result: EmailImageRef[]) {
  if (part.parts?.length) {
    for (const child of part.parts) {
      collectImageParts(child, result);
    }
    return;
  }

  if (!part.mimeType?.startsWith('image/')) {
    return;
  }

  if (part.body?.data) {
    result.push({
      mimeType: part.mimeType,
      filename: part.filename,
      dataUri: toDataUri(part.mimeType, part.body.data),
    });
    return;
  }

  if (part.body?.attachmentId) {
    result.push({
      attachmentId: part.body.attachmentId,
      mimeType: part.mimeType,
      filename: part.filename,
    });
  }
}

export function extractImagesFromPayload(payload: GmailPart): EmailImageRef[] {
  const images: EmailImageRef[] = [];
  collectImageParts(payload, images);
  return images;
}
