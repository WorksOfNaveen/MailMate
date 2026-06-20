export type Email = {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  labels: string[];
  body: string;
};

export function parseSender(from: string) {
  const name =
    from
      .replace(/<[^>]+>/, '')
      .replace(/"/g, '')
      .trim() || from;
  return {
    name,
    initial: name.charAt(0).toUpperCase(),
  };
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  const daysDiff = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (daysDiff < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function avatarColor(name: string) {
  const colors = [
    '#1A73E8',
    '#E37400',
    '#0B8043',
    '#D50000',
    '#8E24AA',
    '#0097A7',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function isUnread(labels: string[] | undefined) {
  return labels?.includes('UNREAD') ?? false;
}
