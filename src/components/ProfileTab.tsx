import React, { useState, useRef } from 'react';
import {
  Settings,
  Shield,
  Award,
  Bookmark,
  Heart,
  Grid,
  Play,
  LogOut,
  UserCheck,
  UserPlus,
  Edit3,
  DollarSign,
  Lock,
  Check,
  ShieldCheck,
  X,
  Repeat2,
  Radio,
  Globe,
  StopCircle,
  History,
  Clock,
  Trash2,
  Scissors,
  Sparkles,
  BarChart3,
  RefreshCw,
  Eye,
  MessageSquare,
  ChevronDown,
  Pin,
  Users,
  ArrowLeft,
  Search,
  Folder,
  FolderPlus,
  FolderHeart,
  ChevronRight,
  Camera,
  Image,
  Upload,
} from 'lucide-react';
import { UserProfile, VideoItem, CommentItem, FavoriteFolder } from '../types';
import { TikFlowLogo } from './SplashScreen';

export interface WatchHistoryEntry {
  videoId: string;
  watchedAt: string;
}

interface ProfileTabProps {
  user: UserProfile | null;
  allVideos: VideoItem[];
  bookmarkedVideoIds: string[];
  likedVideoIds: string[];
  repostedVideoIds?: string[];
  followedAuthorIds?: string[];
  watchHistory?: WatchHistoryEntry[];
  onRemoveFromWatchHistory?: (videoId: string) => void;
  onClearWatchHistory?: () => void;
  isUserLive?: boolean;
  liveHostIds?: string[];
  onStartUserLive?: (title: string) => void;
  onStopUserLive?: () => void;
  onOpenLive?: (hostId?: string) => void;
  onToggleFollow?: (authorId: string) => void;
  onOpenAuth: () => void;
  onOpenCreatorStudio: () => void;
  onOpenVideoAnalytics?: (video?: VideoItem) => void;
  onOpenProfileVisitors?: () => void;
  onOpenStudioEditor?: () => void;
  onRefreshProfile?: () => void;
  onOpenPrivacy: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onSelectVideo: (videoId: string) => void;
  onSelectCreator?: (authorId: string) => void;
  currentUserId?: string;
  onTogglePin?: (videoId: string) => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onBackToFeed?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  allVideos,
  bookmarkedVideoIds,
  likedVideoIds,
  repostedVideoIds = [],
  followedAuthorIds = [],
  watchHistory = [],
  onRemoveFromWatchHistory,
  onClearWatchHistory,
  isUserLive = false,
  liveHostIds = [],
  onStartUserLive,
  onStopUserLive,
  onOpenLive,
  onToggleFollow,
  onOpenAuth,
  onOpenCreatorStudio,
  onOpenVideoAnalytics,
  onOpenProfileVisitors,
  onOpenStudioEditor,
  onRefreshProfile,
  onOpenPrivacy,
  onOpenSettings,
  onLogout,
  onSelectVideo,
  onSelectCreator,
  currentUserId,
  onTogglePin,
  onUpdateProfile,
  onBackToFeed,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'videos' | 'private' | 'reposted' | 'saved' | 'liked' | 'history' | 'comments' | 'drafts'>('videos');
  const [savedDrafts, setSavedDrafts] = useState<any[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('tokvibe_studio_drafts_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const handleDeleteDraft = (draftId: string) => {
    try {
      const updated = savedDrafts.filter((d: any) => d.id !== draftId);
      localStorage.setItem('tokvibe_studio_drafts_v1', JSON.stringify(updated));
      setSavedDrafts(updated);
    } catch {}
  };
  const [isEditing, setIsEditing] = useState(false);
  const [showSubscriptionsModal, setShowSubscriptionsModal] = useState(false);
  const [subscriptionsTab, setSubscriptionsTab] = useState<'following' | 'followers'>('following');
  const [subsSearchQuery, setSubsSearchQuery] = useState('');

  // Custom Favorite Folders (Dossiers personnalisés de Favoris)
  const [favoriteFolders, setFavoriteFolders] = useState<FavoriteFolder[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const storageKey = `tokvibe_favorite_folders_${user?.uid || 'guest'}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
      if (user?.favoriteFolders && user.favoriteFolders.length > 0) {
        return user.favoriteFolders;
      }
      return [
        {
          id: 'folder-1',
          name: 'Inspirations',
          emoji: '✨',
          videoIds: bookmarkedVideoIds.slice(0, 1),
          isPrivate: false,
          createdAt: "Aujourd'hui",
        },
      ];
    } catch {
      return [];
    }
  });

  const [selectedFolderId, setSelectedFolderId] = useState<string | 'all'>('all');

  // Modals for Folders
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderEmoji, setNewFolderEmoji] = useState('📁');
  const [newFolderPrivate, setNewFolderPrivate] = useState(false);
  const [newFolderSelectedVideos, setNewFolderSelectedVideos] = useState<string[]>([]);

  // Editing folder
  const [editingFolder, setEditingFolder] = useState<FavoriteFolder | null>(null);

  // Quick assigning a video to folders modal
  const [videoToAssign, setVideoToAssign] = useState<VideoItem | null>(null);

  // Manage folder videos modal
  const [managingFolder, setManagingFolder] = useState<FavoriteFolder | null>(null);
  const [managedVideoIds, setManagedVideoIds] = useState<string[]>([]);

  const saveFolders = (folders: FavoriteFolder[]) => {
    setFavoriteFolders(folders);
    try {
      const storageKey = `tokvibe_favorite_folders_${user?.uid || 'guest'}`;
      localStorage.setItem(storageKey, JSON.stringify(folders));
      onUpdateProfile?.({ favoriteFolders: folders });
    } catch (e) {
      console.error('Error saving folders:', e);
    }
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newFolderName.trim();
    if (!cleanName) return;

    const newFolder: FavoriteFolder = {
      id: `folder-${Date.now()}`,
      name: cleanName,
      emoji: newFolderEmoji || '📁',
      isPrivate: newFolderPrivate,
      videoIds: newFolderSelectedVideos,
      createdAt: "Aujourd'hui",
    };

    const updated = [...favoriteFolders, newFolder];
    saveFolders(updated);
    setSelectedFolderId(newFolder.id);
    setIsCreateFolderOpen(false);
    setNewFolderName('');
    setNewFolderEmoji('📁');
    setNewFolderPrivate(false);
    setNewFolderSelectedVideos([]);
  };

  const handleUpdateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFolder) return;
    const cleanName = newFolderName.trim();
    if (!cleanName) return;

    const updated = favoriteFolders.map((f) =>
      f.id === editingFolder.id
        ? {
            ...f,
            name: cleanName,
            emoji: newFolderEmoji || '📁',
            isPrivate: newFolderPrivate,
          }
        : f
    );

    saveFolders(updated);
    setEditingFolder(null);
    setNewFolderName('');
    setNewFolderEmoji('📁');
  };

  const handleDeleteFolder = (folderId: string) => {
    const updated = favoriteFolders.filter((f) => f.id !== folderId);
    saveFolders(updated);
    if (selectedFolderId === folderId) {
      setSelectedFolderId('all');
    }
  };

  const handleToggleVideoInFolder = (folderId: string, videoId: string) => {
    const updated = favoriteFolders.map((f) => {
      if (f.id !== folderId) return f;
      const exists = f.videoIds.includes(videoId);
      return {
        ...f,
        videoIds: exists
          ? f.videoIds.filter((id) => id !== videoId)
          : [...f.videoIds, videoId],
      };
    });
    saveFolders(updated);
  };

  const handleSaveManagedVideos = () => {
    if (!managingFolder) return;
    const updated = favoriteFolders.map((f) =>
      f.id === managingFolder.id ? { ...f, videoIds: managedVideoIds } : f
    );
    saveFolders(updated);
    setManagingFolder(null);
  };

  // Handle device Back button to close folder modals immediately
  React.useEffect(() => {
    const hasFolderModal =
      isCreateFolderOpen ||
      Boolean(editingFolder) ||
      Boolean(managingFolder) ||
      Boolean(videoToAssign);

    if (!hasFolderModal) return;

    window.history.pushState({ modal: 'folder_modal' }, '');

    const handlePopState = () => {
      setIsCreateFolderOpen(false);
      setEditingFolder(null);
      setManagingFolder(null);
      setVideoToAssign(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isCreateFolderOpen, editingFolder, managingFolder, videoToAssign]);
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editHandle, setEditHandle] = useState(user?.handle || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editAvatar, setEditAvatar] = useState(user?.photoURL || '');
  const [avatarSuccessMessage, setAvatarSuccessMessage] = useState<string | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setEditAvatar(dataUrl);
      onUpdateProfile({ photoURL: dataUrl });
      try {
        localStorage.setItem(`tokvibe_custom_avatar_${user?.uid || 'guest'}`, dataUrl);
      } catch (err) {
        console.error('Failed to cache avatar in localStorage', err);
      }
      setAvatarSuccessMessage('Photo de profil changée avec succès depuis la galerie !');
      setTimeout(() => setAvatarSuccessMessage(null), 3500);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const [editTags, setEditTags] = useState<string[]>(user?.userTags || ['#Tech', '#Créateur']);
  const [tagInput, setTagInput] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [handleError, setHandleError] = useState<string | null>(null);

  React.useEffect(() => {
    if (user && isEditing) {
      setEditName(user.displayName || '');
      setEditHandle(user.handle || '');
      setEditBio(user.bio || '');
      setEditAvatar(user.photoURL || '');
      setEditTags(user.userTags || ['#Tech', '#Créateur']);
      setNameError(null);
      setHandleError(null);
    }
  }, [user, isEditing]);

  // Handle device hardware/browser Back button to close subscriptions/followers full-screen immediately
  React.useEffect(() => {
    if (!showSubscriptionsModal) return;

    window.history.pushState({ modal: 'subscriptions_fullscreen' }, '');

    const handlePopState = () => {
      setShowSubscriptionsModal(false);
      setSubsSearchQuery('');
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showSubscriptionsModal]);

  const handleCloseSubscriptions = () => {
    if (window.history.state?.modal === 'subscriptions_fullscreen') {
      window.history.back();
    } else {
      setShowSubscriptionsModal(false);
      setSubsSearchQuery('');
    }
  };

  // Handle device hardware/browser Back button to close edit profile modal immediately
  React.useEffect(() => {
    if (!isEditing) return;

    window.history.pushState({ modal: 'edit_profile' }, '');

    const handlePopState = () => {
      setIsEditing(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isEditing]);

  const getNameDaysRemaining = () => {
    if (!user?.nameLastChangedAt) return 0;
    const last = new Date(user.nameLastChangedAt).getTime();
    const now = Date.now();
    const diffDays = (now - last) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(7 - diffDays));
  };

  const getHandleDaysRemaining = () => {
    if (!user?.handleLastChangedAt) return 0;
    const last = new Date(user.handleLastChangedAt).getTime();
    const now = Date.now();
    const diffDays = (now - last) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(30 - diffDays));
  };

  const nameDaysRemaining = getNameDaysRemaining();
  const handleDaysRemaining = getHandleDaysRemaining();

  // Pull-to-Refresh state (Slide from top to bottom to refresh profile)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const pullStartYRef = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState<boolean>(false);
  const [refreshSuccessToast, setRefreshSuccessToast] = useState<boolean>(false);

  const triggerProfileRefresh = () => {
    if (isRefreshingProfile) return;
    setIsRefreshingProfile(true);
    setPullDistance(60);

    setTimeout(() => {
      onRefreshProfile?.();
      setIsRefreshingProfile(false);
      setPullDistance(0);
      setRefreshSuccessToast(true);
      setTimeout(() => setRefreshSuccessToast(false), 2200);
    }, 100);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current;
    if (!el || el.scrollTop > 5 || isRefreshingProfile) {
      pullStartYRef.current = null;
      return;
    }
    pullStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (pullStartYRef.current === null || isRefreshingProfile) return;
    const el = scrollContainerRef.current;
    if (el && el.scrollTop > 5) {
      pullStartYRef.current = null;
      setPullDistance(0);
      return;
    }
    const deltaY = e.touches[0].clientY - pullStartYRef.current;
    if (deltaY > 0) {
      setPullDistance(Math.min(95, deltaY * 0.55));
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (pullStartYRef.current === null) return;
    pullStartYRef.current = null;
    if (pullDistance >= 52) {
      triggerProfileRefresh();
    } else {
      setPullDistance(0);
    }
  };

  // Mouse pointer drag support for desktop preview pull-to-refresh
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const el = scrollContainerRef.current;
    if (!el || el.scrollTop > 5 || isRefreshingProfile) {
      pullStartYRef.current = null;
      return;
    }
    pullStartYRef.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || pullStartYRef.current === null || isRefreshingProfile) return;
    const deltaY = e.clientY - pullStartYRef.current;
    if (deltaY > 0) {
      setPullDistance(Math.min(95, deltaY * 0.55));
    } else {
      setPullDistance(0);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    handleTouchEnd();
  };

  // Deduplicate creators from allVideos for the subscriptions list
  const uniqueCreators = React.useMemo(() => {
    const map = new Map<
      string,
      {
        authorId: string;
        authorName: string;
        authorHandle: string;
        authorAvatar: string;
        authorVerified?: boolean;
      }
    >();
    allVideos.forEach((v) => {
      if (!map.has(v.authorId)) {
        map.set(v.authorId, {
          authorId: v.authorId,
          authorName: v.authorName,
          authorHandle: v.authorHandle,
          authorAvatar: v.authorAvatar,
          authorVerified: v.authorVerified,
        });
      }
    });
    return Array.from(map.values());
  }, [allVideos]);

  const filteredFollowed = React.useMemo(() => {
    const list = uniqueCreators.filter((c) => followedAuthorIds.includes(c.authorId));
    if (!subsSearchQuery.trim()) return list;
    const q = subsSearchQuery.toLowerCase().trim();
    return list.filter(
      (c) => c.authorName.toLowerCase().includes(q) || c.authorHandle.toLowerCase().includes(q)
    );
  }, [uniqueCreators, followedAuthorIds, subsSearchQuery]);

  const filteredSuggested = React.useMemo(() => {
    const list = uniqueCreators.filter((c) => !followedAuthorIds.includes(c.authorId));
    if (!subsSearchQuery.trim()) return list;
    const q = subsSearchQuery.toLowerCase().trim();
    return list.filter(
      (c) => c.authorName.toLowerCase().includes(q) || c.authorHandle.toLowerCase().includes(q)
    );
  }, [uniqueCreators, followedAuthorIds, subsSearchQuery]);

  const filteredFollowers = React.useMemo(() => {
    const list = uniqueCreators.filter((c) => c.authorId !== user?.uid);
    if (!subsSearchQuery.trim()) return list;
    const q = subsSearchQuery.toLowerCase().trim();
    return list.filter(
      (c) => c.authorName.toLowerCase().includes(q) || c.authorHandle.toLowerCase().includes(q)
    );
  }, [uniqueCreators, user?.uid, subsSearchQuery]);

  if (!user) {
    return (
      <div className="w-full h-full bg-black text-white flex flex-col items-center justify-center p-6 text-center pb-24">
        <div className="mb-4">
          <TikFlowLogo size="lg" />
        </div>
        <h2 className="text-xl font-black text-white tracking-tight">
          Rejoignez la communauté TikFlow
        </h2>
        <p className="text-xs text-white/60 mt-1.5 max-w-xs leading-relaxed">
          Créez votre profil personnel pour enregistrer vos vidéos préférées, suivre des créateurs et monétiser vos créations.
        </p>
        <button
          onClick={onOpenAuth}
          className="mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-[#22c55e] to-[#25F4EE] text-black font-extrabold text-xs shadow-lg active:scale-95 transition"
        >
          Se connecter ou créer un compte
        </button>
      </div>
    );
  }

  // Videos filtering - Ensure pinned videos are placed at index 0 (premier au-dessus de toutes les vidéos)
  const rawMyVideos = allVideos.filter((v) => v.authorId === user.uid);
  const myVideos = [...rawMyVideos].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  const repostedVideos = allVideos.filter((v) => repostedVideoIds.includes(v.id));
  const savedVideos = allVideos.filter((v) => bookmarkedVideoIds.includes(v.id));
  const likedVideos = allVideos.filter((v) => likedVideoIds.includes(v.id));

  // Compute user comments across all videos
  const userCommentsList = React.useMemo(() => {
    const list: { video: VideoItem; comment: CommentItem }[] = [];
    allVideos.forEach((v) => {
      v.comments?.forEach((c) => {
        if (
          c.authorHandle === user?.handle ||
          c.authorName === user?.displayName ||
          c.authorName === 'Vous'
        ) {
          list.push({ video: v, comment: c });
        }
      });
    });
    return list;
  }, [allVideos, user]);

  // Build ordered list of watched videos with their timestamp
  const watchedVideosWithMeta = watchHistory
    .map((entry) => {
      const video = allVideos.find((v) => v.id === entry.videoId);
      return video ? { video, watchedAt: entry.watchedAt } : null;
    })
    .filter((item): item is { video: VideoItem; watchedAt: string } => item !== null);

  const watchedVideos = watchedVideosWithMeta.map((item) => item.video);
  const watchedTimeMap = new Map<string, string>(
    watchedVideosWithMeta.map((item) => [item.video.id, item.watchedAt])
  );

  const currentSavedVideos = React.useMemo(() => {
    if (selectedFolderId === 'all') return savedVideos;
    const folder = favoriteFolders.find((f) => f.id === selectedFolderId);
    return savedVideos.filter((v) => folder?.videoIds.includes(v.id));
  }, [savedVideos, selectedFolderId, favoriteFolders]);

  const currentList =
    activeSubTab === 'history'
      ? watchedVideos
      : activeSubTab === 'videos'
      ? myVideos
      : activeSubTab === 'private'
      ? []
      : activeSubTab === 'reposted'
      ? repostedVideos
      : activeSubTab === 'saved'
      ? currentSavedVideos
      : likedVideos;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const cleanName = editName.trim() || user.displayName;
    const cleanHandle = editHandle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || user.handle;
    const nameChanged = cleanName !== user.displayName;
    const handleChanged = cleanHandle !== user.handle;

    if (nameChanged && nameDaysRemaining > 0) {
      setNameError(`Le nom ne peut être modifié qu'une fois tous les 7 jours. Prochaine modification dans ${nameDaysRemaining} jour(s).`);
      return;
    }

    if (handleChanged && handleDaysRemaining > 0) {
      setHandleError(`Le tag @pseudo ne peut être modifié qu'une fois par mois / 30 jours. Prochaine modification dans ${handleDaysRemaining} jour(s).`);
      return;
    }

    const updatedProfile: Partial<UserProfile> = {
      displayName: cleanName,
      handle: cleanHandle,
      bio: editBio.trim() || user.bio,
      photoURL: editAvatar || user.photoURL,
    };

    if (nameChanged) {
      updatedProfile.nameLastChangedAt = new Date().toISOString();
    }
    if (handleChanged) {
      updatedProfile.handleLastChangedAt = new Date().toISOString();
    }

    onUpdateProfile(updatedProfile);
    setIsEditing(false);
  };

