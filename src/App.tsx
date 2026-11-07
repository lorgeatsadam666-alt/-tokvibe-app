import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Compass,
  Plus,
  MessageSquare,
  User,
  Sparkles,
  X,
  Hash,
  UserMinus,
  Check,
  RefreshCw,
  Search,
  ChevronRight,
  Globe,
  Lock,
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  increment,
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import {
  auth,
  db,
  testConnection,
  handleFirestoreError,
  OperationType,
  logoutUser,
} from './lib/firebase';
import { validateVideoSafety } from './lib/moderation';
import {
  LiveStreamModal,
  DEFAULT_LIVE_CHANNELS,
  DISCOVERABLE_LIVE_CHANNELS,
  LiveChannel,
} from './components/LiveStreamModal';
import { StoriesBar } from './components/StoriesBar';
import { StoriesModal } from './components/StoriesModal';
import {
  INITIAL_VIDEOS,
  INITIAL_COMMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ANALYTICS,
  getFreshFeedVideos,
  INITIAL_STORIES,
} from './lib/mockData';
import {
  UserProfile,
  VideoItem,
  CommentItem,
  NotificationItem,
  FilterPreset,
  ThemeMode,
  AccentColor,
  SupportedLanguage,
  AIPreferences,
  StoryItem,
} from './types';
import { translations } from './lib/i18n';
import { SplashScreen, TikFlowLogo } from './components/SplashScreen';
import { VideoPlayer } from './components/VideoPlayer';
import { FilterSelectorDrawer } from './components/VideoFilterOverlay';
import { CommentsModal } from './components/CommentsModal';
import { ShareModal } from './components/ShareModal';
import { AuthModal } from './components/AuthModal';
import { ExploreTab } from './components/ExploreTab';
import { NotificationsModal } from './components/NotificationsModal';
import { ProfileTab } from './components/ProfileTab';
import { CreatorStudioModal, StudioAnalyticsSubTab } from './components/CreatorStudioModal';
import { PrivacySettingsModal } from './components/PrivacySettingsModal';
import { SettingsModal } from './components/SettingsModal';
import { CreateVideoModal } from './components/CreateVideoModal';
import { EditVideoModal } from './components/EditVideoModal';
import { AgeVerificationModal } from './components/AgeVerificationModal';
import { BiometricAppLockModal } from './components/BiometricAppLockModal';


