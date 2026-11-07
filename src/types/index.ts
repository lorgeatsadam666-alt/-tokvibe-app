export type ThemeMode = 'system' | 'light' | 'black' | 'midnight' | 'cyber' | 'studio';
export type AccentColor = 'TokVibe' | 'cyan' | 'emerald' | 'amber' | 'rose';
export type SupportedLanguage = 'fr' | 'en' | 'es' | 'de' | 'ar' | 'it' | 'pt' | 'ja' | 'zh' | 'ko' | 'tr';

export interface UserProfile {
  uid: string;
  email?: string;
  displayName: string;
  handle: string;
  photoURL: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  likesReceived: number;
  isCreator: boolean;
  isVerified?: boolean;
  monetizationEnabled: boolean;
  walletBalance: number;
  theme: ThemeMode;
  accent: AccentColor;
  language: SupportedLanguage;
  privateAccount: boolean;
  allowComments: 'everyone' | 'followers' | 'none';
  activityStatus: boolean;
  aiRecommenderVibe: string;
  userTags?: string[];
  favoriteFolders?: FavoriteFolder[];
  nameLastChangedAt?: string;
  handleLastChangedAt?: string;
  birthDate?: string;
  idCountry?: string;
  idType?: 'passport' | 'id_card' | 'driver_license';
  idDocumentUrl?: string;
  verificationStatus?: 'none' | 'pending' | 'verified' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
  onboardingCompleted?: boolean;
}

export type FilterPreset = 'none' | 'vhs' | 'sunset' | 'noir' | 'beauty' | 'matrix' | 'vintage90s';

export interface VideoItem {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  authorVerified?: boolean;
  caption: string;
  videoUrl: string;
  thumbnailUrl?: string;
  musicTitle: string;
  musicAuthor: string;
  filter: FilterPreset;
  tags: string[];
  category: 'dance' | 'tech' | 'food' | 'nature' | 'art' | 'lifestyle' | 'sports' | 'extreme_sports' | 'combat';
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  sharesCount: number;
  viewsCount: number;
  earnings: number;
  createdAt: string;
  createdAtTimestamp?: number;
  comments?: CommentItem[];
  isPinned?: boolean;
  hasSafetyWarning?: boolean;
  safetyWarningText?: string;
  allowDownload?: boolean;
  downloadsCount?: number;
  allowReuse?: boolean;
}

export interface CommentItem {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
  timestamp?: string;
  authorHandle?: string;
  authorName?: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: 'like' | 'comment' | 'follow' | 'monetization' | 'tip';
  text: string;
  videoId?: string;
  read: boolean;
  createdAt: string;
}

export interface CreatorAnalytics {
  totalViews: number;
  watchTimeHours: number;
  completionRate: number;
  engagementRate: number;
  estimatedEarnings: number;
  rpm: number;
  topCountries: { name: string; pct: number }[];
  demographics: { age: string; pct: number }[];
  viewsHistory: { day: string; views: number }[];
}

export interface AIPreferences {
  vibe: 'balanced' | 'viral' | 'tech' | 'chill' | 'creative';
  humorWeight: number;
  techWeight: number;
  creativeWeight: number;
  musicWeight: number;
}

export interface StoryItem {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  imageUrl: string;
  createdAt: number;
  expiresAt: number;
  isViewed?: boolean;
}

export interface FavoriteFolder {
  id: string;
  name: string;
  emoji?: string;
  color?: string;
  videoIds: string[];
  isPrivate?: boolean;
  createdAt: string;
}