  const formatCount = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toString();
  };

  return (
    <div
      ref={scrollContainerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="w-full h-full bg-black text-white flex flex-col overflow-y-auto no-scrollbar pb-24 text-left relative"
    >
      {/* Minimal Profile Refresh Indicator */}
      {(pullDistance > 0 || isRefreshingProfile) && (
        <div
          style={{
            height: isRefreshingProfile ? 48 : Math.min(52, pullDistance),
            opacity: Math.min(1, pullDistance / 40),
          }}
          className="w-full flex items-center justify-center overflow-hidden bg-zinc-900/50 border-b border-white/5 transition-all duration-150 shrink-0"
        >
          <RefreshCw
            className={`w-5 h-5 text-[#FE2C55] ${
              isRefreshingProfile || pullDistance >= 52 ? 'animate-spin' : ''
            }`}
          />
        </div>
      )}

      {/* Profile Header Card */}

      {/* Top Bar Actions */}
      <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-md px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBackToFeed && (
            <button
              type="button"
              onClick={onBackToFeed}
              className="px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Balayer vers la gauche ou cliquer pour revenir au flux vidéo"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#25F4EE]" />
              <span>Retour au flux</span>
            </button>
          )}
          {user.privateAccount && (
            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>Privé</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {/* Refresh button removed */}
          <button
            type="button"
            onClick={() => onOpenProfileVisitors?.()}
            title="Utilisateurs qui ont vu votre profil (Vues du profil)"
            className="relative p-2 rounded-full bg-[#2563eb]/20 hover:bg-[#2563eb]/35 text-[#60a5fa] border border-blue-400/30 transition active:scale-90"
          >
            <Eye className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 px-1 rounded-full bg-[#FE2C55] text-white text-[8px] font-black">
              8
            </span>
          </button>
          <button
            onClick={onOpenSettings}
            title="Paramètres du compte"
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 transition active:scale-90"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="p-4 flex flex-col items-center text-center">
        {/* Hidden File Input for Device Gallery Access */}
        <input
          ref={avatarFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarFileSelect}
        />

        {/* Floating Toast Notification for Avatar Update */}
        {avatarSuccessMessage && (
          <div className="mb-3 px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>{avatarSuccessMessage}</span>
          </div>
        )}

        {/* Avatar with TokVibe LIVE Signal & Camera Gallery Picker */}
        {(() => {
          const isProfileLive = (isUserLive && user.uid === currentUserId) || liveHostIds.includes(user.uid);
          return (
            <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
              {isProfileLive && (
                <>
                  <span className="absolute -inset-2.5 rounded-full border-2 border-[#FE2C55] animate-ping opacity-60 pointer-events-none" />
                  <span className="absolute -inset-1 rounded-full border-2 border-[#FE2C55] shadow-[0_0_20px_rgba(254,44,85,0.9)] animate-pulse pointer-events-none" />
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  if (isProfileLive) {
                    onOpenLive?.(user.uid);
                  } else if (user?.uid === currentUserId) {
                    avatarFileInputRef.current?.click();
                  }
                }}
                title={
                  isProfileLive
                    ? 'Actuellement en LIVE • Cliquer pour voir'
                    : 'Cliquer pour changer la photo depuis la galerie de votre appareil'
                }
                className={`relative w-24 h-24 rounded-full p-1 transition hover:scale-105 shadow-xl flex items-center justify-center overflow-hidden cursor-pointer ${
                  isProfileLive
                    ? 'bg-gradient-to-tr from-[#FE2C55] via-rose-500 to-[#FE2C55] ring-4 ring-[#FE2C55] shadow-[0_0_25px_rgba(254,44,85,0.7)]'
                    : 'bg-gradient-to-tr from-[#22c55e] via-white to-[#25F4EE]'
                }`}
              >
                <img
                  src={user.uid === currentUserId ? editAvatar || user.photoURL : user.photoURL}
                  alt={user.displayName}
                  className="w-full h-full rounded-full object-cover border-2 border-black"
                />
              </button>

              {/* Circular camera & gallery button directly on avatar bottom-right */}
              {user?.uid === currentUserId && (
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-tr from-[#FE2C55] to-[#22c55e] p-[1.5px] shadow-[0_0_12px_rgba(254,44,85,0.7)] hover:scale-110 active:scale-90 transition z-10 flex items-center justify-center cursor-pointer"
                  title="Changer de photo depuis la galerie de votre appareil"
                >
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </button>
              )}
            </div>
          );
        })()}

        {/* Buttons right by profile photo: Changer photo (galerie) & Modifier info */}
        {user?.uid === currentUserId && (
          <div className="flex items-center justify-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => avatarFileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-full bg-zinc-900/95 hover:bg-zinc-800 border border-[#25F4EE]/40 text-[#25F4EE] font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
              title="Choisir une photo dans la galerie de votre appareil"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Changer photo</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-1.5 rounded-full bg-zinc-900/95 hover:bg-zinc-850 border border-white/10 hover:border-white/25 text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition group cursor-pointer"
              title="Modifier les informations du profil"
            >
              {/* Red and Green SVG Icon */}
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                <path
                  d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                  stroke="#FE2C55"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.5 6.5l3 3"
                  stroke="#FE2C55"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M11.5 20.5h9.5"
                  stroke="#22c55e"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
              </svg>
              <span>Modifier info</span>
            </button>
          </div>
        )}

        {/* Display name & Handle */}
        <h1 className="text-base font-black text-white flex items-center gap-1 flex-wrap justify-center">
          {user.displayName}
          {user.isVerified && (
            <span
              className="relative inline-flex items-center justify-center w-5 h-5 rounded-full shadow-[0_0_12px_#22c55e,inset_0_2px_4px_rgba(255,255,255,0.85),inset_0_-2px_4px_rgba(0,0,0,0.5)] border border-emerald-300 shrink-0"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #86efac 0%, #22c55e 50%, #15803d 85%, #052e16 100%)',
              }}
              title="Badge officiel en Boule verte 3D"
            >
              <span className="absolute top-0.5 left-1 w-1.5 h-1.5 rounded-full bg-white blur-[0.2px] pointer-events-none" />
              <Check className="w-3 h-3 stroke-[4] text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]" />
            </span>
          )}
        </h1>
        <div className="flex items-center justify-center gap-2 mt-0.5">
          <span className="text-xs text-white/50">@{user.handle}</span>
          {user?.uid === currentUserId && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/80">
              {(user.idCountry || 'Haïti') === 'Haïti' ? '🇭🇹 Haïti' : `🌍 ${user.idCountry}`}
            </span>
          )}
        </div>

        {/* Bio */}
        <p className="text-xs text-white/80 max-w-xs mt-2 leading-relaxed">
          {user.bio}
        </p>

        {/* Special TokVibe Monetization Button directly under profile photo / bio — ONLY FOR HAITI */}
        {user?.uid === currentUserId &&
          (user.idCountry || 'Haïti')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') === 'haiti' && (
            <button
              type="button"
              onClick={onOpenCreatorStudio}
              className="mt-3 w-full max-w-xs p-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-black to-zinc-950 border border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.22)] flex items-center justify-between text-left transition active:scale-98 group cursor-pointer"
              title="Accéder au Programme de Monétisation TokVibe (Exclusif Haïti 🇭🇹)"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-black text-sm shadow-md shrink-0 group-hover:scale-105 transition">
                  💰
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-white">Monétisation Créateur</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-wider border border-emerald-500/30">
                      🇭🇹 Programme TokVibe Haïti
                    </span>
                  </div>
                  <div className="text-[10px] text-white/50 truncate flex items-center gap-1 mt-0.5">
                    <span className="text-emerald-400 font-bold">18 ans ✓</span>
                    <span>•</span>
                    <span>10k abonnés</span>
                    <span>•</span>
                    <span>100k vues</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="text-xs font-black text-emerald-400">
                  ${user.walletBalance.toFixed(0) || '0'}
                </div>
                <div className="text-[9px] text-[#25F4EE] font-extrabold flex items-center gap-0.5 justify-end">
                  <span>Gérer</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </button>
          )}

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-5 my-4 py-2 border-y border-white/10 w-full max-w-xs">
          <button
            type="button"
            onClick={() => {
              setSubscriptionsTab('following');
              setShowSubscriptionsModal(true);
            }}
            className="hover:opacity-80 transition active:scale-95 text-center cursor-pointer"
            title="Gérer vos abonnements"
          >
            <div className="text-sm font-black text-[#4ade80]">
              {formatCount(followedAuthorIds.length)}
            </div>
            <div className="text-[10px] text-white/60 uppercase tracking-wider underline decoration-emerald-400/50">
              Abonnements
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              setSubscriptionsTab('followers');
              setShowSubscriptionsModal(true);
            }}
            className="hover:opacity-80 transition active:scale-95 text-center cursor-pointer"
            title="Voir vos abonnés"
          >
            <div className="text-sm font-black text-white">
              {formatCount(user.followersCount)}
            </div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider underline decoration-white/30">
              Abonnés
            </div>
          </button>
          <div>
            <div className="text-sm font-black text-white">
              {formatCount(user.likesReceived)}
            </div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider">
              J'aime
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenProfileVisitors?.()}
            className="hover:opacity-80 transition active:scale-95 text-center cursor-pointer"
            title="Voir les utilisateurs qui ont visité votre profil"
          >
            <div className="text-sm font-black text-[#60a5fa] flex items-center justify-center gap-0.5">
              <span>1.4k</span>
            </div>
            <div className="text-[10px] text-[#60a5fa] uppercase tracking-wider underline decoration-blue-400/50">
              Vues profil
            </div>
          </button>
        </div>

        {/* Sleek Action Row (Settings Button) */}
        {user?.uid === currentUserId && (
          <div className="flex items-center justify-center w-full max-w-xs mt-3">
            <button
              onClick={onOpenSettings}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-850 to-black hover:from-zinc-850 hover:to-zinc-900 text-white font-extrabold text-xs flex items-center justify-center gap-2 border border-[#25F4EE]/40 shadow-[0_0_12px_rgba(37,244,238,0.15)] transition active:scale-95 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#25F4EE]" />
              <span>Paramètres & Outils du profil</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Profile Modal (Full Screen TikTok Style) */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-md h-full bg-black p-4 flex flex-col overflow-y-auto no-scrollbar text-left">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4 shrink-0">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#25F4EE]" />
                Modifier les informations du compte
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full text-white/60 hover:text-white bg-white/5 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Photo de profil with Gallery Picker */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-900/80 border border-white/10">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#25F4EE] shrink-0">
                  <img
                    src={editAvatar || user.photoURL}
                    alt="Preview avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-extrabold text-white text-xs block mb-0.5">
                    Photo de profil
                  </span>
                  <p className="text-[10px] text-white/50 mb-2 leading-tight">
                    Choisissez une photo directement depuis la galerie de votre appareil.
                  </p>
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#25F4EE] to-emerald-400 text-black font-black text-[11px] flex items-center gap-1.5 shadow active:scale-95 transition cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Choisir dans la galerie</span>
                  </button>
                </div>
              </div>

              {/* Field 1: Display Name (Nom) - Restrict 7 days */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-white font-bold block">Nom affiché</label>
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Modifiable 1x / 7 jours
                  </span>
                </div>

                <input
                  type="text"
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    setNameError(null);
                  }}
                  disabled={nameDaysRemaining > 0 && editName === user.displayName}
                  className={`w-full p-2.5 rounded-xl bg-zinc-900 border text-white focus:outline-none focus:ring-1 ${
                    nameDaysRemaining > 0 && editName !== user.displayName
                      ? 'border-amber-500/80 focus:ring-amber-500'
                      : 'border-white/10 focus:ring-[#FE2C55]'
                  }`}
                />

                {nameDaysRemaining > 0 ? (
                  <div className="mt-1.5 p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-2 text-[10px] text-amber-200">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Le nom ne peut être modifié qu'une fois tous les 7 jours. Prochaine modification autorisée dans <strong>{nameDaysRemaining} jour(s)</strong>.
                    </span>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Nom modifiable maintenant (Re-verrouillage de 7 jours après sauvegarde)</span>
                  </div>
                )}
                {nameError && <p className="text-[10px] text-rose-400 font-bold mt-1">{nameError}</p>}
              </div>

              {/* Field 2: Handle / User Tag (@handle) - Restrict 30 days (chaque mois) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-white font-bold block">Identifiant / Tag utilisateur (@pseudo)</label>
                  <span className="text-[10px] font-semibold text-[#25F4EE] bg-[#25F4EE]/10 px-2 py-0.5 rounded-full border border-[#25F4EE]/30">
                    Modifiable 1x / mois (30j)
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-bold text-xs">@</span>
                  <input
                    type="text"
                    value={editHandle}
                    onChange={(e) => {
                      const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                      setEditHandle(clean);
                      setHandleError(null);
                    }}
                    disabled={handleDaysRemaining > 0 && editHandle === user.handle}
                    className={`w-full p-2.5 pl-7 rounded-xl bg-zinc-900 border text-white focus:outline-none focus:ring-1 ${
                      handleDaysRemaining > 0 && editHandle !== user.handle
                        ? 'border-amber-500/80 focus:ring-amber-500'
                        : 'border-white/10 focus:ring-[#25F4EE]'
                    }`}
                  />
                </div>

                {handleDaysRemaining > 0 ? (
                  <div className="mt-1.5 p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-2 text-[10px] text-amber-200">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      L'identifiant @pseudo ne peut être modifié qu'une fois tous les 30 jours (chaque mois). Prochaine modification dans <strong>{handleDaysRemaining} jour(s)</strong>.
                    </span>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Tag @pseudo modifiable maintenant (Re-verrouillage de 30j après sauvegarde)</span>
                  </div>
                )}
                {handleError && <p className="text-[10px] text-rose-400 font-bold mt-1">{handleError}</p>}
              </div>

              {/* Field 3: Bio */}
              <div>
                <label className="text-white/60 block mb-1">Biographie</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#FE2C55]"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white font-bold border border-white/10 transition active:scale-95"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FE2C55] to-rose-600 text-white font-extrabold shadow-lg transition active:scale-95"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscriptions ("Abonnements / Abonnés") FULL SCREEN View */}
      {showSubscriptionsModal && (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col w-full h-full animate-fade-in text-left">
          {/* Top Bar: Back Button + Username + Spacer */}
          <div className="sticky top-0 z-20 bg-black/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handleCloseSubscriptions}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-90 text-white transition flex items-center justify-center"
              title="Retour au profil"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h2 className="text-sm font-black text-white tracking-tight">
                {user.displayName || user.handle}
              </h2>
              <span className="text-[11px] text-white/50">@{user.handle}</span>
            </div>

            <div className="w-9" />
          </div>

          {/* Sub-Tabs Switcher: Abonnements & Abonnés (TikTok authentic style) */}
          <div className="flex border-b border-white/10 bg-black px-2 shrink-0">
            <button
              type="button"
              onClick={() => setSubscriptionsTab('following')}
              className={`flex-1 py-3 text-xs font-black transition relative text-center ${
                subscriptionsTab === 'following'
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <span>Abonnements ({followedAuthorIds.length})</span>
              {subscriptionsTab === 'following' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-[2.5px] bg-[#22c55e] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setSubscriptionsTab('followers')}
              className={`flex-1 py-3 text-xs font-black transition relative text-center ${
                subscriptionsTab === 'followers'
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <span>Abonnés ({formatCount(user.followersCount)})</span>
              {subscriptionsTab === 'followers' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-[2.5px] bg-[#22c55e] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              )}
            </button>
          </div>

          {/* Search bar inside Full Screen */}
          <div className="px-4 py-2.5 bg-black/60 border-b border-white/5 shrink-0">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-white/40 pointer-events-none" />
              <input
                type="text"
                value={subsSearchQuery}
                onChange={(e) => setSubsSearchQuery(e.target.value)}
                placeholder={
                  subscriptionsTab === 'following'
                    ? 'Rechercher parmi vos abonnements...'
                    : 'Rechercher un abonné...'
                }
                className="w-full bg-zinc-900 border border-white/10 text-white placeholder-white/40 text-xs rounded-full py-2.5 pl-10 pr-9 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/40 transition"
              />
              {subsSearchQuery && (
                <button
                  type="button"
                  onClick={() => setSubsSearchQuery('')}
                  className="absolute right-3 p-1 text-white/50 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Full Screen Scrollable Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 pb-24">
            {subscriptionsTab === 'following' ? (
              <div className="space-y-5">
                {/* Active Subscriptions List */}
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-white/40 mb-2">
                    Vos abonnements ({filteredFollowed.length})
                  </h3>

                  {filteredFollowed.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/10 text-center space-y-2">
                      <Users className="w-9 h-9 text-white/30 mx-auto" />
                      <p className="text-xs font-bold text-white/70">
                        {subsSearchQuery
                          ? 'Aucun abonnement ne correspond à votre recherche'
                          : "Vous n'êtes abonné à aucun compte pour le moment"}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {filteredFollowed.map((creator) => {
                        const creatorInLive = liveHostIds.includes(creator.authorId);
                        return (
                          <div
                            key={creator.authorId}
                            className="py-3 flex items-center justify-between gap-3"
                          >
                            <div
                              className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                              onClick={() => {
                                if (creatorInLive && onOpenLive) {
                                  handleCloseSubscriptions();
                                  onOpenLive(creator.authorId);
                                } else if (onSelectCreator) {
                                  handleCloseSubscriptions();
                                  onSelectCreator(creator.authorId);
                                }
                              }}
                            >
                              <div className="relative shrink-0">
                                <img
                                  src={creator.authorAvatar}
                                  alt={creator.authorName}
                                  className={`w-12 h-12 rounded-full object-cover ${
                                    creatorInLive
                                      ? 'ring-2 ring-[#FE2C55] shadow-[0_0_10px_rgba(254,44,85,0.8)]'
                                      : 'border border-white/15'
                                  }`}
                                />
                                {creatorInLive && (
                                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-[#FE2C55] text-[8px] font-black text-white uppercase shadow">
                                    LIVE
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 text-left">
                                <div className="text-sm font-extrabold text-white truncate flex items-center gap-1">
                                  <span>{creator.authorName}</span>
                                  {creator.authorVerified && (
                                    <span
                                      className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#22c55e] text-black shrink-0 ml-1"
                                      title="Créateur certifié"
                                    >
                                      <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-white/50 truncate">
                                  @{creator.authorHandle}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => onToggleFollow?.(creator.authorId)}
                              className="px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0 bg-[#2563eb] text-white border border-blue-400/60 shadow-[0_0_12px_rgba(37,99,235,0.65)] hover:bg-blue-500"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Abonné</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Suggestions pour vous Section */}
                {filteredSuggested.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#22c55e]" />
                      Suggestions pour vous
                    </h3>

                    <div className="divide-y divide-white/5">
                      {filteredSuggested.slice(0, 10).map((creator) => {
                        const creatorInLive = liveHostIds.includes(creator.authorId);
                        return (
                          <div
                            key={creator.authorId}
                            className="py-3 flex items-center justify-between gap-3"
                          >
                            <div
                              className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                              onClick={() => {
                                if (creatorInLive && onOpenLive) {
                                  handleCloseSubscriptions();
                                  onOpenLive(creator.authorId);
                                } else if (onSelectCreator) {
                                  handleCloseSubscriptions();
                                  onSelectCreator(creator.authorId);
                                }
                              }}
                            >
                              <img
                                src={creator.authorAvatar}
                                alt={creator.authorName}
                                className="w-12 h-12 rounded-full object-cover border border-white/15 shrink-0"
                              />
                              <div className="min-w-0 text-left">
                                <div className="text-sm font-extrabold text-white truncate flex items-center gap-1">
                                  <span>{creator.authorName}</span>
                                  {creator.authorVerified && (
                                    <span className="text-[10px] text-[#25F4EE]">✓</span>
                                  )}
                                </div>
                                <div className="text-xs text-white/50 truncate">
                                  @{creator.authorHandle}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => onToggleFollow?.(creator.authorId)}
                              className="px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 shrink-0 bg-[#FE2C55] text-white hover:bg-[#FE2C55]/90 shadow-[0_0_10px_rgba(254,44,85,0.4)]"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Suivre</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Followers Tab ("Abonnés") */
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-white/40 mb-2">
                  Tous vos abonnés ({filteredFollowers.length})
                </h3>

                {filteredFollowers.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/10 text-center space-y-2">
                    <Users className="w-9 h-9 text-white/30 mx-auto" />
                    <p className="text-xs font-bold text-white/70">
                      {subsSearchQuery
                        ? 'Aucun abonné ne correspond à votre recherche'
                        : "Vous n'avez pas encore d'abonnés"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {filteredFollowers.map((follower) => {
                      const isFollowing = followedAuthorIds.includes(follower.authorId);
                      return (
                        <div
                          key={follower.authorId}
                          className="py-3 flex items-center justify-between gap-3"
                        >
                          <div
                            className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                            onClick={() => {
                              if (onSelectCreator) {
                                handleCloseSubscriptions();
                                onSelectCreator(follower.authorId);
                              }
                            }}
                          >
                            <img
                              src={follower.authorAvatar}
                              alt={follower.authorName}
                              className="w-12 h-12 rounded-full object-cover border border-white/15 shrink-0"
                            />
                            <div className="min-w-0 text-left">
                              <div className="text-sm font-extrabold text-white truncate flex items-center gap-1">
                                <span>{follower.authorName}</span>
                                {follower.authorVerified && (
                                  <span className="text-[10px] text-[#25F4EE]">✓</span>
                                )}
                              </div>
                              <div className="text-xs text-white/50 truncate">
                                @{follower.authorHandle}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onToggleFollow?.(follower.authorId)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95 shrink-0 ${
                              isFollowing
                                ? 'bg-zinc-800 text-white/80 border border-white/10 hover:bg-zinc-700'
                                : 'bg-[#FE2C55] text-white hover:bg-[#FE2C55]/90 shadow-[0_0_10px_rgba(254,44,85,0.4)]'
                            }`}
                          >
                            {isFollowing ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Amis</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>En retour</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}



      {/* TokVibe Authentic Icon Navigation Sub-Tabs Bar (Matching user screenshot) */}
      <div className="flex border-b border-white/10 bg-black sticky top-12 z-20">
        {/* Tab 1: Vidéos publiques (6 vertical lines grid + caret) */}
        <button
          type="button"
          onClick={() => setActiveSubTab('videos')}
          className={`relative flex-1 py-3.5 flex items-center justify-center transition ${
            activeSubTab === 'videos' ? 'text-white' : 'text-white/40 hover:text-white/80'
          }`}
          title="Vidéos publiques"
        >
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5 items-center">
              <div className="flex flex-col gap-0.5">
                <span className="w-0.5 h-2.5 bg-current rounded-full" />
                <span className="w-0.5 h-2.5 bg-current rounded-full" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="w-0.5 h-2.5 bg-current rounded-full" />
                <span className="w-0.5 h-2.5 bg-current rounded-full" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="w-0.5 h-2.5 bg-current rounded-full" />
                <span className="w-0.5 h-2.5 bg-current rounded-full" />
              </div>
            </div>
            <ChevronDown className="w-3 h-3 fill-current" />
          </div>
          {activeSubTab === 'videos' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-full" />
          )}
        </button>

        {/* Tab 2: Vidéos privées (Lock icon) */}
        <button
          type="button"
          onClick={() => setActiveSubTab('private')}
          className={`relative flex-1 py-3.5 flex items-center justify-center transition ${
            activeSubTab === 'private' ? 'text-white' : 'text-white/40 hover:text-white/80'
          }`}
          title="Vidéos privées"
        >
          <Lock className="w-5 h-5 stroke-[2.2]" />
          {activeSubTab === 'private' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-full" />
          )}
        </button>

        {/* Tab 3: Vidéos republiées (Repeat2 icon) */}
        <button
          type="button"
          onClick={() => setActiveSubTab('reposted')}
          className={`relative flex-1 py-3.5 flex items-center justify-center transition ${
            activeSubTab === 'reposted' ? 'text-white' : 'text-white/40 hover:text-white/80'
          }`}
          title="Vidéos republiées"
        >
          <Repeat2 className="w-5 h-5 stroke-[2.2]" />
          {activeSubTab === 'reposted' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-full" />
          )}
        </button>

        {/* Tab: Brouillons en cours de montage (Scissors icon) */}
        <button
          type="button"
          onClick={() => setActiveSubTab('drafts')}
          className={`relative flex-1 py-3.5 flex items-center justify-center transition ${
            activeSubTab === 'drafts' ? 'text-white' : 'text-white/40 hover:text-white/80'
          }`}
          title="Brouillons en cours de montage"
        >
          <Scissors className="w-5 h-5 stroke-[2.2]" />
          {savedDrafts.length > 0 && (
            <span className="absolute top-1 right-2 px-1 rounded-full bg-[#FE2C55] text-white text-[8px] font-black">
              {savedDrafts.length}
            </span>
          )}
          {activeSubTab === 'drafts' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-full" />
          )}
        </button>

        {/* Tab 4: Favoris, Historique & Collections (Bookmark icon) */}
        <button
          type="button"
          onClick={() => setActiveSubTab('saved')}
          className={`relative flex-1 py-3.5 flex items-center justify-center transition ${
            activeSubTab === 'saved' || activeSubTab === 'history' || activeSubTab === 'comments'
              ? 'text-white'
              : 'text-white/40 hover:text-white/80'
          }`}
          title="Favoris & Historique de visionnage"
        >
          <Bookmark className="w-5 h-5 stroke-[2.2]" />
          {(activeSubTab === 'saved' || activeSubTab === 'history' || activeSubTab === 'comments') && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-full" />
          )}
        </button>

        {/* Tab 5: Vidéos aimées (Heart icon) */}
        <button
          type="button"
          onClick={() => setActiveSubTab('liked')}
          className={`relative flex-1 py-3.5 flex items-center justify-center transition ${
            activeSubTab === 'liked' ? 'text-white' : 'text-white/40 hover:text-white/80'
          }`}
          title="Vidéos aimées"
        >
          <Heart className="w-5 h-5 stroke-[2.2]" />
          {activeSubTab === 'liked' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-full" />
          )}
        </button>
      </div>

      {/* Sub-Pills Bar under Bookmark Tab (Favoris / Historique / Commentaires) */}
      {(activeSubTab === 'saved' || activeSubTab === 'history' || activeSubTab === 'comments') && (
        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950/90 border-b border-white/5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveSubTab('saved')}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition shrink-0 ${
              activeSubTab === 'saved'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-white/60 hover:text-white border border-white/10'
            }`}
          >
            Vidéos favoris ({savedVideos.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition shrink-0 ${
              activeSubTab === 'history'
                ? 'bg-[#25F4EE] text-black'
                : 'bg-zinc-900 text-white/60 hover:text-white border border-white/10'
            }`}
          >
            Historique / Vues ({watchedVideos.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('comments')}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition shrink-0 ${
              activeSubTab === 'comments'
                ? 'bg-purple-400 text-black'
                : 'bg-zinc-900 text-white/60 hover:text-white border border-white/10'
            }`}
          >
            Commentaires ({userCommentsList.length})
          </button>
        </div>
      )}

      {/* Horizontal Custom Folder Pills Bar (Favoris Organisés) */}
      {activeSubTab === 'saved' && (
        <div className="bg-black/95 border-b border-white/5 px-3 py-2 space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setSelectedFolderId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                selectedFolderId === 'all'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-zinc-900 text-white/70 hover:text-white border border-white/10'
              }`}
            >
              <span>⭐ Tous ({savedVideos.length})</span>
            </button>

            {favoriteFolders.map((folder) => {
              const count = folder.videoIds.length;
              const isSelected = selectedFolderId === folder.id;
              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-md font-extrabold'
                      : 'bg-zinc-900 text-white/70 hover:text-white border border-white/10'
                  }`}
                >
                  <span>{folder.emoji}</span>
                  <span>{folder.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-black/20 text-black font-black'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {count}
                  </span>
                  {folder.isPrivate && <Lock className="w-2.5 h-2.5 opacity-60" />}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setIsCreateFolderOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-850 text-[#25F4EE] border border-[#25F4EE]/40 shrink-0 flex items-center gap-1 transition active:scale-95"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ Dossier</span>
            </button>
          </div>

          {selectedFolderId !== 'all' && (() => {
            const currentFolder = favoriteFolders.find((f) => f.id === selectedFolderId);
            if (!currentFolder) return null;
            return (
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/70 border border-white/10 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{currentFolder.emoji}</span>
                  <div className="min-w-0">
                    <span className="font-extrabold text-white truncate block">
                      {currentFolder.name}
                    </span>
                    <span className="text-[10px] text-white/50 block">
                      {currentFolder.videoIds.length} vidéo{currentFolder.videoIds.length > 1 ? 's' : ''} • {currentFolder.isPrivate ? 'Privé' : 'Public'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setManagingFolder(currentFolder);
                      setManagedVideoIds([...currentFolder.videoIds]);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] transition"
                  >
                    Gérer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFolder(currentFolder);
                      setNewFolderName(currentFolder.name);
                      setNewFolderEmoji(currentFolder.emoji || '📁');
                      setNewFolderPrivate(Boolean(currentFolder.isPrivate));
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                    title="Modifier le dossier"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFolder(currentFolder.id)}
                    className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition"
                    title="Supprimer le dossier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Sub-Tab Content View */}
      {activeSubTab === 'drafts' ? (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-[#25F4EE]" />
                <span>Brouillons en cours de montage ({savedDrafts.length})</span>
              </h3>
              <p className="text-[11px] text-white/50 mt-0.5">
                Reprenez l'édition de vos vidéos sauvegardées avant publication.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenStudioEditor}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#25F4EE] to-emerald-400 text-black text-[11px] font-black shadow transition active:scale-95"
            >
              + Nouveau projet
            </button>
          </div>

          {savedDrafts.length === 0 ? (
            <div className="py-16 text-center text-white/40 text-xs px-4 bg-zinc-950 rounded-2xl border border-white/5">
              <Scissors className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#25F4EE]" />
              <p className="font-bold text-white/70">Aucun brouillon enregistré.</p>
              <p className="text-[11px] text-white/40 mt-1 max-w-xs mx-auto">
                Lorsque vous éditez une vidéo dans le Studio, elle est automatiquement sauvegardée ici.
              </p>
              <button
                type="button"
                onClick={onOpenStudioEditor}
                className="mt-4 px-4 py-2 rounded-full bg-[#25F4EE] text-black font-extrabold text-xs transition active:scale-95"
              >
                Ouvrir le Studio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {savedDrafts.map((draft: any) => (
                <div
                  key={draft.id}
                  className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-[#25F4EE]/50 shadow-lg flex flex-col justify-between p-2.5 text-left"
                >
                  <img
                    src={draft.selectedThumbUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600'}
                    alt={draft.caption}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-[#25F4EE]/20 border border-[#25F4EE]/40 text-[#25F4EE] text-[9px] font-black uppercase">
                      Brouillon
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteDraft(draft.id)}
                      className="p-1.5 rounded-full bg-black/60 text-white/70 hover:text-rose-400 transition"
                      title="Supprimer ce brouillon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="relative z-10 space-y-1">
                    <span className="text-[10px] text-white/60 block">
                      🕒 {draft.savedAt || 'Récemment'}
                    </span>
                    <p className="text-xs font-bold text-white line-clamp-2 leading-snug">
                      {draft.caption || 'Sans légende'}
                    </p>
                    <button
                      type="button"
                      onClick={onOpenStudioEditor}
                      className="w-full mt-1.5 py-1.5 rounded-xl bg-gradient-to-r from-[#25F4EE] to-emerald-400 text-black font-black text-[11px] shadow transition active:scale-95 flex items-center justify-center gap-1"
                    >
                      <span>Reprendre le montage 🎬</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeSubTab === 'private' ? (
        <div className="py-20 text-center text-white/50 text-xs px-6">
          <Lock className="w-10 h-10 text-white/30 mx-auto mb-3" />
          <h3 className="font-extrabold text-white text-sm">Vos vidéos privées</h3>
          <p className="text-[11px] text-white/40 mt-1 max-w-xs mx-auto">
            Les vidéos que vous définissez comme privées ne sont visibles que par vous.
          </p>
        </div>
      ) : activeSubTab === 'comments' ? (
        <div className="p-3 space-y-2.5">
          {userCommentsList.length === 0 ? (
            <div className="py-16 text-center text-white/40 text-xs px-4 bg-zinc-900/40 rounded-2xl border border-white/5">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40 text-purple-400" />
              <p className="font-bold text-white/70">Aucun commentaire rédigé pour l'instant.</p>
              <p className="text-[11px] text-white/40 mt-1">
                Vos commentaires laissés sur les vidéos s'afficheront ici au format TokVibe.
              </p>
            </div>
          ) : (
            userCommentsList.map(({ video, comment }) => (
              <div
                key={`usr-cmt-${video.id}-${comment.id}`}
                onClick={() => onSelectVideo(video.id)}
                className="p-3 rounded-2xl bg-zinc-900/80 border border-white/10 hover:border-purple-400/50 flex items-start gap-3 cursor-pointer transition active:scale-[0.99]"
              >
                <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-white/15">
                  <img
                    src={video.thumbnailUrl || video.authorAvatar}
                    alt={video.caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 text-white fill-current" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-extrabold text-white/90 truncate">
                      Sur @{video.authorHandle}
                    </span>
                    <span className="text-[9px] text-white/40 shrink-0">
                      {comment.timestamp || comment.createdAt}
                    </span>
                  </div>

                  <p className="text-xs text-purple-200 font-medium bg-purple-950/30 p-2 rounded-xl border border-purple-500/20 leading-snug">
                    "{comment.text}"
                  </p>

                  <div className="mt-1 flex items-center gap-3 text-[10px] text-white/40">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400 fill-rose-400/20" /> {comment.likesCount}
                    </span>
                    <span className="truncate">Vidéo: {video.caption}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 p-1">
          {currentList.length === 0 ? (
            <div className="col-span-3 py-16 text-center text-white/40 text-xs px-4">
              {activeSubTab === 'history'
                ? 'Votre historique de visionnage est vide. Regardez des vidéos dans le flux pour les retrouver ici !'
                : activeSubTab === 'reposted'
                ? 'Aucune vidéo republiée.'
                : activeSubTab === 'saved'
                ? 'Aucune vidéo enregistrée dans vos favoris.'
                : activeSubTab === 'liked'
                ? 'Aucune vidéo aimée pour le moment.'
                : 'Aucune vidéo publiée.'}
            </div>
          ) : (
            currentList.map((video) => {
              const watchedLabel = watchedTimeMap.get(video.id);
              return (
                <div
                  key={video.id}
                  onContextMenu={(e) => { e.preventDefault(); onTogglePin?.(video.id); }}
                  onClick={() => onSelectVideo(video.id)}
                  className="relative aspect-[9/16] bg-zinc-900 overflow-hidden cursor-pointer group"
                >
                  <img
                    src={video.thumbnailUrl || video.authorAvatar}
                    alt={video.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  {video.isPinned ? (
                    <div className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded bg-[#FE2C55] text-white text-[8px] font-black flex items-center gap-0.5 shadow-md uppercase tracking-wider">
                      <Pin className="w-2.5 h-2.5 stroke-[3] fill-current" />
                      <span>Épinglé</span>
                    </div>
                  ) : watchedLabel ? (
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[8px] font-bold text-[#25F4EE] flex items-center gap-0.5 border border-white/10">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{watchedLabel}</span>
                    </div>
                  ) : null}
                  {activeSubTab === 'saved' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoToAssign(video);
                      }}
                      className="absolute top-1.5 right-1.5 z-10 p-1.5 rounded-full bg-black/80 hover:bg-zinc-800 text-[#25F4EE] border border-white/20 backdrop-blur-md shadow-md transition active:scale-90"
                      title="Classer dans un dossier personnalisé"
                    >
                      <Folder className="w-3 h-3 fill-current" />
                    </button>
                  )}
                  <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-white font-bold drop-shadow">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>{(video.viewsCount / 1000).toFixed(0)}k</span>
                    </div>
                    {onOpenVideoAnalytics && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenVideoAnalytics(video);
                        }}
                        title="Statistiques TokVibe de cette vidéo"
                        className="px-1.5 py-0.5 rounded bg-black/75 hover:bg-[#25F4EE] hover:text-black text-[#25F4EE] text-[8px] font-black flex items-center gap-0.5 border border-[#25F4EE]/40 transition"
                      >
                        <BarChart3 className="w-2.5 h-2.5" />
                        <span>Stats</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL 1: Create Custom Folder */}
      {isCreateFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-zinc-950 border border-white/10 rounded-3xl p-5 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-[#25F4EE]" />
                Nouveau dossier de favoris
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateFolderOpen(false)}
                className="p-1 rounded-full text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3.5 text-xs">
              <div>
                <label className="text-white font-bold block mb-1">Nom du dossier</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Ex: Danse, Recettes, Tech..."
                  required
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#25F4EE]"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1">Choisir une icône / Emoji</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['📁', '💖', '🎵', '🏖️', '💡', '🔥', '🎬', '🌟', '🍔', '🚀'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setNewFolderEmoji(em)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition ${
                        newFolderEmoji === em
                          ? 'bg-[#25F4EE] text-black shadow-md scale-110'
                          : 'bg-zinc-900 hover:bg-zinc-800 border border-white/10'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-white/10">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-white/60" />
                  <div>
                    <span className="font-bold text-white block text-[11px]">Dossier Privé</span>
                    <span className="text-[9px] text-white/40 block">Visible uniquement par vous</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={newFolderPrivate}
                  onChange={(e) => setNewFolderPrivate(e.target.checked)}
                  className="w-4 h-4 accent-[#25F4EE]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateFolderOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white/70 font-bold hover:bg-zinc-850"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#25F4EE] to-emerald-400 text-black font-extrabold shadow transition active:scale-95 disabled:opacity-50"
                >
                  Créer le dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Custom Folder */}
      {editingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-zinc-950 border border-white/10 rounded-3xl p-5 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#25F4EE]" />
                Modifier le dossier
              </h3>
              <button
                type="button"
                onClick={() => setEditingFolder(null)}
                className="p-1 rounded-full text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateFolder} className="space-y-3.5 text-xs">
              <div>
                <label className="text-white font-bold block mb-1">Nom du dossier</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#25F4EE]"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1">Icône / Emoji</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['📁', '💖', '🎵', '🏖️', '💡', '🔥', '🎬', '🌟', '🍔', '🚀'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setNewFolderEmoji(em)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition ${
                        newFolderEmoji === em
                          ? 'bg-[#25F4EE] text-black shadow-md scale-110'
                          : 'bg-zinc-900 hover:bg-zinc-850 border border-white/10'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-white/10">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-white/60" />
                  <div>
                    <span className="font-bold text-white block text-[11px]">Dossier Privé</span>
                    <span className="text-[9px] text-white/40 block">Visible uniquement par vous</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={newFolderPrivate}
                  onChange={(e) => setNewFolderPrivate(e.target.checked)}
                  className="w-4 h-4 accent-[#25F4EE]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFolder(null)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white/70 font-bold hover:bg-zinc-850"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#25F4EE] to-emerald-400 text-black font-extrabold shadow transition active:scale-95 disabled:opacity-50"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Manage Folder Videos */}
      {managingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md max-h-[80vh] bg-zinc-950 border border-white/10 rounded-3xl p-5 shadow-2xl text-left flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>{managingFolder.emoji}</span>
                <span>Gérer les vidéos du dossier "{managingFolder.name}"</span>
              </h3>
              <button
                type="button"
                onClick={() => setManagingFolder(null)}
                className="p-1 rounded-full text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-white/50 shrink-0">
              Cochez les vidéos de vos favoris que vous souhaitez inclure dans ce dossier.
            </p>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 py-1">
              {savedVideos.length === 0 ? (
                <p className="text-center text-xs text-white/40 py-8">
                  Aucune vidéo dans vos favoris.
                </p>
              ) : (
                savedVideos.map((vid) => {
                  const isChecked = managedVideoIds.includes(vid.id);
                  return (
                    <div
                      key={vid.id}
                      onClick={() => {
                        setManagedVideoIds((prev) =>
                          prev.includes(vid.id)
                            ? prev.filter((id) => id !== vid.id)
                            : [...prev, vid.id]
                        );
                      }}
                      className={`flex items-center justify-between p-2 rounded-2xl border cursor-pointer transition ${
                        isChecked
                          ? 'bg-zinc-900 border-[#25F4EE]/60'
                          : 'bg-black/40 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={vid.thumbnailUrl || vid.authorAvatar}
                          alt={vid.caption}
                          className="w-10 h-14 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{vid.caption}</p>
                          <span className="text-[10px] text-white/40">@{vid.authorHandle}</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 accent-[#25F4EE] shrink-0 pointer-events-none"
                      />
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 flex items-center gap-2 shrink-0 border-t border-white/10">
              <button
                type="button"
                onClick={() => setManagingFolder(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white/70 font-bold hover:bg-zinc-850 text-xs"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={handleSaveManagedVideos}
                className="flex-1 py-2.5 rounded-xl bg-[#25F4EE] text-black font-extrabold shadow text-xs transition active:scale-95"
              >
                Valider ({managedVideoIds.length} vidéo{managedVideoIds.length > 1 ? 's' : ''})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Quick Assign Video to Folders */}
      {videoToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-zinc-950 border border-white/10 rounded-3xl p-5 shadow-2xl text-left space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <FolderHeart className="w-4 h-4 text-[#25F4EE]" />
                Classer dans un dossier
              </h3>
              <button
                type="button"
                onClick={() => setVideoToAssign(null)}
                className="p-1 rounded-full text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-900/60 border border-white/5">
              <img
                src={videoToAssign.thumbnailUrl || videoToAssign.authorAvatar}
                alt={videoToAssign.caption}
                className="w-9 h-12 rounded-lg object-cover shrink-0"
              />
              <p className="text-xs text-white/80 font-bold line-clamp-2">
                {videoToAssign.caption}
              </p>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
              {favoriteFolders.map((f) => {
                const inFolder = f.videoIds.includes(videoToAssign.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleToggleVideoInFolder(f.id, videoToAssign.id)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition ${
                      inFolder
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                        : 'bg-zinc-900/70 border-white/5 text-white/80 hover:bg-zinc-850'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{f.emoji}</span>
                      <span className="text-xs font-bold">{f.name}</span>
                    </div>
                    <span className="text-xs font-black">
                      {inFolder ? '✓ Ajouté' : '+ Ajouter'}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsCreateFolderOpen(true);
              }}
              className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-dashed border-white/20 text-[#25F4EE] text-xs font-bold flex items-center justify-center gap-1 transition"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Créer un nouveau dossier</span>
            </button>

            <button
              type="button"
              onClick={() => setVideoToAssign(null)}
              className="w-full py-2.5 rounded-xl bg-white text-black font-extrabold text-xs transition active:scale-95 shadow"
            >
              Terminé
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
