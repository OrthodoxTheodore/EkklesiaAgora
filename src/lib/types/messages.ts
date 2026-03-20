import { Timestamp } from 'firebase/firestore';

export interface Conversation {
  conversationId: string;
  participantUids: string[];
  participantProfiles: {
    [uid: string]: {
      displayName: string;
      avatarUrl: string | null;
      handle: string;
    };
  };
  lastMessage: string;
  lastMessageAt: Timestamp;
  lastMessageSenderUid: string;
  unreadCounts: { [uid: string]: number };
  createdAt: Timestamp;
}

export interface Message {
  messageId: string;
  senderUid: string;
  senderDisplayName: string;
  senderAvatarUrl: string | null;
  text: string;
  createdAt: Timestamp;
  seenAt: Timestamp | null;
  seenBy: string[];
}