export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // App Navigation
  const [activeTab, setActiveTab] = useState<'feed' | 'explore' | 'inbox' | 'profile'>('feed');
  const [feedMode, setFeedMode] = useState<'forYou' | 'friends'>('forYou');

  // Video State (Guarantees a different video appears first on every page refresh)
  const [videos, setVideos] = useState<VideoItem[]>(() =>
    getFreshFeedVideos(INITIAL_VIDEOS)
  );
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tokvibe_is_muted');
      if (saved !== null) {
        return saved === 'true';
      }
    }
    return false; // Sound enabled by default
  });
  const [isFullScreen, setIsFullScreen] = useState(false); // Immersive Full Screen mode

  // Social Interaction states
  const [likedVideoIds, setLikedVideoIds] = useState<string[]>(['vid-1']);
  const [bookmarkedVideoIds, setBookmarkedVideoIds] = useState<string[]>(['vid-2']);
  const [repostedVideoIds, setRepostedVideoIds] = useState<string[]>([]);
  const [followedAuthorIds, setFollowedAuthorIds] = useState<string[]>(['creator-tokyo']);
  const [watchHistory, setWatchHistory] = useState<Array<{ videoId: string; watchedAt: string }>>([
    { videoId: 'vid-1', watchedAt: "À l'instant" },
    { videoId: 'vid-2', watchedAt: 'Il y a 5 min' },
  ]);
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>(INITIAL_COMMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [analytics, setAnalytics] = useState(INITIAL_ANALYTICS);

  // Current active modals / drawers
  const [activeCommentVideo, setActiveCommentVideo] = useState<VideoItem | null>(null);
  const [activeShareVideo, setActiveShareVideo] = useState<VideoItem | null>(null);
  const [activeFilterVideo, setActiveFilterVideo] = useState<VideoItem | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreatorStudioOpen, setIsCreatorStudioOpen] = useState(false);
  const [studioInitialTab, setStudioInitialTab] = useState<'analytics' | 'monetization'>('analytics');
  const [studioInitialSubTab, setStudioInitialSubTab] = useState<StudioAnalyticsSubTab>('video_overview');
  const [studioInitialVideo, setStudioInitialVideo] = useState<VideoItem | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('tokvibe_app_locked') === 'true' ||
        (localStorage.getItem('tokvibe_biometric_enabled') === 'true' &&
          (localStorage.getItem('tokvibe_autolock_timing') || 'immediate') === 'immediate')
      );
    } catch {
      return false;
    }
  });
  const backgroundTimestampRef = useRef<number | null>(null);

  // Automatic biometric lock when leaving/returning to app (like WhatsApp, iOS & Android App Lock)
  useEffect(() => {
    const handleVisibilityChange = () => {
      try {
        const isBioEnabled = localStorage.getItem('tokvibe_biometric_enabled') === 'true';
        if (!isBioEnabled) return;

        const timing = localStorage.getItem('tokvibe_autolock_timing') || 'immediate';
        if (document.visibilityState === 'hidden') {
          backgroundTimestampRef.current = Date.now();
          if (timing === 'immediate') {
            localStorage.setItem('tokvibe_app_locked', 'true');
            setIsAppLocked(true);
          }
        } else if (document.visibilityState === 'visible' && backgroundTimestampRef.current) {
          const elapsedMs = Date.now() - backgroundTimestampRef.current;
          if (
            timing === 'immediate' ||
            (timing === '1min' && elapsedMs >= 60 * 1000) ||
            (timing === '15min' && elapsedMs >= 15 * 60 * 1000)
          ) {
            localStorage.setItem('tokvibe_app_locked', 'true');
            setIsAppLocked(true);
          }
          backgroundTimestampRef.current = null;
        }
      } catch {}
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [activeLiveHostId, setActiveLiveHostId] = useState<string | null>(null);
  const [liveChannels, setLiveChannels] = useState<LiveChannel[]>(DEFAULT_LIVE_CHANNELS);
  const [selectedChallengeForCreate, setSelectedChallengeForCreate] = useState<{ hashtag: string; soundIdea: string } | null>(null);
  const [pendingUnfollowCreator, setPendingUnfollowCreator] = useState<{
    authorId: string;
    authorName: string;
    authorHandle: string;
    authorAvatar: string;
  } | null>(null);

  // Stories State
  const [stories, setStories] = useState<StoryItem[]>(INITIAL_STORIES);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);

  // User Profile & Horizontal Gesture Navigation State
  const [viewedProfileUserId, setViewedProfileUserId] = useState<string | null>(null);
  const [viewedProfile, setViewedProfile] = useState<UserProfile | null>(null);
  const [horizontalSwipeDelta, setHorizontalSwipeDelta] = useState<number>(0);
  const gestureStartRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedCountry =
      (typeof window !== 'undefined' && localStorage.getItem('tokvibe_user_country')) || 'Haïti';
    const isHaiti = savedCountry === 'Haïti' || savedCountry.toLowerCase() === 'haiti';
    return {
      uid: 'creator-me',
      email: 'creator@tikflow.app',
      displayName: 'Mon Compte TikFlow',
      handle: 'mon_tikflow',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      bio: 'Passionné de tech & créateur de vidéos courtes ⚡ Bienvenue sur mon profil !',
      followersCount: 14200,
      followingCount: 42,
      likesReceived: 128400,
      isCreator: true,
      isVerified: true,
      verificationStatus: 'verified',
      idCountry: savedCountry,
      monetizationEnabled: isHaiti,
      walletBalance: 248.50,
      theme: 'black',
      accent: 'TokVibe',
      language: 'fr',
      privateAccount: false,
      allowComments: 'everyone',
      activityStatus: true,
      aiRecommenderVibe: 'balanced',
      userTags: ['#Tech', '#Créateur', '#Musique', '#Danse'],
      nameLastChangedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      handleLastChangedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      onboardingCompleted: true,
    };
  });

  useEffect(() => {
    if (viewedProfileUserId && viewedProfileUserId !== currentUser?.uid) {
      // Build author profile immediately from feed videos so swiping right always opens the video author's profile
      const authorVideos = videos.filter((v) => v.authorId === viewedProfileUserId);
      const firstVid = authorVideos[0];
      if (firstVid) {
        const totalLikes = authorVideos.reduce((acc, v) => acc + (v.likesCount || 0), 0);
        setViewedProfile({
          uid: firstVid.authorId,
          email: `${firstVid.authorHandle.replace(/^@/, '')}@tokvibe.app`,
          displayName: firstVid.authorName,
          handle: firstVid.authorHandle.replace(/^@/, ''),
          photoURL: firstVid.authorAvatar,
          bio: `Créateur officiel TokVibe ✨ • ${firstVid.caption.slice(0, 70)}`,
          followersCount: Math.max(15800, totalLikes * 3),
          followingCount: 128,
          likesReceived: Math.max(42000, totalLikes),
          isCreator: true,
          isVerified: Boolean(firstVid.authorVerified),
          verificationStatus: firstVid.authorVerified ? 'verified' : 'none',
          monetizationEnabled: false,
          walletBalance: 0,
          theme: 'black',
          accent: 'TokVibe',
          language: 'fr',
          privateAccount: false,
          allowComments: 'everyone',
          activityStatus: true,
          aiRecommenderVibe: 'balanced',
          userTags: firstVid.tags || ['#TokVibe'],
          onboardingCompleted: true,
        });
      }

      const fetchViewedProfile = async () => {
        try {
          const userSnap = await getDoc(doc(db, 'users', viewedProfileUserId));
          if (userSnap.exists()) {
            setViewedProfile(userSnap.data() as UserProfile);
          }
        } catch (err) {
          console.warn('Could not fetch user profile from Firestore:', err);
        }
      };
      fetchViewedProfile();
    } else {
      setViewedProfile(currentUser);
    }
  }, [viewedProfileUserId, currentUser, videos]);


  // Theme & Preferences
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tokvibe_theme');
      if (saved) return saved as ThemeMode;
    }
    return 'black';
  });
  const [accentColor, setAccentColor] = useState<AccentColor>('TokVibe');
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('fr');

  // Power Saving Mode & Prolonged Viewing Session AI Pause
  const [powerSavingMode, setPowerSavingMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tokvibe_power_saving') === 'true';
    } catch {
      return false;
    }
  });
  const [prolongedThresholdMins, setProlongedThresholdMins] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('tokvibe_power_saving_threshold') || '15');
    } catch {
      return 15;
    }
  });
  const [sessionWatchMinutes, setSessionWatchMinutes] = useState<number>(0);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('power-saving', powerSavingMode);
    }
  }, [powerSavingMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setSessionWatchMinutes((prev) => prev + 1);
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const isAiPausedByPowerSave =
    powerSavingMode && (prolongedThresholdMins === 0 || sessionWatchMinutes >= prolongedThresholdMins);

  // System Dark Mode preference listener
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const effectiveTheme = React.useMemo(() => {
    if (themeMode === 'system') {
      return systemPrefersDark ? 'black' : 'light';
    }
    return themeMode;
  }, [themeMode, systemPrefersDark]);

  const isLightMode = effectiveTheme === 'light';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', !isLightMode);
      document.documentElement.classList.toggle('light', isLightMode);
      document.documentElement.classList.toggle('light-theme', isLightMode);
      document.documentElement.setAttribute('data-theme', effectiveTheme);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('tokvibe_theme', themeMode);
    }
  }, [isLightMode, effectiveTheme, themeMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tokvibe_is_muted', String(isMuted));
    }
  }, [isMuted]);

  // Device Hardware/Browser Back Button:
  // When user clicks the device Back button on their phone or browser, close any open modal/page immediately
  useEffect(() => {
    const hasOpenModal =
      isLiveOpen ||
      isCreateOpen ||
      isAuthModalOpen ||
      isSettingsOpen ||
      isPrivacyOpen ||
      isCreatorStudioOpen ||
      Boolean(activeCommentVideo) ||
      Boolean(activeShareVideo) ||
      Boolean(activeFilterVideo) ||
      Boolean(pendingUnfollowCreator) ||
      Boolean(viewedProfileUserId);

    if (!hasOpenModal) return;

    window.history.pushState({ appModal: true }, '');

    const handlePopState = () => {
      if (isLiveOpen) {
        setIsLiveOpen(false);
        setActiveLiveHostId(null);
      } else if (activeCommentVideo) {
        setActiveCommentVideo(null);
      } else if (activeShareVideo) {
        setActiveShareVideo(null);
      } else if (activeFilterVideo) {
        setActiveFilterVideo(null);
      } else if (isCreateOpen) {
        setIsCreateOpen(false);
        setSelectedChallengeForCreate(null);
      } else if (isSettingsOpen) {
        setIsSettingsOpen(false);
      } else if (isPrivacyOpen) {
        setIsPrivacyOpen(false);
      } else if (isCreatorStudioOpen) {
        setIsCreatorStudioOpen(false);
      } else if (isAuthModalOpen) {
        setIsAuthModalOpen(false);
      } else if (pendingUnfollowCreator) {
        setPendingUnfollowCreator(null);
      } else if (viewedProfileUserId) {
        setViewedProfileUserId(null);
        setActiveTab('feed');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [
    isLiveOpen,
    isCreateOpen,
    isAuthModalOpen,
    isSettingsOpen,
    isPrivacyOpen,
    isCreatorStudioOpen,
    activeCommentVideo,
    activeShareVideo,
    activeFilterVideo,
    pendingUnfollowCreator,
    viewedProfileUserId,
  ]);

  const [aiPrefs, setAiPrefs] = useState<AIPreferences>({
    vibe: 'balanced',
    humorWeight: 75,
    techWeight: 80,
    creativeWeight: 65,
    musicWeight: 70,
  });

  // Touch / Scroll container ref & Pull-to-Refresh state for "Pour toi" video feed
  const feedContainerRef = useRef<HTMLDivElement | null>(null);
  const feedPullStartYRef = useRef<number | null>(null);
  const [feedPullDistance, setFeedPullDistance] = useState<number>(0);
  const [isRefreshingFeed, setIsRefreshingFeed] = useState<boolean>(false);
  const [feedRefreshSuccess, setFeedRefreshSuccess] = useState<boolean>(false);

  // User completion tracking & preference affinity weighting for triggerFeedRefresh
  const [fullyWatchedVideoIds, setFullyWatchedVideoIds] = useState<string[]>([]);
  const [userAffinityCategories, setUserAffinityCategories] = useState<Record<string, number>>({});

  const handleVideoComplete = (video: VideoItem) => {
    setFullyWatchedVideoIds((prev) => (prev.includes(video.id) ? prev : [...prev, video.id]));
    setUserAffinityCategories((prev) => ({
      ...prev,
      [video.category]: (prev[video.category] || 0) + 1,
    }));
  };

  const handleOpenAnalytics = (video?: VideoItem) => {
    setStudioInitialTab('analytics');
    setStudioInitialSubTab('video_overview');
    setStudioInitialVideo(video || videos[0] || null);
    setIsCreatorStudioOpen(true);
  };

  const handleOpenProfileVisitors = () => {
    setStudioInitialTab('analytics');
    setStudioInitialSubTab('profile_visitors');
    setIsCreatorStudioOpen(true);
  };

  // Trigger Pull-to-Refresh on the "Pour toi" video feed (always surfaces a different video first)
  const triggerFeedRefresh = () => {
    if (isRefreshingFeed) return;
    setIsRefreshingFeed(true);
    setFeedPullDistance(62);

    fetch('/api/lives')
      .then((r) => r.json())
      .then((data) => {
        if (data?.lives && Array.isArray(data.lives) && data.lives.length > 0) {
          setLiveChannels(data.lives);
        }
      })
      .catch(() => {});

    setTimeout(() => {
      // Shuffle & re-organize with stronger weighting on user preferences (fully watched categories / affinity)
      setVideos((prev) => {
        const freshOrder = getFreshFeedVideos(prev);
        const scored = freshOrder.map((v) => {
          let score = Math.random() * 100;
          if (userAffinityCategories[v.category]) {
            score += userAffinityCategories[v.category] * 400;
          }
          if (fullyWatchedVideoIds.includes(v.id)) {
            score += 200;
          }
          return { video: v, score };
        });
        scored.sort((a, b) => b.score - a.score);
        return scored.map((item) => item.video);
      });
      setActiveVideoIndex(0);
      if (feedContainerRef.current) {
        feedContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setIsRefreshingFeed(false);
      setFeedPullDistance(0);
      setFeedRefreshSuccess(true);
      setTimeout(() => setFeedRefreshSuccess(false), 2200);
    }, 100);
  };

  // Trigger Pull-to-Refresh on the Profile tab
  const handleRefreshProfile = () => {
    fetch('/api/lives')
      .then((r) => r.json())
      .then((data) => {
        if (data?.lives && Array.isArray(data.lives) && data.lives.length > 0) {
          setLiveChannels(data.lives);
        }
      })
      .catch(() => {});

    setCurrentUser((prev) =>
      prev
        ? {
            ...prev,
            followersCount: prev.followersCount + Math.floor(5 + Math.random() * 25),
            likesReceived: prev.likesReceived + Math.floor(40 + Math.random() * 180),
          }
        : prev
    );
    setVideos((prev) =>
      prev.map((v) => ({
        ...v,
        viewsCount: v.viewsCount + Math.floor(80 + Math.random() * 450),
      }))
    );
  };

  const handleFeedTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const el = feedContainerRef.current;
    if (!el || el.scrollTop > 10 || activeVideoIndex > 0 || isRefreshingFeed) {
      feedPullStartYRef.current = null;
      return;
    }
    feedPullStartYRef.current = e.touches[0].clientY;
  };

  const handleFeedTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (feedPullStartYRef.current === null || isRefreshingFeed) return;
    const el = feedContainerRef.current;
    if ((el && el.scrollTop > 10) || activeVideoIndex > 0) {
      feedPullStartYRef.current = null;
      setFeedPullDistance(0);
      return;
    }
    const deltaY = e.touches[0].clientY - feedPullStartYRef.current;
    if (deltaY > 0) {
      setFeedPullDistance(Math.min(95, deltaY * 0.55));
    } else {
      setFeedPullDistance(0);
    }
  };

  const handleFeedTouchEnd = () => {
    if (feedPullStartYRef.current === null) return;
    feedPullStartYRef.current = null;
    if (feedPullDistance >= 52) {
      triggerFeedRefresh();
    } else {
      setFeedPullDistance(0);
    }
  };

  const handleFeedPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const el = feedContainerRef.current;
    if (!el || el.scrollTop > 10 || activeVideoIndex > 0 || isRefreshingFeed) {
      feedPullStartYRef.current = null;
      return;
    }
    feedPullStartYRef.current = e.clientY;
  };

  const handleFeedPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || feedPullStartYRef.current === null || isRefreshingFeed) return;
    const deltaY = e.clientY - feedPullStartYRef.current;
    if (deltaY > 0) {
      setFeedPullDistance(Math.min(95, deltaY * 0.55));
    } else {
      setFeedPullDistance(0);
    }
  };

  const handleFeedPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    handleFeedTouchEnd();
  };

  // Run test connection to Firestore as mandated by skill & sync public LIVE streams
  useEffect(() => {
    testConnection();

    // Seed initial feed videos into Firestore if they don't exist yet
    const seedVideos = async () => {
      try {
        for (const vid of INITIAL_VIDEOS) {
          const vRef = doc(db, 'videos', vid.id);
          const snap = await getDoc(vRef);
          if (!snap.exists()) {
            await setDoc(vRef, {
              id: vid.id,
              authorId: vid.authorId,
              authorName: vid.authorName,
              authorHandle: vid.authorHandle,
              authorAvatar: vid.authorAvatar,
              caption: vid.caption,
              videoUrl: vid.videoUrl,
              thumbnailUrl: vid.thumbnailUrl || '',
              musicTitle: vid.musicTitle,
              filter: vid.filter,
              tags: vid.tags.join(','),
              likesCount: vid.likesCount,
              commentsCount: vid.commentsCount,
              bookmarksCount: vid.bookmarksCount,
              sharesCount: vid.sharesCount,
              viewsCount: vid.viewsCount,
              earnings: vid.earnings,
              createdAt: vid.createdAt,
            });
          }
        }
      } catch (err) {
        console.warn('Firestore seed note:', err);
      }
    };
    seedVideos();

    // Seed initial public LIVE streams into Firestore if they don't exist yet
    const seedLives = async () => {
      try {
        for (const live of DEFAULT_LIVE_CHANNELS) {
          const lRef = doc(db, 'lives', live.id);
          const snap = await getDoc(lRef);
          if (!snap.exists()) {
            await setDoc(lRef, {
              ...live,
              isPublic: true,
              startedAt: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.warn('Firestore seed lives note:', err);
      }
    };
    seedLives();

    fetch('/api/lives')
      .then((r) => r.json())
      .then((data) => {
        if (data?.lives && Array.isArray(data.lives) && data.lives.length > 0) {
          setLiveChannels(
            data.lives.map((l: LiveChannel) => ({ ...l, isPublic: true }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Real-Time Firestore onSnapshot listener for public LIVE streams (/lives where isPublic == true)
  useEffect(() => {
    const livesQuery = query(
      collection(db, 'lives'),
      where('isPublic', '==', true)
    );
    const unsubscribeLives = onSnapshot(
      livesQuery,
      (snapshot) => {
        if (snapshot.empty) return;
        const remoteLives: LiveChannel[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: data.id || docSnap.id,
            hostId: data.hostId || docSnap.id,
            hostName: data.hostName || 'Créateur TokVibe',
            hostHandle: data.hostHandle || 'createur',
            hostAvatar:
              data.hostAvatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            hostVerified: Boolean(data.hostVerified),
            title: data.title || '🔴 En LIVE Public sur TokVibe',
            category: data.category || 'Direct Public',
            viewersCount:
              typeof data.viewersCount === 'number' ? data.viewersCount : 250,
            likesCount:
              typeof data.likesCount === 'number' ? data.likesCount : 1200,
            videoUrl:
              data.videoUrl ||
              'https://assets.mixkit.co/videos/preview/mixkit-dj-playing-music-at-a-nightclub-43442-large.mp4',
            goalLabel: data.goalLabel || 'Objectif Cadeaux 🎁',
            goalCurrent:
              typeof data.goalCurrent === 'number' ? data.goalCurrent : 10,
            goalTarget:
              typeof data.goalTarget === 'number' ? data.goalTarget : 50,
            isPublic: true,
          };
        });

        setLiveChannels((prev) => {
          const mergedMap = new Map<string, LiveChannel>();
          remoteLives.forEach((l) => mergedMap.set(l.hostId, l));
          prev.forEach((l) => {
            if (!mergedMap.has(l.hostId)) {
              mergedMap.set(l.hostId, { ...l, isPublic: true });
            }
          });
          return Array.from(mergedMap.values());
        });
      },
      (err) => {
        console.warn('Firestore lives snapshot note:', err?.message);
      }
    );

    return () => unsubscribeLives();
  }, []);

  // Real-Time Firestore onSnapshot listener for video counters (likesCount & commentsCount)
  useEffect(() => {
    const pathForVideos = 'videos';
    const videosRef = collection(db, pathForVideos);

    const unsubscribeVideos = onSnapshot(
      videosRef,
      (snapshot) => {
        if (snapshot.empty) return;
        const remoteVideosMap = new Map<string, any>();
        snapshot.docs.forEach((docSnap) => {
          remoteVideosMap.set(docSnap.id, docSnap.data());
        });

        setVideos((prevVideos) => {
          return prevVideos.map((localVideo) => {
            const remoteData = remoteVideosMap.get(localVideo.id);
            if (remoteData) {
              return {
                ...localVideo,
                likesCount: typeof remoteData.likesCount === 'number' ? remoteData.likesCount : localVideo.likesCount,
                commentsCount: typeof remoteData.commentsCount === 'number' ? remoteData.commentsCount : localVideo.commentsCount,
                viewsCount: typeof remoteData.viewsCount === 'number' ? remoteData.viewsCount : localVideo.viewsCount,
                sharesCount: typeof remoteData.sharesCount === 'number' ? remoteData.sharesCount : localVideo.sharesCount,
              };
            }
            return localVideo;
          });
        });
      },
      (error) => {
        console.warn('Firestore videos snapshot notice:', error?.message);
      }
    );

    return () => unsubscribeVideos();
  }, []);

  // Real-Time Firestore onSnapshot listener for comments of the active video
  const activeVideoId = videos[activeVideoIndex]?.id;

  useEffect(() => {
    if (!activeVideoId) return;

    const pathForComments = `videos/${activeVideoId}/comments`;
    const commentsRef = collection(db, 'videos', activeVideoId, 'comments');

    const unsubscribeComments = onSnapshot(
      commentsRef,
      (snapshot) => {
        const remoteComments: CommentItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            videoId: activeVideoId,
            userId: data.userId || 'user-anon',
            userName: data.userName || 'Membre TikFlow',
            userAvatar: data.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
            text: data.text || '',
            likesCount: data.likesCount || 0,
            createdAt: data.createdAt || 'À l\'instant',
            authorHandle: data.authorHandle,
            authorName: data.authorName,
          };
        });

        if (remoteComments.length > 0) {
          setCommentsMap((prev) => ({
            ...prev,
            [activeVideoId]: remoteComments,
          }));
        }
      },
      (error) => {
        console.warn('Firestore comments snapshot note:', error?.message);
      }
    );

    return () => unsubscribeComments();
  }, [activeVideoId]);

  const liveHostIds = liveChannels.map((c) => c.hostId);
  const isUserLive = currentUser ? liveHostIds.includes(currentUser.uid) : false;

  const handleStartUserLive = (title: string) => {
    if (!currentUser) return;
    const myStream: LiveChannel = {
      id: `live-${currentUser.uid}`,
      hostId: currentUser.uid,
      hostName: currentUser.displayName,
      hostHandle: currentUser.handle,
      hostAvatar: currentUser.photoURL,
      hostVerified: Boolean(currentUser.isVerified),
      title: title || `🔴 Direct Public de @${currentUser.handle} sur TokVibe !`,
      category: 'Direct Public',
      viewersCount: 340,
      likesCount: 4800,
      videoUrl:
        'https://assets.mixkit.co/videos/preview/mixkit-dj-playing-music-at-a-nightclub-43442-large.mp4',
      goalLabel: 'Objectif Cadeaux 🎁',
      goalCurrent: 12,
      goalTarget: 50,
      isPublic: true,
    };

    setLiveChannels((prev) => [
      myStream,
      ...prev.filter((c) => c.hostId !== currentUser.uid),
    ]);
    setActiveLiveHostId(currentUser.uid);

    // Sync public live stream to Firestore so all users see it in the list
    setDoc(doc(db, 'lives', myStream.id), {
      ...myStream,
      isPublic: true,
      startedAt: new Date().toISOString(),
    }).catch((err) => console.warn('Firestore start live note:', err));

    fetch('/api/lives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', stream: myStream }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.lives && Array.isArray(data.lives)) {
          setLiveChannels(
            data.lives.map((l: LiveChannel) => ({ ...l, isPublic: true }))
          );
        }
      })
      .catch(() => {});
  };

  const handleStopUserLive = () => {
    if (!currentUser) return;
    setLiveChannels((prev) => prev.filter((c) => c.hostId !== currentUser.uid));
    setActiveLiveHostId(null);

    deleteDoc(doc(db, 'lives', `live-${currentUser.uid}`)).catch((err) =>
      console.warn('Firestore stop live note:', err)
    );

    fetch('/api/lives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop', hostId: currentUser.uid }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.lives && Array.isArray(data.lives)) {
          setLiveChannels(
            data.lives.map((l: LiveChannel) => ({ ...l, isPublic: true }))
          );
        }
      })
      .catch(() => {});
  };

  // Discover new public LIVE streams when scrolling to the end of the LIVE feed
  const handleDiscoverMoreLives = () => {
    // 1. Optimistic local discovery from DISCOVERABLE_LIVE_CHANNELS or generated public stream
    setLiveChannels((prev) => {
      const existingHostIds = new Set(prev.map((c) => c.hostId));
      const candidate = DISCOVERABLE_LIVE_CHANNELS.find(
        (c) => !existingHostIds.has(c.hostId)
      );
      const nextLive: LiveChannel = candidate
        ? { ...candidate, isPublic: true }
        : {
            id: `live-public-${Date.now()}`,
            hostId: `creator-live-${Date.now()}`,
            hostName: `Live Créateur #${prev.length + 1}`,
            hostHandle: `tokvibe_live_${prev.length + 1}`,
            hostAvatar:
              'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
            hostVerified: true,
            title: '🔴 Nouveau Direct Public Découvert en Défilant !',
            category: 'Découverte LIVE',
            viewersCount: Math.floor(320 + Math.random() * 2400),
            likesCount: Math.floor(4500 + Math.random() * 28000),
            videoUrl:
              'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-dancing-40033-large.mp4',
            goalLabel: 'Objectif Cadeaux 🎁',
            goalCurrent: 18,
            goalTarget: 60,
            isPublic: true,
          };

      setDoc(doc(db, 'lives', nextLive.id), {
        ...nextLive,
        isPublic: true,
        startedAt: new Date().toISOString(),
      }).catch(() => {});

      return [...prev, nextLive];
    });

    // 2. Also request backend discovery sync
    fetch('/api/lives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'discover' }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.lives && Array.isArray(data.lives)) {
          setLiveChannels((prev) => {
            const map = new Map<string, LiveChannel>();
            prev.forEach((l) => map.set(l.hostId, { ...l, isPublic: true }));
            data.lives.forEach((l: LiveChannel) =>
              map.set(l.hostId, { ...l, isPublic: true })
            );
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});
  };

  const handleOpenLiveChannel = (hostId?: string) => {
    if (hostId) {
      setActiveLiveHostId(hostId);
    }
    setIsLiveOpen(true);
  };

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            let userData = userSnap.data() as UserProfile;
            
            // ADMIN OVERRIDE: Verify the user "flow" (lorgeatsadam666@gmail.com)
            if (fbUser.email === 'lorgeatsadam666@gmail.com' && (!userData.isVerified || userData.verificationStatus !== 'verified')) {
                await updateDoc(userDocRef, { 
                    isVerified: true, 
                    verificationStatus: 'verified' 
                });
                userData = { ...userData, isVerified: true, verificationStatus: 'verified' };
            }
            
            setCurrentUser(userData);
          } else {
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || undefined,
              displayName: fbUser.displayName || 'Créateur TokVibe',
              handle: (fbUser.displayName || 'user').toLowerCase().replace(/\s+/g, '_') + '_' + fbUser.uid.slice(0, 4),
              photoURL: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
              bio: 'Créateur de contenu sur TokVibe 🎬',
              followersCount: 0,
              followingCount: 0,
              likesReceived: 0,
              isCreator: true,
              isVerified: fbUser.email === 'lorgeatsadam666@gmail.com',
              verificationStatus: fbUser.email === 'lorgeatsadam666@gmail.com' ? 'verified' : 'none',
              monetizationEnabled: true,
              walletBalance: 0,
              theme: themeMode,
              accent: accentColor,
              language: currentLang,
              privateAccount: false,
              allowComments: 'everyone',
              activityStatus: true,
              aiRecommenderVibe: 'balanced',
              createdAt: new Date().toISOString(),
              onboardingCompleted: fbUser.email === 'lorgeatsadam666@gmail.com',
            };
            await setDoc(userDocRef, newProfile);
            setCurrentUser(newProfile);
          }
        } catch (err) {
          console.warn('Firestore user fetch note:', err);
        }
      }
    });

    return () => unsubscribe();
  }, [themeMode, accentColor, currentLang]);

  // Scroll to specific video index in vertical snap feed
  const scrollToVideo = (index: number) => {
    if (feedContainerRef.current) {
      const height = feedContainerRef.current.clientHeight;
      feedContainerRef.current.scrollTo({
        top: index * height,
        behavior: 'smooth',
      });
    }
    setActiveVideoIndex(index);
  };

  // Scroll listener to update active video as user scrolls like TokVibe
  const handleFeedScroll = () => {
    if (!feedContainerRef.current) return;
    const { scrollTop, clientHeight } = feedContainerRef.current;
    if (clientHeight > 0) {
      const idx = Math.round(scrollTop / clientHeight);
      if (idx !== activeVideoIndex && idx >= 0 && idx < rankedVideos.length) {
        setActiveVideoIndex(idx);
      }
    }
  };

  // Handle hashtag click to filter rankedVideos
  const handleSelectHashtag = (tag: string) => {
    const clean = tag.replace(/^#/, '');
    setSelectedHashtag(clean);
    setActiveVideoIndex(0);
    setActiveTab('feed');
    setTimeout(() => {
      if (feedContainerRef.current) {
        feedContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  const handleOpenCreateModal = () => {
    if (typeof document !== 'undefined') {
      document.querySelectorAll('video, audio').forEach((el) => {
        try {
          (el as HTMLMediaElement).pause();
        } catch {}
      });
    }
    setIsCreateOpen(true);
  };

  const handleUseSound = (video: VideoItem) => {
    setIsMuted(true);
    setSelectedChallengeForCreate({
      hashtag: video.tags[0] || '',
      soundIdea: video.musicTitle,
    });
    handleOpenCreateModal();
  };

  const handleSelectStory = (story: StoryItem) => {
    setStories(prev => prev.map(s => s.id === story.id ? { ...s, isViewed: true } : s));
    setActiveStoryId(story.id);
  };

  const handleCreateStory = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    // Simulate creating a story
    const newStory: StoryItem = {
      id: 'story-' + Date.now(),
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      authorHandle: currentUser.handle,
      authorAvatar: currentUser.photoURL,
      imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600',
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24,
    };
    setStories(prev => [newStory, ...prev]);
    alert('Status publié avec succès !');
  };


  // Clear hashtag filter
  const handleClearHashtag = () => {
    setSelectedHashtag(null);
    setActiveVideoIndex(0);
    setTimeout(() => {
      if (feedContainerRef.current) {
        feedContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  // AI Recommender Engine: balances Engagement (Likes/Shares) with Freshness (Shuffled order)
  const rankedVideos = React.useMemo(() => {
    let list = [...videos];

    // 1. Filter by Friends mode if active
    if (feedMode === 'friends') {
      const friendsList = list.filter((v) => followedAuthorIds.includes(v.authorId));
      list = friendsList.length > 0 ? friendsList : list;
    }

    // 2. Filter by selected hashtag if active
    if (selectedHashtag) {
      const lower = selectedHashtag.toLowerCase();
      list = list.filter((v) => {
        const matchTag = v.tags && v.tags.some((t) => t.toLowerCase() === lower);
        const matchCaption = v.caption.toLowerCase().includes('#' + lower);
        return matchTag || matchCaption;
      });
    }

    // 3. Ranking Algorithm: Base order is the current videos array (which is shuffled on refresh)
    // When Power Saving Mode pauses the AI recommender during prolonged sessions, skip dynamic AI re-scoring to conserve CPU & battery.
    if (!selectedHashtag && !isAiPausedByPowerSave) {
      list.sort((a, b) => {
        const scoreA = a.likesCount * 0.1 + a.sharesCount * 0.5 + a.commentsCount * 0.2;
        const scoreB = b.likesCount * 0.1 + b.sharesCount * 0.5 + b.commentsCount * 0.2;

        // Find original indices (to respect shuffle)
        const idxA = videos.findIndex((v) => v.id === a.id);
        const idxB = videos.findIndex((v) => v.id === b.id);

        // Final score: Freshness (lower index is better) + Engagement boost
        const finalA = 1000 - idxA * 100 + scoreA;
        const finalB = 1000 - idxB * 100 + scoreB;

        return finalB - finalA;
      });
    }

    return list;
  }, [videos, selectedHashtag, feedMode, followedAuthorIds, isAiPausedByPowerSave]);

  // Automatically record viewed videos into 'Historique de visionnage'
  const recordVideoWatched = (videoId: string) => {
    if (!videoId) return;
    const nowTime = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const label = `Vu à ${nowTime}`;
    setWatchHistory((prev) => [
      { videoId, watchedAt: label },
      ...prev.filter((item) => item.videoId !== videoId),
    ]);
  };

  useEffect(() => {
    if (showSplash || activeTab !== 'feed') return;
    const currentVideo = rankedVideos[activeVideoIndex];
    if (currentVideo) {
      recordVideoWatched(currentVideo.id);
    }
  }, [activeVideoIndex, activeTab, showSplash, rankedVideos]);

  const handleRemoveFromWatchHistory = (videoId: string) => {
    setWatchHistory((prev) => prev.filter((item) => item.videoId !== videoId));
  };

  const handleClearWatchHistory = () => {
    setWatchHistory([]);
  };

  // Keyboard navigation up / down for desktop or tablet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'feed') return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = Math.min(activeVideoIndex + 1, rankedVideos.length - 1);
        scrollToVideo(nextIdx);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx = Math.max(activeVideoIndex - 1, 0);
        scrollToVideo(prevIdx);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, rankedVideos.length, activeVideoIndex]);

  // Handle like toggle (synchronizes in real-time to Firestore for all connected users)
  const handleToggleLike = async (videoId: string) => {
    const wasLiked = likedVideoIds.includes(videoId);
    setLikedVideoIds((prev) =>
      wasLiked ? prev.filter((id) => id !== videoId) : [...prev, videoId]
    );

    // Local optimistic update
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? { ...v, likesCount: Math.max(0, v.likesCount + (wasLiked ? -1 : 1)) }
          : v
      )
    );

    // Update Firestore video document & likes subcollection for real-time broadcast
    try {
      const videoRef = doc(db, 'videos', videoId);
      await updateDoc(videoRef, {
        likesCount: increment(wasLiked ? -1 : 1),
      });

      if (currentUser?.uid) {
        const likeRef = doc(db, 'videos', videoId, 'likes', currentUser.uid);
        if (wasLiked) {
          await deleteDoc(likeRef);
        } else {
          await setDoc(likeRef, {
            id: currentUser.uid,
            videoId,
            userId: currentUser.uid,
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.warn('Firestore real-time like sync:', err);
    }
  };

  // Handle 3-second hold on Like button to Repost ("Republier") a video
  const handleRepostVideo = (video: VideoItem) => {
    setRepostedVideoIds((prev) =>
      prev.includes(video.id) ? prev : [video.id, ...prev]
    );

    setVideos((prev) =>
      prev.map((v) =>
        v.id === video.id ? { ...v, sharesCount: v.sharesCount + 1 } : v
      )
    );

    const newNotif: NotificationItem = {
      id: 'notif-repost-' + Date.now(),
      recipientId: currentUser?.uid || 'me',
      senderId: currentUser?.uid || 'me',
      senderName: currentUser?.displayName || 'Vous',
      senderAvatar:
        currentUser?.photoURL ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      type: 'like',
      text: `avez republié la vidéo de @${video.authorHandle} (maintien 3s sur J'aime).`,
      videoId: video.id,
      read: false,
      createdAt: "À l'instant",
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Handle bookmark / favorite toggle
  const handleToggleBookmark = async (videoId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const wasBookmarked = bookmarkedVideoIds.includes(videoId);
    setBookmarkedVideoIds((prev) =>
      wasBookmarked ? prev.filter((id) => id !== videoId) : [...prev, videoId]
    );

    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? { ...v, bookmarksCount: v.bookmarksCount + (wasBookmarked ? -1 : 1) }
          : v
      )
    );

    // Firestore sync
    try {
      const bookmarkRef = doc(db, 'users', currentUser.uid, 'bookmarks', videoId);
      if (wasBookmarked) {
        await deleteDoc(bookmarkRef);
      } else {
        await setDoc(bookmarkRef, {
          id: videoId,
          videoId,
          userId: currentUser.uid,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Firestore bookmark sync:', err);
    }
  };

  // Handle follow creator toggle (opens confirmation dialog when unfollowing)
  const handleToggleFollow = async (authorId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const wasFollowing = followedAuthorIds.includes(authorId);

    if (wasFollowing) {
      const targetVideo = videos.find((v) => v.authorId === authorId);
      setPendingUnfollowCreator({
        authorId,
        authorName: targetVideo?.authorName || 'Créateur TikFlow',
        authorHandle: targetVideo?.authorHandle || authorId.replace(/^creator-/, ''),
        authorAvatar:
          targetVideo?.authorAvatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      });
      return;
    }

    setFollowedAuthorIds((prev) => [...prev, authorId]);

    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      recipientId: authorId,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      senderAvatar: currentUser.photoURL,
      type: 'follow',
      text: 'a commencé à vous suivre.',
      read: false,
      createdAt: 'À l\'instant',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Confirm unfollow action from the confirmation dialog
  const handleConfirmUnfollow = () => {
    if (!pendingUnfollowCreator) return;
    const { authorId } = pendingUnfollowCreator;
    setFollowedAuthorIds((prev) => prev.filter((id) => id !== authorId));
    setPendingUnfollowCreator(null);
  };

  // Add Comment (synchronizes in real-time to Firestore for all connected users)
  const handleAddComment = async (videoId: string, text: string) => {
    const newComment: CommentItem = {
      id: 'com-' + Date.now(),
      videoId,
      userId: currentUser?.uid || 'guest-1',
      userName: currentUser?.displayName || 'Membre TikFlow',
      userAvatar: currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      text,
      likesCount: 0,
      createdAt: 'À l\'instant',
    };

    setCommentsMap((prev) => ({
      ...prev,
      [videoId]: [newComment, ...(prev[videoId] || [])],
    }));

    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId ? { ...v, commentsCount: v.commentsCount + 1 } : v
      )
    );

    // Firestore real-time comment creation and video counter update
    try {
      const commentRef = doc(db, 'videos', videoId, 'comments', newComment.id);
      await setDoc(commentRef, newComment);

      const videoRef = doc(db, 'videos', videoId);
      await updateDoc(videoRef, {
        commentsCount: increment(1),
      });
    } catch (err) {
      console.warn('Firestore real-time comment sync:', err);
    }
  };

  // Like comment
  const handleLikeComment = (commentId: string) => {
    setCommentsMap((prev) => {
      const updated = { ...prev };
      for (const vId in updated) {
        updated[vId] = updated[vId].map((c) =>
          c.id === commentId
            ? {
                ...c,
                isLiked: !c.isLiked,
                likesCount: c.likesCount + (c.isLiked ? -1 : 1),
              }
            : c
        );
      }
      return updated;
    });
  };

  // Change Visual Filter on current video
  const handleApplyFilter = (filter: FilterPreset) => {
    if (!activeFilterVideo) return;
    setVideos((prev) =>
      prev.map((v) => (v.id === activeFilterVideo.id ? { ...v, filter } : v))
    );
    setActiveFilterVideo((prev) => (prev ? { ...prev, filter } : null));
  };

  // Publish new user video
  const handleAgeVerificationComplete = (data: { birthDate: string; idCountry: string; idType: string }) => {
    if (!currentUser) return;
    
    const updatedUser = {
      ...currentUser,
      birthDate: data.birthDate,
      idCountry: data.idCountry,
      idType: data.idType as any,
      onboardingCompleted: true,
    };
    
    setCurrentUser(updatedUser);
    
    // Persist to Firestore if logged in
    const userRef = doc(db, 'users', currentUser.uid);
    updateDoc(userRef, {
      birthDate: data.birthDate,
      idCountry: data.idCountry,
      idType: data.idType,
      onboardingCompleted: true,
    }).catch(err => console.error("Error updating onboarding:", err));
  };

  const handlePublishVideo = (newVideoData: any) => {
    // Moderation check
    const modResult = validateVideoSafety(
      newVideoData.caption,
      newVideoData.tags,
      newVideoData.musicTitle,
      newVideoData.category
    );

    if (!modResult.isAllowed) {
        alert(modResult.reason || 'Vidéo non conforme aux règles de TokVibe.');
        return;
    }

    const published: VideoItem = {
      ...newVideoData,
      id: 'vid-' + Date.now(),
      authorVerified: currentUser?.isVerified ?? true,
      likesCount: 1,
      commentsCount: 0,
      bookmarksCount: 0,
      sharesCount: 0,
      viewsCount: 1,
      earnings: 0.05,
      createdAt: 'À l\'instant',
      hasSafetyWarning: modResult.isDangerousContent,
      safetyWarningText: modResult.isDangerousContent ? modResult.suggestedSafetyWarning : undefined,
    };
    setVideos((prev) => [published, ...prev]);
    setSelectedHashtag(null);
    setActiveVideoIndex(0);
    setActiveTab('feed');
    setTimeout(() => {
      scrollToVideo(0);
    }, 80);
  };

  // Simulate Push notification trigger
  const handleSimulatePush = () => {
    const types: NotificationItem['type'][] = ['monetization', 'like', 'comment', 'follow'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    let text = 'a aimé votre publication.';
    if (randomType === 'monetization') {
      text = 'Revenus publicitaires automatiques crédités : +18.50 $ pour 8 400 vues !';
      // Automatically increment creator wallet
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          walletBalance: currentUser.walletBalance + 18.50,
        });
      }
    } else if (randomType === 'comment') {
      text = 'a commenté : "Trop stylé ce montage vidéo !" 🔥';
    } else if (randomType === 'follow') {
      text = 'a commencé à suivre vos créations.';
    }

    const mockNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      recipientId: currentUser?.uid || 'me',
      senderId: 'user-sim',
      senderName: randomType === 'monetization' ? 'TikFlow Creator Fund' : 'Sarah Studio',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      type: randomType,
      text,
      read: false,
      createdAt: 'À l\'instant',
    };

    setNotifications((prev) => [mockNotif, ...prev]);

    // Browser Notification if granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(mockNotif.senderName, {
        body: mockNotif.text,
      });
    }
  };

  // Payout withdrawal
  const handleWithdraw = (amount: number) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        walletBalance: 0,
      });
    }
  };

  // Theme background mapping
  const getThemeBackground = () => {
    switch (effectiveTheme) {
      case 'light':
        return 'bg-zinc-100 text-zinc-900';
      case 'midnight':
        return 'bg-[#0B1120] text-white';
      case 'cyber':
        return 'bg-[#0F0E17] text-white';
      case 'studio':
        return 'bg-[#18181B] text-white';
      case 'black':
      default:
        return 'bg-black text-white';
    }
  };

  const getContainerBackground = () => {
    if (isLightMode) {
      return 'bg-white text-zinc-900 border-zinc-200';
    }
    return 'bg-black text-white border-white/5';
  };

  const t = translations[currentLang] || translations.fr;

  return (
    <div className={`fixed inset-0 flex items-center justify-center ${getThemeBackground()} transition-colors duration-300 overflow-hidden`}>
      {/* Animated Splash Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Mobile Shell Container (Fixed 9:16 mobile aspect constraint on desktop, full screen on mobile) */}
      <div className={`relative w-full max-w-md h-full max-h-[100dvh] flex flex-col shadow-2xl overflow-hidden border-x transition-colors duration-300 ${getContainerBackground()}`}>
        
        {/* Main Content Area with Advanced Gesture Navigation:
            - Swipe Right (Balayage vers la droite) on Feed -> Opens current video author's profile
            - Swipe Left (Balayage vers la gauche) on Profile -> Closes profile and returns to video feed */}
        <div
          className="relative flex-1 w-full h-full overflow-hidden"
          onTouchStart={(e) => {
            if (e.touches.length !== 1) return;
            gestureStartRef.current = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
              active: true,
            };
            setHorizontalSwipeDelta(0);
          }}
          onTouchMove={(e) => {
            if (!gestureStartRef.current.active || e.touches.length !== 1) return;
            const dx = e.touches[0].clientX - gestureStartRef.current.x;
            const dy = e.touches[0].clientY - gestureStartRef.current.y;
            if (Math.abs(dx) > Math.abs(dy) * 1.15 && Math.abs(dx) > 14) {
              if ((activeTab === 'feed' && dx > 0) || (activeTab === 'profile' && dx < 0)) {
                setHorizontalSwipeDelta(Math.max(-140, Math.min(140, dx)));
              }
            }
          }}
          onTouchEnd={(e) => {
            if (!gestureStartRef.current.active) return;
            const endX = e.changedTouches[0]?.clientX ?? gestureStartRef.current.x;
            const endY = e.changedTouches[0]?.clientY ?? gestureStartRef.current.y;
            const deltaX = endX - gestureStartRef.current.x;
            const deltaY = endY - gestureStartRef.current.y;
            gestureStartRef.current.active = false;
            setHorizontalSwipeDelta(0);

            // Ensure predominantly horizontal gesture
            if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
              if (deltaX > 0 && activeTab === 'feed') {
                // Balayage vers la droite -> Ouvrir le profil de l'auteur de la vidéo en cours
                const currentVideo = rankedVideos[activeVideoIndex];
                if (currentVideo) {
                  setViewedProfileUserId(currentVideo.authorId);
                  setActiveTab('profile');
                }
              } else if (deltaX < 0 && activeTab === 'profile') {
                // Balayage vers la gauche -> Fermer le profil pour revenir au flux vidéo
                setViewedProfileUserId(null);
                setActiveTab('feed');
              }
            }
          }}
          onPointerDown={(e) => {
            if (e.pointerType === 'touch') return;
            gestureStartRef.current = {
              x: e.clientX,
              y: e.clientY,
              active: true,
            };
          }}
          onPointerMove={(e) => {
            if (e.pointerType === 'touch' || !gestureStartRef.current.active) return;
            const dx = e.clientX - gestureStartRef.current.x;
            const dy = e.clientY - gestureStartRef.current.y;
            if (Math.abs(dx) > Math.abs(dy) * 1.15 && Math.abs(dx) > 18) {
              if ((activeTab === 'feed' && dx > 0) || (activeTab === 'profile' && dx < 0)) {
                setHorizontalSwipeDelta(Math.max(-140, Math.min(140, dx)));
              }
            }
          }}
          onPointerUp={(e) => {
            if (e.pointerType === 'touch' || !gestureStartRef.current.active) return;
            const deltaX = e.clientX - gestureStartRef.current.x;
            const deltaY = e.clientY - gestureStartRef.current.y;
            gestureStartRef.current.active = false;
            setHorizontalSwipeDelta(0);

            if (Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
              if (deltaX > 0 && activeTab === 'feed') {
                const currentVideo = rankedVideos[activeVideoIndex];
                if (currentVideo) {
                  setViewedProfileUserId(currentVideo.authorId);
                  setActiveTab('profile');
                }
              } else if (deltaX < 0 && activeTab === 'profile') {
                setViewedProfileUserId(null);
                setActiveTab('feed');
              }
            }
          }}
        >
          {/* Real-time Visual Gesture Indicator for Swipe Right (Author Profile) & Swipe Left (Back to Feed) */}
          {horizontalSwipeDelta > 20 && activeTab === 'feed' && rankedVideos[activeVideoIndex] && (
            <div
              style={{
                transform: `translateX(${Math.min(72, horizontalSwipeDelta * 0.45)}px)`,
                opacity: Math.min(1, horizontalSwipeDelta / 65),
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-black/85 backdrop-blur-md border border-[#25F4EE]/50 shadow-2xl transition-transform duration-75"
            >
              <img
                src={rankedVideos[activeVideoIndex].authorAvatar}
                alt={rankedVideos[activeVideoIndex].authorName}
                className="w-8 h-8 rounded-full object-cover border border-[#25F4EE]"
              />
              <div className="text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#25F4EE] block">
                  Profil de l'auteur →
                </span>
                <span className="text-xs font-black text-white block">
                  @{rankedVideos[activeVideoIndex].authorHandle.replace(/^@/, '')}
                </span>
              </div>
            </div>
          )}

          {horizontalSwipeDelta < -20 && activeTab === 'profile' && (
            <div
              style={{
                transform: `translateX(${Math.max(-72, horizontalSwipeDelta * 0.45)}px)`,
                opacity: Math.min(1, Math.abs(horizontalSwipeDelta) / 65),
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-black/85 backdrop-blur-md border border-[#FE2C55]/50 shadow-2xl transition-transform duration-75"
            >
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FE2C55] block">
                  ← Retour au flux
                </span>
                <span className="text-xs font-black text-white block">
                  Fermer le profil
                </span>
              </div>
            </div>
          )}
          
          {/* TAB 1: FEED (VERTICAL VIDEO FEED) */}
          {activeTab === 'feed' && (
            <div className="relative w-full h-full" data-feed-overlay="true">
              {/* Top Floating Buttons (Compact & Small) */}
              {!isFullScreen && (
                <>
                  {/* Top-left Search & Small LIVE Buttons */}
                  <div className="absolute top-2.5 left-3 z-35 flex items-center gap-1.5 pointer-events-auto">
                    {/* Search Button */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('explore')}
                      className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition flex items-center justify-center shadow-md"
                      title="Rechercher"
                    >
                      <Search className="w-3.5 h-3.5 text-[#25F4EE]" />
                    </button>

                    {/* LIVE Round Ball Button (Flashing / Pulsing) */}
                    <button
                      type="button"
                      onClick={() => handleOpenLiveChannel(liveChannels[0]?.hostId)}
                      className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border-2 border-[#FE2C55] text-[#FE2C55] hover:bg-black/80 transition flex items-center justify-center shadow-[0_0_12px_rgba(254,44,85,0.7)] animate-pulse active:scale-95"
                      title="Passer un LIVE"
                    >
                      <svg className="w-3.5 h-3.5 text-[#FE2C55]" viewBox="0 0 24 24" fill="none">
                        <path d="M4.5 18.5C2 15 2 9 4.5 5.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                        <path d="M19.5 5.5C22 9 22 15 19.5 18.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>

                  {/* Top-right Quick Biometric App Lock Button */}
                  <div className="absolute top-2.5 right-3 z-35 flex items-center gap-1.5 pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          localStorage.setItem('tokvibe_biometric_enabled', 'true');
                          localStorage.setItem('tokvibe_app_locked', 'true');
                        } catch {}
                        setIsAppLocked(true);
                      }}
                      className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-emerald-400/40 text-emerald-400 hover:bg-black/80 transition flex items-center justify-center shadow-md active:scale-95 cursor-pointer"
                      title="Verrouiller l'application (Protection Biométrique & Face ID)"
                    >
                      <Lock className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Top Feed Switcher ("Amis" & "Pour toi") */}
                  <div className="absolute top-2.5 inset-x-0 z-30 flex items-center justify-center gap-6 pointer-events-auto">
                    {/* Amis (Friends) Feed Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (feedMode === 'friends') {
                          triggerFeedRefresh();
                        } else {
                          setFeedMode('friends');
                          setActiveVideoIndex(0);
                        }
                      }}
                      title="Amis (Vidéos de vos amis et créateurs suivis)"
                      className={`text-sm sm:text-[15px] tracking-wide transition-all drop-shadow-md relative py-1 ${
                        feedMode === 'friends'
                          ? 'text-white font-black scale-105'
                          : 'text-white/65 font-bold hover:text-white'
                      }`}
                    >
                      <span>{t.friends || 'Amis'}</span>
                      {feedMode === 'friends' && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2.5px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                      )}
                    </button>

                    {/* Pour toi (For You) Feed Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (feedMode === 'forYou') {
                          triggerFeedRefresh();
                        } else {
                          setFeedMode('forYou');
                          setActiveVideoIndex(0);
                        }
                      }}
                      title="Pour toi (Recommandations personnalisées)"
                      className={`text-sm sm:text-[15px] tracking-wide transition-all drop-shadow-md relative py-1 ${
                        feedMode === 'forYou'
                          ? 'text-white font-black scale-105'
                          : 'text-white/65 font-bold hover:text-white'
                      }`}
                    >
                      <span>{t.forYou}</span>
                      {feedMode === 'forYou' && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2.5px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* Minimal Feed Refresh Indicator */}
              {(feedPullDistance > 0 || isRefreshingFeed) && (
                <div
                  style={{
                    transform: `translateY(${
                      isRefreshingFeed ? 40 : Math.min(60, feedPullDistance)
                    }px)`,
                    opacity: Math.min(1, feedPullDistance / 40),
                  }}
                  className="absolute top-4 inset-x-0 z-40 flex items-center justify-center pointer-events-none transition-transform duration-150"
                >
                  <div className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-lg">
                    <RefreshCw
                      className={`w-5 h-5 text-[#25F4EE] ${
                        isRefreshingFeed || feedPullDistance >= 52 ? 'animate-spin' : ''
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Active Hashtag Filter floating pill */}
              {selectedHashtag && (
                <div className="absolute top-28 inset-x-0 z-30 flex items-center justify-center pointer-events-auto">
                  <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#25F4EE]/50 shadow-xl animate-scale-in">
                    <span className="w-2 h-2 rounded-full bg-[#25F4EE] animate-pulse" />
                    <span className="text-xs font-black text-[#25F4EE]">#{selectedHashtag}</span>
                    <span className="text-[10px] text-white/60">({rankedVideos.length} {rankedVideos.length > 1 ? 'vidéos' : 'vidéo'})</span>
                    <button
                      onClick={handleClearHashtag}
                      className="p-1 rounded-full text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition active:scale-90"
                      title="Effacer le filtre"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}


              {/* Vertical Scroll Video Carousel - Authentic TokVibe Snap Scrolling + Pull-to-Refresh */}
              <div
                ref={feedContainerRef}
                onScroll={handleFeedScroll}
                onTouchStart={handleFeedTouchStart}
                onTouchMove={handleFeedTouchMove}
                onTouchEnd={handleFeedTouchEnd}
                onPointerDown={handleFeedPointerDown}
                onPointerMove={handleFeedPointerMove}
                onPointerUp={handleFeedPointerUp}
                className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative"
                style={{ scrollSnapType: 'y mandatory', overscrollBehaviorY: 'contain' }}
              >
                {rankedVideos.length === 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white/60">
                    <Hash className="w-12 h-12 text-[#25F4EE] mb-2 animate-bounce" />
                    <p className="text-sm font-bold text-white">Aucune vidéo avec #{selectedHashtag}</p>
                    <button
                      onClick={handleClearHashtag}
                      className="mt-3 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold text-white transition active:scale-95"
                    >
                      Voir toutes les vidéos
                    </button>
                  </div>
                ) : (
                  rankedVideos.map((video, idx) => (
                    <div
                      key={video.id}
                      data-index={idx}
                      className="w-full h-full snap-start snap-always shrink-0 relative"
                    >
                      <VideoPlayer
                        video={video}
                        isActive={activeTab === 'feed' && !showSplash && !isLiveOpen && !isAppLocked && activeVideoIndex === idx}
                        isMuted={isMuted}
                        onToggleMute={() => setIsMuted(!isMuted)}
                        isLiked={likedVideoIds.includes(video.id)}
                        onToggleLike={handleToggleLike}
                        isBookmarked={bookmarkedVideoIds.includes(video.id)}
                        onToggleBookmark={handleToggleBookmark}
                        isFollowing={followedAuthorIds.includes(video.authorId)}
                        onToggleFollow={handleToggleFollow}
                        isReposted={repostedVideoIds.includes(video.id)}
                        onRepostVideo={handleRepostVideo}
                        onOpenComments={(v) => setActiveCommentVideo(v)}
                        onSendSticker={handleAddComment}
                        onOpenShare={(v) => setActiveShareVideo(v)}
                        onOpenFilters={(v) => setActiveFilterVideo(v)}
                        onSelectTag={handleSelectHashtag}
                        onSelectCreator={(authorId) => {
                          setViewedProfileUserId(authorId);
                          setActiveTab('profile');
                        }}
                        onUseSound={handleUseSound}
                        onOpenLive={() => handleOpenLiveChannel()}
                        isCreatorLive={liveHostIds.includes(video.authorId)}
                        onOpenCreatorLive={(authorId) => handleOpenLiveChannel(authorId)}
                        activeHashtagFilter={selectedHashtag}
                        autoplay={autoplayEnabled}
                        isFullScreen={isFullScreen}
                        onToggleFullScreen={() => setIsFullScreen((prev) => !prev)}
                        currentUserId={currentUser?.uid}
                        onOpenEditVideo={(v) => setEditingVideo(v)}
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Swipe Video Up/Down Quick Navigation buttons (Hidden in Full Screen) */}
              {!isFullScreen && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5 pointer-events-auto opacity-35 hover:opacity-100 transition">
                  <button
                    disabled={activeVideoIndex === 0}
                    onClick={() => scrollToVideo(Math.max(activeVideoIndex - 1, 0))}
                    className="w-6 h-6 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-[10px] text-white disabled:opacity-20 active:scale-90"
                    title="Vidéo précédente (Flèche Haut)"
                  >
                    ▲
                  </button>
                  <button
                    disabled={activeVideoIndex >= rankedVideos.length - 1}
                    onClick={() => scrollToVideo(Math.min(activeVideoIndex + 1, rankedVideos.length - 1))}
                    className="w-6 h-6 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-[10px] text-white disabled:opacity-20 active:scale-90"
                    title="Vidéo suivante (Flèche Bas)"
                  >
                    ▼
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXPLORE & SEARCH */}
          {activeTab === 'explore' && (
            <ExploreTab
              videos={videos}
              liveChannels={liveChannels}
              followedAuthorIds={followedAuthorIds}
              onToggleFollow={handleToggleFollow}
              onOpenLive={(hostId) => handleOpenLiveChannel(hostId)}
              onSelectVideo={(id) => {
                const idx = rankedVideos.findIndex((v) => v.id === id);
                if (idx !== -1) setActiveVideoIndex(idx);
                setActiveTab('feed');
              }}
              onSelectCreator={(authorId) => {
                setViewedProfileUserId(authorId);
                setActiveTab('profile');
              }}
              onSelectHashtag={(tag) => handleSelectHashtag(tag)}
              onParticipateChallenge={(challenge) => {
                setSelectedChallengeForCreate({
                  hashtag: challenge.hashtag,
                  soundIdea: challenge.soundIdea,
                });
                handleOpenCreateModal();
              }}
              onSelectSoundForCreate={(soundTitle) => {
                setSelectedChallengeForCreate({
                  hashtag: '#ViralSound',
                  soundIdea: soundTitle,
                });
                handleOpenCreateModal();
              }}
            />
          )}

          {/* TAB 3: INBOX / MESSAGES & NOTIFICATIONS */}
          {activeTab === 'inbox' && (
            <NotificationsModal
              notifications={notifications}
              currentUser={currentUser}
              onClose={() => setActiveTab('feed')}
              onSelectNotification={() => setActiveTab('feed')}
              onOpenProfileVisitors={handleOpenProfileVisitors}
              onSimulatePush={handleSimulatePush}
              stories={stories}
              onSelectStory={handleSelectStory}
              onCreateStory={handleCreateStory}
              liveChannels={liveChannels}
              onOpenLive={(hostId) => handleOpenLiveChannel(hostId)}
            />
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <ProfileTab
              user={viewedProfile}
              currentUserId={currentUser?.uid}
              allVideos={videos}
              bookmarkedVideoIds={bookmarkedVideoIds}
              likedVideoIds={likedVideoIds}
              repostedVideoIds={repostedVideoIds}
              followedAuthorIds={followedAuthorIds}
              watchHistory={watchHistory}
              onRemoveFromWatchHistory={handleRemoveFromWatchHistory}
              onClearWatchHistory={handleClearWatchHistory}
              isUserLive={isUserLive}
              liveHostIds={liveHostIds}
              onStartUserLive={handleStartUserLive}
              onStopUserLive={handleStopUserLive}
              onOpenLive={(hostId) => handleOpenLiveChannel(hostId)}
              onToggleFollow={handleToggleFollow}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onOpenCreatorStudio={() => {
                setStudioInitialTab('monetization');
                setStudioInitialVideo(null);
                setIsCreatorStudioOpen(true);
              }}
              onOpenVideoAnalytics={(vid) => handleOpenAnalytics(vid)}
              onOpenProfileVisitors={handleOpenProfileVisitors}
              onOpenStudioEditor={handleOpenCreateModal}
              onRefreshProfile={handleRefreshProfile}
              onOpenPrivacy={() => setIsPrivacyOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onBackToFeed={() => {
                setViewedProfileUserId(null);
                setActiveTab('feed');
              }}
              onLogout={async () => {
                await logoutUser();
                setCurrentUser(null);
              }}
              onSelectVideo={(id) => {
                recordVideoWatched(id);
                const idx = rankedVideos.findIndex((v) => v.id === id);
                if (idx !== -1) setActiveVideoIndex(idx);
                setActiveTab('feed');
              }}
              onSelectCreator={(authorId) => {
                setViewedProfileUserId(authorId);
                setActiveTab('profile');
              }}
              onUpdateProfile={(updated) => {
                if (currentUser) {
                  const newUser = { ...currentUser, ...updated };
                  setCurrentUser(newUser);
                  if (updated.isVerified !== undefined) {
                    setVideos((prev) =>
                      prev.map((v) =>
                        v.authorId === currentUser.uid
                          ? { ...v, authorVerified: updated.isVerified }
                          : v
                      )
                    );
                  }
                }
              }}
            />
          )}
        </div>

        {/* Bottom Mobile Navigation Bar (Hidden when in Full Screen viewing mode on feed) */}
        {!(activeTab === 'feed' && isFullScreen) && (
        <div className="relative z-30 h-[66px] bg-black border-t border-white/10 grid grid-cols-5 items-center px-1 select-none">
          {/* 1. Accueil (Tapping when already on feed triggers Pull-to-Refresh for Pour Toi) */}
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'feed') {
                triggerFeedRefresh();
              } else {
                setActiveTab('feed');
              }
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1 transition active:scale-95 ${
              activeTab === 'feed' ? 'text-white' : 'text-white/80 hover:text-white'
            }`}
          >
            <svg className="w-[26px] h-[26px]" viewBox="0 0 24 24" fill="none">
              <path
                d="M4.5 10.2C4.5 9.35 4.88 8.54 5.54 8L10.54 3.9C11.39 3.2 12.61 3.2 13.46 3.9L18.46 8C19.12 8.54 19.5 9.35 19.5 10.2V18.2C19.5 19.47 18.47 20.5 17.2 20.5H6.8C5.53 20.5 4.5 19.47 4.5 18.2V10.2Z"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 11.5V15.5"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[11px] font-extrabold tracking-tight leading-none">
              {t.home}
            </span>
          </button>

          {/* 2. Global */}
          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            className={`flex flex-col items-center justify-center gap-1 py-1 transition active:scale-95 ${
              activeTab === 'explore' ? 'text-white' : 'text-white/80 hover:text-white'
            }`}
            title="Global"
          >
            <Globe className="w-[26px] h-[26px]" strokeWidth={2.2} />
            <span className="text-[11px] font-extrabold tracking-tight leading-none">
              {t.global || 'Global'}
            </span>
          </button>

          {/* 3. Center Plus Button (+) */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center py-1 group active:scale-90 transition-transform"
            title="Créer une vidéo"
          >
            <div className="relative w-[52px] h-[35px] flex items-center justify-center">
              {/* Cyan layer offset left -> changed to blue */}
              <div className="absolute inset-y-0 left-0 right-1.5 bg-[#2563eb] rounded-[13px]" />
              {/* Pink/Red layer offset right -> changed to emerald */}
              <div className="absolute inset-y-0 left-1.5 right-0 bg-[#22c55e] rounded-[13px]" />
              {/* White center capsule */}
              <div className="relative w-[43px] h-full bg-white rounded-[12px] flex items-center justify-center text-black shadow-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5.5V18.5M5.5 12H18.5"
                    stroke="#000000"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </button>

          {/* 4. Messages */}
          <button
            type="button"
            onClick={() => setActiveTab('inbox')}
            className={`relative flex flex-col items-center justify-center gap-1 py-1 transition active:scale-95 ${
              activeTab === 'inbox' ? 'text-white' : 'text-white/80 hover:text-white'
            }`}
          >
            <div className="relative">
              <svg className="w-[26px] h-[26px]" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 9.5C4 5.91 6.91 3 10.5 3H13.5C17.09 3 20 5.91 20 9.5V11.5C20 15.09 17.09 18 13.5 18H11.2L7.6 20.7C6.94 21.2 6 20.73 6 19.9V17.35C4.76 16.05 4 14.28 4 12.3V9.5Z"
                  fill="currentColor"
                />
                <path
                  d="M9.5 10.5H14.5"
                  stroke="#000000"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              {notifications.some((n) => !n.read) && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#FE2C55] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-black">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </div>
            <span className="text-[11px] font-extrabold tracking-tight leading-none">
              {t.inbox}
            </span>
          </button>

          {/* 5. Profil (Shows pulsing LIVE signal on avatar when user is in LIVE) */}
          <button
            type="button"
            onClick={() => {
              setViewedProfileUserId(null);
              setActiveTab('profile');
            }}
            className={`relative flex flex-col items-center justify-center gap-1 py-1 transition active:scale-95 ${
              activeTab === 'profile' ? 'text-white' : 'text-white/80 hover:text-white'
            }`}
          >
            {currentUser ? (
              <div className="relative">
                {isUserLive && (
                  <span className="absolute -inset-1 rounded-full border border-[#FE2C55] animate-ping opacity-75 pointer-events-none" />
                )}
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className={`w-[26px] h-[26px] rounded-full object-cover ${
                    isUserLive
                      ? 'border-2 border-[#FE2C55] shadow-[0_0_8px_rgba(254,44,85,0.9)] animate-pulse'
                      : 'border border-white/20'
                  }`}
                />
              </div>
            ) : (
              <svg className="w-[26px] h-[26px]" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="7.2" r="3.6" stroke="currentColor" strokeWidth="2.3" />
                <path
                  d="M5 19.2C5 16.1 7.8 14 12 14C16.2 14 19 16.1 19 19.2C19 19.9 18.4 20.5 17.7 20.5H6.3C5.6 20.5 5 19.9 5 19.2Z"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <span className="text-[11px] font-extrabold tracking-tight leading-none">
              {t.profile}
            </span>
          </button>
        </div>
        )}

        {/* DRAWERS & MODALS */}

        {/* Visual Filter Drawer */}
        {activeFilterVideo && (
          <FilterSelectorDrawer
            currentFilter={activeFilterVideo.filter}
            onSelect={handleApplyFilter}
            onClose={() => setActiveFilterVideo(null)}
          />
        )}

        {/* Comments Modal */}
        {activeCommentVideo && (
          <CommentsModal
            video={activeCommentVideo}
            comments={commentsMap[activeCommentVideo.id] || []}
            currentUser={currentUser}
            onClose={() => setActiveCommentVideo(null)}
            onAddComment={handleAddComment}
            onLikeComment={handleLikeComment}
          />
        )}

        {/* Share Modal */}
        {activeShareVideo && (
          <ShareModal
            video={activeShareVideo}
            isReposted={repostedVideoIds.includes(activeShareVideo.id)}
            onRepostVideo={handleRepostVideo}
            onOpenVideoAnalytics={(vid) => handleOpenAnalytics(vid)}
            onClose={() => setActiveShareVideo(null)}
          />
        )}

        {/* TokVibe LIVE Stream & Gift Shop Modal (Public Broadcast + Mastercard & Visa Checkout) */}
        {isLiveOpen && (
          <LiveStreamModal
            currentUser={currentUser}
            liveChannels={liveChannels}
            initialHostId={activeLiveHostId}
            isCurrentUserLive={isUserLive}
            onStartUserLive={handleStartUserLive}
            onStopUserLive={handleStopUserLive}
            onDiscoverMoreLives={handleDiscoverMoreLives}
            followedAuthorIds={followedAuthorIds}
            onToggleFollow={handleToggleFollow}
            onClose={() => setIsLiveOpen(false)}
          />
        )}

        {/* Firebase Google / Apple Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(profile) => {
            setCurrentUser(profile);
            setIsAuthModalOpen(false);
          }}
        />

        {/* Creator Studio, Per-Video Statistics, Profile Visitors & Ad Monetization Modal */}
        {isCreatorStudioOpen && currentUser && (
          <CreatorStudioModal
            analytics={analytics}
            myVideos={videos.filter((v) => v.authorId === currentUser.uid)}
            allVideos={videos}
            currentUser={currentUser}
            followedAuthorIds={followedAuthorIds}
            onToggleFollow={handleToggleFollow}
            initialTab={studioInitialTab}
            initialSubTab={studioInitialSubTab}
            initialVideo={studioInitialVideo}
            onClose={() => setIsCreatorStudioOpen(false)}
            onWithdraw={handleWithdraw}
          />
        )}

        {/* Privacy Settings Modal (with Biometric Security, Front Camera Face ID & Immediate App Lock) */}
        {isPrivacyOpen && currentUser && (
          <PrivacySettingsModal
            currentUser={currentUser}
            onClose={() => setIsPrivacyOpen(false)}
            onUpdatePrivacy={(updated) => {
              setCurrentUser({ ...currentUser, ...updated });
            }}
            onLockAppImmediately={() => {
              setIsPrivacyOpen(false);
              setIsSettingsOpen(false);
              try {
                localStorage.setItem('tokvibe_app_locked', 'true');
              } catch {}
              setIsAppLocked(true);
            }}
          />
        )}

        {/* App Settings Modal (Dark Mode, AI Recommender, Languages, Verification, Profile Tools) */}
        {isSettingsOpen && (
          <SettingsModal
            currentTheme={themeMode}
            currentAccent={accentColor}
            currentLanguage={currentLang}
            aiPrefs={aiPrefs}
            autoplayEnabled={autoplayEnabled}
            currentUser={currentUser}
            onUpdateTheme={(t) => setThemeMode(t)}
            onUpdateAccent={(a) => setAccentColor(a)}
            onUpdateLanguage={(l) => setCurrentLang(l)}
            onUpdateAiPrefs={(p) => setAiPrefs(p)}
            onToggleAutoplay={(v) => setAutoplayEnabled(v)}
            onToggleVerification={(verified) => {
              if (currentUser) {
                setCurrentUser({ ...currentUser, isVerified: verified });
                setVideos((prev) =>
                  prev.map((v) =>
                    v.authorId === currentUser.uid
                      ? { ...v, authorVerified: verified }
                      : v
                  )
                );
              }
            }}
            onOpenProfileVisitors={handleOpenProfileVisitors}
            onOpenVideoAnalytics={() => handleOpenAnalytics()}
            onOpenCreatorStudio={() => {
              setStudioInitialTab('monetization');
              setIsCreatorStudioOpen(true);
            }}
            onOpenStudioEditor={handleOpenCreateModal}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
            onLockAppImmediately={() => {
              setIsSettingsOpen(false);
              setIsPrivacyOpen(false);
              try {
                localStorage.setItem('tokvibe_app_locked', 'true');
              } catch {}
              setIsAppLocked(true);
            }}
            onOpenLive={() => handleOpenLiveChannel(currentUser?.uid)}
            onLogout={async () => {
              await logoutUser();
              setCurrentUser(null);
            }}
            onUpdateProfile={(updated) => {
              if (currentUser) {
                const newUser = { ...currentUser, ...updated };
                setCurrentUser(newUser);
                if (updated.isVerified !== undefined) {
                  setVideos((prev) =>
                    prev.map((v) =>
                      v.authorId === currentUser.uid
                        ? { ...v, authorVerified: updated.isVerified }
                        : v
                    )
                  );
                }
              }
            }}
            onReplaySplash={() => setShowSplash(true)}
            onClose={() => setIsSettingsOpen(false)}
            powerSavingMode={powerSavingMode}
            onTogglePowerSaving={(enabled) => setPowerSavingMode(enabled)}
            prolongedSessionThresholdMins={prolongedThresholdMins}
            onUpdateProlongedThreshold={(mins) => setProlongedThresholdMins(mins)}
            sessionWatchMinutes={sessionWatchMinutes}
            isAiPausedByPowerSave={isAiPausedByPowerSave}
            onSimulateProlongedSession={() =>
              setSessionWatchMinutes(Math.max(prolongedThresholdMins || 15, 15))
            }
          />
        )}

        {/* Create / Upload Video Modal */}
        {isCreateOpen && (
          <CreateVideoModal
            currentUser={currentUser}
            initialChallenge={selectedChallengeForCreate}
            onClose={() => {
              setIsCreateOpen(false);
              setSelectedChallengeForCreate(null);
            }}
            onPublish={(v) => {
              handlePublishVideo(v);
              setSelectedChallengeForCreate(null);
            }}
            onOpenLive={() => {
              setIsCreateOpen(false);
              handleOpenLiveChannel(currentUser?.uid);
            }}
          />
        )}

        {/* 24-Hour Edit / Delete Video Modal */}
        {editingVideo && (
          <EditVideoModal
            video={editingVideo}
            onClose={() => setEditingVideo(null)}
            onSaveEdit={(updated) => {
              setVideos((prev) =>
                prev.map((v) => (v.id === updated.id ? { ...v, ...updated } : v))
              );
            }}
            onDeleteVideo={(videoId) => {
              setVideos((prev) => prev.filter((v) => v.id !== videoId));
              setEditingVideo(null);
            }}
          />
        )}

        {/* Unfollow Confirmation Dialog Modal */}
        {pendingUnfollowCreator && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setPendingUnfollowCreator(null)}
          >
            <div
              className="relative w-full max-w-xs bg-zinc-950 border border-white/15 rounded-3xl p-6 text-center shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle top ambient glow */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

              {/* Creator Avatar with Abonné indicator */}
              <div className="relative w-16 h-16 mx-auto mb-3">
                <img
                  src={pendingUnfollowCreator.authorAvatar}
                  alt={pendingUnfollowCreator.authorName}
                  className="w-full h-full rounded-full object-cover border-2 border-white/20 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center border-2 border-zinc-950 shadow-md">
                  <UserMinus className="w-3.5 h-3.5" />
                </div>
              </div>

              <h3 className="text-base font-black text-white">
                Se désabonner de @{pendingUnfollowCreator.authorHandle} ?
              </h3>
              <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
                Vous êtes actuellement <span className="text-[#60a5fa] font-bold">Abonné</span> à{' '}
                <span className="inline-flex items-center gap-1.5 flex-wrap">
                  <strong className="text-white">{pendingUnfollowCreator.authorName}</strong>
                  {videos.find(v => v.authorId === pendingUnfollowCreator.authorId)?.authorVerified && (
                    <span
                      className="inline-flex items-center justify-center w-3 h-3 rounded-full"
                      style={{
                        background: 'radial-gradient(circle at 35% 35%, #86efac 0%, #22c55e 55%, #15803d 100%)',
                      }}
                    >
                      <Check className="w-2 h-2 stroke-[4] text-black" />
                    </span>
                  )}
                </span>
                . Ses vidéos n&apos;apparaîtront plus dans votre flux Abonnements.
              </p>

              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleConfirmUnfollow}
                  className="w-full py-2.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs transition active:scale-95 shadow-lg shadow-rose-500/20"
                >
                  Se désabonner
                </button>
                <button
                  type="button"
                  onClick={() => setPendingUnfollowCreator(null)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-[#2563eb] hover:bg-blue-500 text-white font-bold text-xs border border-blue-400/40 transition active:scale-95 flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(37,99,235,0.5)]"
                >
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Rester abonné</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Stories Viewer Modal */}
        {activeStoryId && (
          <StoriesModal
            stories={stories}
            initialStoryId={activeStoryId}
            onClose={() => setActiveStoryId(null)}
          />
        )}
        {/* Age Verification Mandatory Onboarding */}
        {currentUser && !currentUser.onboardingCompleted && (
          <AgeVerificationModal
            currentUser={currentUser}
            onComplete={handleAgeVerificationComplete}
            onLogout={async () => {
              await logoutUser();
              setCurrentUser(null);
            }}
          />
        )}

        {/* Full-Screen Biometric & Face ID App Lock Overlay */}
        {isAppLocked && (
          <BiometricAppLockModal
            currentUser={currentUser}
            onUnlock={() => {
              try {
                localStorage.setItem('tokvibe_app_locked', 'false');
              } catch {}
              setIsAppLocked(false);
            }}
          />
        )}
      </div>
    </div>
  );
}


