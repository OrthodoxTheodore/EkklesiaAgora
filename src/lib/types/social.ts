import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  handle: string;             // URL-safe, unique, lowercase letters/numbers/underscores
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  jurisdictionId: string | null;
  patronSaint: string | null;
  followerCount: number;
  followingCount: number;
  postCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Post {
  postId: string;
  authorUid: string;
  authorHandle: string;
  authorDisplayName: string;
  authorAvatarUrl: string | null;
  authorJurisdictionId: string | null;
  authorRoleLevel: number;
  text: string;
  imageUrl: string | null;
  category: string;
  searchKeywords: string[];
  likeCount: number;
  commentCount: number;
  commentsRestricted: 'all' | 'followers';
  linkPreview: LinkPreview | null;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  isEdited: boolean;
}

export interface LinkPreview {
  url: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  siteName: string | null;
}

export interface Like {
  uid: string;
  createdAt: Timestamp;
}

export interface Comment {
  commentId: string;
  postId: string;
  authorUid: string;
  authorHandle: string;
  authorDisplayName: string;
  authorAvatarUrl: string | null;
  text: string;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  isEdited: boolean;
}

export interface Follow {
  followerUid: string;
  followedUid: string;
  createdAt: Timestamp;
}

export type FeedEntry = Post; // Full copy in userFeed subcollection

export interface Notification {
  notificationId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'moderation';
  fromUid: string;
  fromHandle: string;
  fromDisplayName: string;
  fromAvatarUrl: string | null;
  postId: string | null;
  postText: string | null;
  videoId: string | null;
  decision: 'published' | 'rejected' | 'changes_requested' | null;
  moderatorNote: string | null;
  read: boolean;
  createdAt: Timestamp;
}

export interface Block {
  blockedUid: string;
  createdAt: Timestamp;
}

export interface Mute {
  mutedUid: string;
  createdAt: Timestamp;
}
