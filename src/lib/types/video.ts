import { Timestamp } from 'firebase/firestore';

export type VideoStatus = 'pending_review' | 'published' | 'rejected' | 'changes_requested';
export type ChannelStatus = 'pending_approval' | 'approved' | 'rejected';
export type ChannelType = 'personal' | 'institutional';

export interface Video {
  videoId: string;
  uploaderUid: string;
  uploaderHandle: string;
  uploaderDisplayName: string;
  uploaderAvatarUrl: string | null;
  uploaderJurisdictionId: string | null;
  uploaderRoleLevel: number;
  channelId: string | null;
  channelHandle: string | null;
  title: string;
  description: string;
  tags: string[];
  category: string;
  thumbnailUrl: string | null;
  videoUrl: string;
  storagePath: string;
  durationSeconds: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  status: VideoStatus;
  moderatorNote: string | null;
  moderatedAt: Timestamp | null;
  moderatedBy: string | null;
  searchKeywords: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
}

export interface Channel {
  channelId: string;
  ownerUid: string;
  handle: string;
  name: string;
  channelType: ChannelType;
  description: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryCategory: string;
  subscriberCount: number;
  videoCount: number;
  status: ChannelStatus;
  createdAt: Timestamp;
  approvedAt: Timestamp | null;
  approvedBy: string | null;
}

export interface VideoComment {
  commentId: string;
  videoId: string;
  authorUid: string;
  authorHandle: string;
  authorDisplayName: string;
  authorAvatarUrl: string | null;
  text: string;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  isEdited: boolean;
}

export interface ChannelSubscribe {
  uid: string;
  createdAt: Timestamp;
}
