import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Heart,
  Send,
  Gift,
  CreditCard,
  Users,
  Check,
  Plus,
  ShieldCheck,
  Lock,
  Radio,
  Coins,
  ChevronRight,
  ChevronLeft,
  Globe,
  Video,
  StopCircle,
  RefreshCw,
  UserPlus,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';

export interface LiveGiftItem {
  id: string;
  name: string;
  emoji: string;
  coins: number;
  priceEur: number;
  tier: 'basic' | 'premium' | 'luxury';
  color: string;
}

export interface CoinPack {
  id: string;
  coins: number;
  bonusCoins: number;
  priceEur: number;
  popular?: boolean;
}

export interface LiveChannel {
  id: string;
  hostId: string;
  hostName: string;
  hostHandle: string;
  hostAvatar: string;
  hostVerified: boolean;
  title: string;
  category: string;
  viewersCount: number;
  likesCount: number;
  videoUrl: string;
  goalLabel: string;
  goalCurrent: number;
  goalTarget: number;
  isPublic?: boolean;
}

interface LiveChatMessage {
  id: string;
  user: string;
  avatar: string;
  text: string;
  isGift?: boolean;
  giftEmoji?: string;
  giftName?: string;
  isSystem?: boolean;
}

interface SavedCard {
  id: string;
  brand: 'mastercard' | 'visa';
  last4: string;
  holder: string;
  expiry: string;
}

export const LIVE_GIFTS: LiveGiftItem[] = [
  {
    id: 'gift-rose',
    name: 'Rose',
    emoji: '🌹',
    coins: 1,
    priceEur: 0.49,
    tier: 'basic',
    color: 'from-rose-500/30 to-pink-600/30 border-rose-400/50',
  },
  {
    id: 'gift-heart',
    name: 'Cœur TokVibe',
    emoji: '💚',
    coins: 10,
    priceEur: 0.99,
    tier: 'basic',
    color: 'from-emerald-500/30 to-green-600/30 border-emerald-400/50',
  },
  {
    id: 'gift-confetti',
    name: 'Pluie de Fête',
    emoji: '🎉',
    coins: 30,
    priceEur: 1.99,
    tier: 'basic',
    color: 'from-cyan-500/30 to-blue-600/30 border-cyan-400/50',
  },
  {
    id: 'gift-crown',
    name: 'Couronne Royale',
    emoji: '👑',
    coins: 99,
    priceEur: 4.99,
    tier: 'premium',
    color: 'from-amber-500/35 to-yellow-600/35 border-amber-400/60',
  },
  {
    id: 'gift-diamond',
    name: 'Diamant Émeraude',
    emoji: '💎',
    coins: 299,
    priceEur: 9.99,
    tier: 'premium',
    color: 'from-teal-400/35 to-emerald-600/35 border-teal-300/60',
  },
  {
    id: 'gift-supercar',
    name: 'Supercar Néon',
    emoji: '🏎️',
    coins: 999,
    priceEur: 24.99,
    tier: 'luxury',
    color: 'from-purple-500/40 to-pink-600/40 border-purple-400/70',
  },
  {
    id: 'gift-lion',
    name: 'Lion Légendaire',
    emoji: '🦁',
    coins: 2999,
    priceEur: 59.99,
    tier: 'luxury',
    color: 'from-orange-500/40 to-amber-600/40 border-orange-400/70',
  },
  {
    id: 'gift-galaxy',
    name: 'Univers TokVibe',
    emoji: '🌌',
    coins: 5000,
    priceEur: 99.99,
    tier: 'luxury',
    color: 'from-indigo-500/45 via-emerald-500/35 to-cyan-500/45 border-emerald-300/80',
  },
];

export const COIN_PACKS: CoinPack[] = [
  { id: 'pack-70', coins: 70, bonusCoins: 5, priceEur: 0.99 },
  { id: 'pack-350', coins: 350, bonusCoins: 30, priceEur: 4.99, popular: true },
  { id: 'pack-700', coins: 700, bonusCoins: 80, priceEur: 9.99 },
  { id: 'pack-1750', coins: 1750, bonusCoins: 250, priceEur: 24.99 },
  { id: 'pack-3500', coins: 3500, bonusCoins: 600, priceEur: 49.99 },
  { id: 'pack-7000', coins: 7000, bonusCoins: 1500, priceEur: 99.99 },
];

export const DEFAULT_LIVE_CHANNELS: LiveChannel[] = [
  {
    id: 'live-1',
    hostId: 'creator-tokyo',
    hostName: 'Kenji Neon',
    hostHandle: 'tokyo_neon',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    hostVerified: true,
    title: '🔥 En Direct de Tokyo !',
    category: 'Direct Public',
    viewersCount: 2840,
    likesCount: 42900,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dj-playing-music-at-a-nightclub-43442-large.mp4',
    goalLabel: 'Objectif Couronnes 👑',
    goalCurrent: 38,
    goalTarget: 50,
    isPublic: true,
  },
  {
    id: 'live-2',
    hostId: 'creator-dance',
    hostName: 'Mia Dance',
    hostHandle: 'mia_moves',
    hostAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    hostVerified: true,
    title: '💃 Battle Chorégraphie Néon en Direct de Paris',
    category: 'Danse',
    viewersCount: 1920,
    likesCount: 31500,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-dancing-happy-in-a-room-41792-large.mp4',
    goalLabel: 'Objectif Roses 🌹',
    goalCurrent: 84,
    goalTarget: 100,
    isPublic: true,
  },
  {
    id: 'live-3',
    hostId: 'creator-chef',
    hostName: 'Chef Marco',
    hostHandle: 'chef_marco',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    hostVerified: true,
    title: '🍔 Cuisine Street-Food Gourmet Live Q&A',
    category: 'Cuisine',
    viewersCount: 1150,
    likesCount: 18700,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-dish-in-a-restaurant-kitchen-42929-large.mp4',
    goalLabel: 'Objectif Cœurs 💚',
    goalCurrent: 22,
    goalTarget: 30,
    isPublic: true,
  },
  {
    id: 'live-4',
    hostId: 'creator-drone',
    hostName: 'Lucas FPV Drone',
    hostHandle: 'lucasfpv',
    hostAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    hostVerified: true,
    title: '🦅 Vol Drone FPV en Direct au Coucher du Soleil',
    category: 'Nature & Tech',
    viewersCount: 3410,
    likesCount: 54200,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4',
    goalLabel: 'Objectif Supercars 🏎️',
    goalCurrent: 14,
    goalTarget: 20,
    isPublic: true,
  },
  {
    id: 'live-5',
    hostId: 'creator-streetart',
    hostName: 'Maya Neon Art',
    hostHandle: 'mayaneon',
    hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    hostVerified: true,
    title: '🎨 Peinture Fluorescente UV en Direct — Vos Idées !',
    category: 'Art Créatif',
    viewersCount: 1680,
    likesCount: 27400,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-painting-on-canvas-in-her-studio-41698-large.mp4',
    goalLabel: 'Objectif Diamants 💎',
    goalCurrent: 19,
    goalTarget: 25,
    isPublic: true,
  },
  {
    id: 'live-6',
    hostId: 'creator-fitness',
    hostName: 'Yanis Pro Fit',
    hostHandle: 'yanis_pro',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    hostVerified: true,
    title: '⚡ Entraînement Cardio & Défis Abonnés en Direct',
    category: 'Sport & Défis',
    viewersCount: 2290,
    likesCount: 39100,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-training-in-the-gym-23446-large.mp4',
    goalLabel: 'Objectif Lions 🦁',
    goalCurrent: 8,
    goalTarget: 15,
    isPublic: true,
  },
];

export const DISCOVERABLE_LIVE_CHANNELS: LiveChannel[] = [
  {
    id: 'live-discover-1',
    hostId: 'creator-sarah',
    hostName: 'Sarah Studio',
    hostHandle: 'sarah_vibe',
    hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    hostVerified: true,
    title: '🎤 Session Chant Acoustique & Dédicaces Public',
    category: 'Direct Public',
    viewersCount: 4120,
    likesCount: 68400,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-singer-performing-in-a-recording-studio-41764-large.mp4',
    goalLabel: 'Objectif Univers 🌌',
    goalCurrent: 9,
    goalTarget: 15,
    isPublic: true,
  },
  {
    id: 'live-discover-2',
    hostId: 'creator-alex',
    hostName: 'Alex Cyber',
    hostHandle: 'alex_cyber',
    hostAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    hostVerified: true,
    title: '🎮 Setup Gaming & Setup Tour Néon en Direct Public',
    category: 'Gaming & Tech',
    viewersCount: 2780,
    likesCount: 45200,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-gamer-playing-video-games-in-a-neon-lit-room-42466-large.mp4',
    goalLabel: 'Objectif Couronnes 👑',
    goalCurrent: 41,
    goalTarget: 50,
    isPublic: true,
  },
  {
    id: 'live-discover-3',
    hostId: 'creator-amina',
    hostName: 'Amina Paris',
    hostHandle: 'amina_paris',
    hostAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    hostVerified: true,
    title: '✨ Rooftop Paris By Night & Discussion Ouverte à Tous',
    category: 'Lifestyle',
    viewersCount: 3190,
    likesCount: 51800,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-taking-a-selfie-video-at-night-41578-large.mp4',
    goalLabel: 'Objectif Roses 🌹',
    goalCurrent: 67,
    goalTarget: 100,
    isPublic: true,
  },
];

// Authentic Mastercard SVG Emblem
export const MastercardLogo: React.FC<{ className?: string }> = ({ className = 'w-9 h-6' }) => (
  <svg className={className} viewBox="0 0 48 32" fill="none">
    <rect width="48" height="32" rx="6" fill="#18181B" />
    <circle cx="19" cy="16" r="9.5" fill="#EB001B" />
    <circle cx="29" cy="16" r="9.5" fill="#F79E1B" />
    <path
      d="M24 8.55A9.47 9.47 0 0 0 20.5 16c0 3.01 1.4 5.7 3.5 7.45A9.47 9.47 0 0 0 27.5 16c0-3.01-1.4-5.7-3.5-7.45Z"
      fill="#FF5F00"
    />
  </svg>
);

// Authentic Visa SVG Emblem
export const VisaLogo: React.FC<{ className?: string }> = ({ className = 'w-9 h-6' }) => (
  <svg className={className} viewBox="0 0 48 32" fill="none">
    <rect width="48" height="32" rx="6" fill="#1A1F71" />
    <path
      d="M19.8 21.5L21.9 10.5H25.3L23.2 21.5H19.8ZM34.5 10.8C33.8 10.5 32.7 10.2 31.3 10.2C27.8 10.2 25.3 12 25.3 14.5C25.3 16.4 27 17.4 28.3 18C29.6 18.6 30.1 19 30.1 19.6C30.1 20.5 29 20.9 28 20.9C26.6 20.9 25.8 20.7 24.7 20.2L24.2 20L23.7 22.9C24.6 23.3 26.2 23.6 27.9 23.6C31.6 23.6 34 21.8 34 19.1C34 17.6 33.1 16.5 31.1 15.6C29.9 15 29.2 14.6 29.2 14C29.2 13.4 29.9 12.8 31.2 12.8C32.3 12.8 33.2 13 33.9 13.3L34.2 13.5L34.5 10.8ZM43.2 10.5H40.5C39.6 10.5 39 10.8 38.6 11.7L33.4 21.5H37.1L37.8 19.5H42.3L42.7 21.5H46L43.2 10.5ZM38.9 16.9L40.7 12.2L41.7 16.9H38.9ZM16.8 10.5L13.3 18L12.9 16.1C12.3 14 10.3 11.8 8.1 10.7L11.3 21.5H15L20.5 10.5H16.8Z"
      fill="#FFFFFF"
    />
    <path
      d="M10.1 10.5H4.4L4.3 10.8C8.7 11.9 11.6 14.6 12.8 17.8L11.6 11.7C11.4 10.8 10.8 10.5 10.1 10.5Z"
      fill="#F7B600"
    />
  </svg>
);

interface LiveStreamModalProps {
  currentUser: UserProfile | null;
  liveChannels: LiveChannel[];
  initialHostId?: string | null;
  isCurrentUserLive: boolean;
  onStartUserLive: (title: string) => void;
  onStopUserLive: () => void;
  onDiscoverMoreLives?: () => void;
  followedAuthorIds: string[];
  onToggleFollow: (authorId: string) => void;
  onClose: () => void;
}

export const LiveStreamModal: React.FC<LiveStreamModalProps> = ({
  currentUser,
  liveChannels,
  initialHostId,
  isCurrentUserLive,
  onStartUserLive,
  onStopUserLive,
  onDiscoverMoreLives,
  followedAuthorIds,
  onToggleFollow,
  onClose,
}) => {
  const channels = (liveChannels.length > 0 ? liveChannels : DEFAULT_LIVE_CHANNELS).map((c) => ({
    ...c,
    isPublic: true,
  }));

  const [activeChannelIndex, setActiveChannelIndex] = useState(() => {
    if (initialHostId) {
      const idx = channels.findIndex((c) => c.hostId === initialHostId);
      if (idx !== -1) return idx;
    }
    return 0;
  });
  const [isLiveListDrawerOpen, setIsLiveListDrawerOpen] = useState(false);
  const [discoveryBanner, setDiscoveryBanner] = useState<string | null>(null);

  // Ensure index stays valid when channels list changes
  const safeIndex = activeChannelIndex < channels.length ? activeChannelIndex : 0;
  const channel = channels[safeIndex];
  const isMyChannel = currentUser ? channel.hostId === currentUser.uid : false;
  const isFollowing = followedAuthorIds.includes(channel.hostId);

  // Switch to user's own channel or selected host automatically
  useEffect(() => {
    if (initialHostId) {
      const idx = channels.findIndex((c) => c.hostId === initialHostId);
      if (idx !== -1) {
        setActiveChannelIndex(idx);
        setTimeout(() => {
          if (liveFeedContainerRef.current) {
            const height = liveFeedContainerRef.current.clientHeight;
            liveFeedContainerRef.current.scrollTo({
              top: idx * height,
              behavior: 'smooth',
            });
          }
        }, 60);
      }
    }
  }, [initialHostId]);

  // Go Live setup modal state
  const [isGoLiveSetupOpen, setIsGoLiveSetupOpen] = useState(false);
  const [customLiveTitle, setCustomLiveTitle] = useState(
    `🔴 Direct Public de @${currentUser?.handle || 'mon_tokvibe'} sur TokVibe !`
  );
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);

  // Webcam stream ref if broadcasting own live
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraStream, setHasCameraStream] = useState(false);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    // We want the camera preview even BEFORE going live (during setup)
    if ((isGoLiveSetupOpen || (isMyChannel && isCurrentUserLive)) && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ 
          video: { facingMode: facingMode }, 
          audio: false 
        })
        .then((stream) => {
          activeStream = stream;
          setHasCameraStream(true);
          if (cameraVideoRef.current) {
            cameraVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Camera access denied:', err);
          setHasCameraStream(false);
        });
    } else {
      setHasCameraStream(false);
    }
    
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isMyChannel, isCurrentUserLive, isGoLiveSetupOpen, facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleStartCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCountingDown(true);
    let count = 3;
    setCountdown(count);
    
    const timer = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(timer);
        handleLaunchPublicLive();
      }
    }, 1000);
  };

  const handleLaunchPublicLive = () => {
    onStartUserLive(customLiveTitle.trim() || '🔴 En Direct Public sur TokVibe !');
    setIsGoLiveSetupOpen(false);
    setIsCountingDown(false);
    scrollToLiveChannel(0);
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { x: 0.5, y: 0.4 },
      colors: ['#FE2C55', '#22c55e', '#25F4EE', '#ffffff'],
    });
  };

  const handleInviteUser = (userId: string) => {
    if (invitedUsers.includes(userId)) return;
    setInvitedUsers(prev => [...prev, userId]);
    // Simulation of invitation sending
    const userName = userId.replace('creator-', '');
    setMessages(prev => [
      ...prev,
      {
        id: 'invite-' + Date.now(),
        user: 'Système',
        avatar: '/logo.png',
        text: `Invitation envoyée à @${userName}`,
        isSystem: true,
      }
    ]);
  };

  // Live stats & coins
  const [coinsBalance, setCoinsBalance] = useState<number>(120);
  const [liveLikes, setLiveLikes] = useState<number>(channel.likesCount);
  const [liveViewers, setLiveViewers] = useState<number>(channel.viewersCount);
  const [goalProgress, setGoalProgress] = useState<number>(channel.goalCurrent);

  // Drawers: Gift shop & Card checkout
  const [isGiftDrawerOpen, setIsGiftDrawerOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<LiveGiftItem>(LIVE_GIFTS[0]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'direct_gift' | 'coin_pack'>('direct_gift');
  const [selectedCoinPack, setSelectedCoinPack] = useState<CoinPack>(COIN_PACKS[1]);

  // Saved Visa & Mastercard cards
  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    {
      id: 'card-mc-1',
      brand: 'mastercard',
      last4: '5489',
      holder: currentUser?.displayName?.toUpperCase() || 'MON COMPTE TOKVIBE',
      expiry: '09/28',
    },
    {
      id: 'card-visa-1',
      brand: 'visa',
      last4: '4242',
      holder: currentUser?.displayName?.toUpperCase() || 'MON COMPTE TOKVIBE',
      expiry: '11/27',
    },
  ]);
  const [selectedCardId, setSelectedCardId] = useState<string>('card-mc-1');
  const [isAddingNewCard, setIsAddingNewCard] = useState(false);

  // New card form state
  const [cardBrand, setCardBrand] = useState<'mastercard' | 'visa'>('mastercard');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(currentUser?.displayName || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCardForLater, setSaveCardForLater] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessBanner, setPaymentSuccessBanner] = useState<string | null>(null);

  // Active gift animation banner on the LIVE screen
  const [activeGiftBanner, setActiveGiftBanner] = useState<{
    id: number;
    senderName: string;
    senderAvatar: string;
    gift: LiveGiftItem;
    combo: number;
  } | null>(null);

  // Floating tap hearts
  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; left: number; color: string }>>([]);

  // Chat messages
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<LiveChatMessage[]>([
    {
      id: 'm-1',
      user: 'sarah_vibe',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      text: 'Incroyable ce LIVE public sur TokVibe 🔥🔥🔥',
    },
    {
      id: 'm-2',
      user: 'lucas_92',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      text: 'a envoyé une Rose',
      isGift: true,
      giftEmoji: '🌹',
      giftName: 'Rose',
    },
    {
      id: 'm-3',
      user: 'amina_paris',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      text: 'J’ai vu le signal LIVE sur ta photo de profil ! 💚',
    },
    {
      id: 'm-4',
      user: 'yanis_pro',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      text: 'vient de rejoindre le LIVE 👋',
      isSystem: true,
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);
  const liveFeedContainerRef = useRef<HTMLDivElement | null>(null);

  const handleTriggerDiscoverMoreLives = () => {
    if (onDiscoverMoreLives) {
      onDiscoverMoreLives();
      setDiscoveryBanner('✨ Nouveaux LIVEs publics chargés ! Défilez vers le bas');
      setTimeout(() => setDiscoveryBanner(null), 2600);
    }
  };

  const scrollToLiveChannel = (index: number) => {
    if (index >= channels.length) {
      handleTriggerDiscoverMoreLives();
      const nextIdx = channels.length - 1;
      setActiveChannelIndex(nextIdx);
      return;
    }
    const clamped = Math.max(0, Math.min(index, channels.length - 1));
    if (liveFeedContainerRef.current) {
      const height = liveFeedContainerRef.current.clientHeight;
      liveFeedContainerRef.current.scrollTo({
        top: clamped * height,
        behavior: 'smooth',
      });
    }
    setActiveChannelIndex(clamped);
  };

  const handleLiveScroll = () => {
    if (!liveFeedContainerRef.current) return;
    const { scrollTop, clientHeight, scrollHeight } = liveFeedContainerRef.current;
    if (clientHeight > 0) {
      const idx = Math.round(scrollTop / clientHeight);
      if (idx !== safeIndex && idx >= 0 && idx < channels.length) {
        setActiveChannelIndex(idx);
      }
      // When user scrolls near the bottom of the LIVE list, automatically discover new public lives
      if (scrollTop + clientHeight >= scrollHeight - 20 && channels.length < 18) {
        if (onDiscoverMoreLives) {
          onDiscoverMoreLives();
        }
      }
    }
  };

  const touchStartYRef = useRef<number | null>(null);

  const handleLiveTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleLiveTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartYRef.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartYRef.current = null;

    if (Math.abs(deltaY) > 40) {
      if (deltaY < 0) {
        // Swipe Up -> Next LIVE
        if (safeIndex < channels.length - 1) {
          scrollToLiveChannel(safeIndex + 1);
        } else {
          handleTriggerDiscoverMoreLives();
          scrollToLiveChannel(safeIndex + 1);
        }
      } else {
        // Swipe Down -> Previous LIVE
        if (safeIndex > 0) {
          scrollToLiveChannel(safeIndex - 1);
        }
      }
    }
  };

  // Sync stats when switching live channel
  useEffect(() => {
    setLiveLikes(channel.likesCount);
    setLiveViewers(channel.viewersCount);
    setGoalProgress(channel.goalCurrent);
  }, [safeIndex, channel]);

  // Simulate incoming live comments & viewer count fluctuations
  useEffect(() => {
    const sampleViewers = [
      { user: 'mehdi_k', text: 'Le signal LIVE sur ton profil est trop stylé ! 🔴💚', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
      { user: 'chloe_star', text: 'On envoie des cadeaux pour atteindre l’objectif ! 🎁', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100' },
      { user: 'enzo_mtl', text: 'Tout TokVibe est connecté sur ce direct 🔥', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
      { user: 'nina_danse', text: 'a envoyé Cœur TokVibe', isGift: true, giftEmoji: '💚', giftName: 'Cœur TokVibe', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    ];

    const interval = window.setInterval(() => {
      const pick = sampleViewers[Math.floor(Math.random() * sampleViewers.length)];
      setMessages((prev) => [
        ...prev.slice(-24),
        {
          id: 'sim-' + Date.now(),
          user: pick.user,
          avatar: pick.avatar,
          text: pick.text,
          isGift: pick.isGift,
          giftEmoji: pick.giftEmoji,
          giftName: pick.giftName,
        },
      ]);
      setLiveViewers((v) => v + Math.floor(Math.random() * 8) - 2);
      setLiveLikes((l) => l + Math.floor(Math.random() * 18) + 3);
    }, 3600);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const spawnFloatingHeart = () => {
    const colors = ['#22c55e', '#FE2C55', '#25F4EE', '#facc15', '#ec4899'];
    const newHeart = {
      id: Date.now() + Math.random(),
      left: 55 + Math.random() * 35,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    setLiveLikes((prev) => prev + 1);
    setFloatingHearts((prev) => [...prev.slice(-14), newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1400);
  };

  const triggerGiftCelebration = (gift: LiveGiftItem, paidMethodLabel?: string) => {
    setGoalProgress((prev) => Math.min(channel.goalTarget, prev + 1));
    setLiveLikes((prev) => prev + gift.coins * 5);

    setMessages((prev) => [
      ...prev,
      {
        id: 'gift-' + Date.now(),
        user: currentUser?.handle || 'mon_tikflow',
        avatar: currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        text: paidMethodLabel
          ? `a offert ${gift.name} (${paidMethodLabel})`
          : `a envoyé ${gift.name}`,
        isGift: true,
        giftEmoji: gift.emoji,
        giftName: gift.name,
      },
    ]);

    setActiveGiftBanner((prev) => ({
      id: Date.now(),
      senderName: currentUser?.displayName || 'Mon Compte',
      senderAvatar: currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      gift,
      combo: prev && prev.gift.id === gift.id ? prev.combo + 1 : 1,
    }));

    confetti({
      particleCount: gift.tier === 'luxury' ? 95 : gift.tier === 'premium' ? 60 : 35,
      spread: 80,
      origin: { x: 0.5, y: 0.55 },
      colors: ['#22c55e', '#facc15', '#FE2C55', '#25F4EE', '#ffffff'],
    });

    setTimeout(() => {
      setActiveGiftBanner(null);
    }, 3800);
  };

  const handleSendGiftWithCoins = (gift: LiveGiftItem) => {
    if (coinsBalance >= gift.coins) {
      setCoinsBalance((prev) => prev - gift.coins);
      triggerGiftCelebration(gift);
      setIsGiftDrawerOpen(false);
    } else {
      setSelectedGift(gift);
      setPaymentMode('direct_gift');
      setIsPaymentModalOpen(true);
    }
  };

  const handleOpenCardCheckoutForGift = (gift: LiveGiftItem) => {
    setSelectedGift(gift);
    setPaymentMode('direct_gift');
    setIsPaymentModalOpen(true);
  };

  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    if (digits.startsWith('4')) {
      setCardBrand('visa');
    } else if (digits.startsWith('5') || digits.startsWith('2')) {
      setCardBrand('mastercard');
    }
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setCardExpiry(digits);
    }
  };

  const fillDemoCard = (brand: 'mastercard' | 'visa') => {
    setCardBrand(brand);
    setCardNumber(brand === 'mastercard' ? '5412 7589 3412 8890' : '4532 8910 2345 4242');
    setCardHolder(currentUser?.displayName?.toUpperCase() || 'ADAM LORGEAT');
    setCardExpiry('08/29');
    setCardCvv('842');
  };

  const handleConfirmCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    setTimeout(() => {
      let usedBrandLabel = 'Mastercard';
      let usedLast4 = '5489';

      if (isAddingNewCard || savedCards.length === 0) {
        const cleanDigits = cardNumber.replace(/\D/g, '');
        usedLast4 = cleanDigits.slice(-4) || (cardBrand === 'mastercard' ? '8890' : '4242');
        usedBrandLabel = cardBrand === 'mastercard' ? 'Mastercard' : 'Visa';

        if (saveCardForLater) {
          const newCard: SavedCard = {
            id: 'card-' + Date.now(),
            brand: cardBrand,
            last4: usedLast4,
            holder: (cardHolder || 'CLIENT TOKVIBE').toUpperCase(),
            expiry: cardExpiry || '12/28',
          };
          setSavedCards((prev) => [newCard, ...prev]);
          setSelectedCardId(newCard.id);
        }
        setIsAddingNewCard(false);
      } else {
        const chosen = savedCards.find((c) => c.id === selectedCardId) || savedCards[0];
        usedBrandLabel = chosen.brand === 'mastercard' ? 'Mastercard' : 'Visa';
        usedLast4 = chosen.last4;
      }

      setIsProcessingPayment(false);
      setIsPaymentModalOpen(false);

      if (paymentMode === 'direct_gift') {
        setIsGiftDrawerOpen(false);
        triggerGiftCelebration(selectedGift, `${usedBrandLabel} •••• ${usedLast4}`);
        setPaymentSuccessBanner(
          `Paiement ${selectedGift.priceEur.toFixed(2).replace('.', ',')} € accepté (${usedBrandLabel} •••• ${usedLast4}) — ${selectedGift.emoji} ${selectedGift.name} envoyé !`
        );
      } else {
        const totalAdded = selectedCoinPack.coins + selectedCoinPack.bonusCoins;
        setCoinsBalance((prev) => prev + totalAdded);
        confetti({
          particleCount: 55,
          spread: 70,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#22c55e', '#facc15', '#ffffff'],
        });
        setPaymentSuccessBanner(
          `+${totalAdded} Pièces rechargées avec ${usedBrandLabel} •••• ${usedLast4} (${selectedCoinPack.priceEur.toFixed(2).replace('.', ',')} €)`
        );
      }

      setTimeout(() => {
        setPaymentSuccessBanner(null);
      }, 4500);
    }, 900);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: 'usr-' + Date.now(),
        user: currentUser?.handle || 'mon_tikflow',
        avatar: currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        text: chatInput.trim(),
      },
    ]);
    setChatInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white select-none">
      <div className="relative w-full max-w-md h-full max-h-[100dvh] bg-black overflow-hidden flex flex-col">
        {/* SINGLE VERTICAL SCROLLABLE LIST OF ALL PUBLIC LIVE STREAMS (Snap Scroll like TokVibe LIVE) */}
        <div
          ref={liveFeedContainerRef}
          onScroll={handleLiveScroll}
          onTouchStart={handleLiveTouchStart}
          onTouchEnd={handleLiveTouchEnd}
          className="absolute inset-0 w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar z-0"
          style={{ scrollSnapType: 'y mandatory', overscrollBehaviorY: 'contain' }}
        >
          {channels.map((ch, idx) => {
            const isActiveSlide = idx === safeIndex;
            const isHostMe = currentUser ? ch.hostId === currentUser.uid : false;
            return (
              <div
                key={ch.id}
                onClick={spawnFloatingHeart}
                className="w-full h-full snap-start snap-always shrink-0 relative overflow-hidden cursor-pointer"
                title="Tapez pour aimer"
              >
                {isHostMe && isCurrentUserLive && hasCameraStream && isActiveSlide ? (
                  <video
                    ref={cameraVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                  />
                ) : (
                  <video
                    src={ch.videoUrl}
                    autoPlay={isActiveSlide}
                    loop
                    playsInline
                    muted={!isActiveSlide}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/85 pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* Left Quick Vertical Scroll Up/Down Buttons for the Single LIVE List */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5 pointer-events-auto opacity-75 hover:opacity-100 transition">
          <button
            type="button"
            disabled={safeIndex === 0}
            onClick={() => scrollToLiveChannel(safeIndex - 1)}
            className="w-7 h-7 rounded-full bg-black/65 backdrop-blur-md border border-white/20 flex items-center justify-center text-[10px] text-white disabled:opacity-20 active:scale-90"
            title="LIVE précédent (Défiler vers le haut)"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => setIsLiveListDrawerOpen(true)}
            className="px-1.5 py-1 rounded-full bg-[#FE2C55]/90 border border-white/25 text-[9px] font-black text-center text-white shadow-md"
            title="Voir la liste complète des LIVEs publics"
          >
            {safeIndex + 1}/{channels.length}
          </button>
          <button
            type="button"
            onClick={() => {
              if (safeIndex >= channels.length - 1) {
                handleTriggerDiscoverMoreLives();
                setTimeout(() => scrollToLiveChannel(safeIndex + 1), 120);
              } else {
                scrollToLiveChannel(safeIndex + 1);
              }
            }}
            className="w-7 h-7 rounded-full bg-black/65 backdrop-blur-md border border-[#25F4EE]/50 flex items-center justify-center text-[10px] text-[#25F4EE] active:scale-90"
            title="Défiler vers le bas pour trouver un nouveau LIVE public"
          >
            ▼
          </button>
        </div>

        {/* TOP BAR: Authentic TokVibe LIVE Header + Persistent Scrollable Live Users List */}
        <div className="relative z-20 pt-2.5 px-3 flex flex-col gap-2 pointer-events-auto">
          {/* Row 1: Host Pill + Viewers + Public Live List Drawer Button + Close */}
          <div className="flex items-center justify-between gap-1.5">
            {/* Host Pill with Pulsing TokVibe LIVE Signal on Profile Photo */}
            <div className="flex items-center gap-2 bg-black/65 backdrop-blur-md rounded-full p-1 pr-2.5 border border-white/15 max-w-[62%]">
              <div className="relative shrink-0">
                <span className="absolute inset-0 rounded-full ring-2 ring-[#FE2C55] animate-ping opacity-75 pointer-events-none" />
                <img
                  src={channel.hostAvatar}
                  alt={channel.hostName}
                  className="relative w-9 h-9 rounded-full object-cover ring-2 ring-[#FE2C55]"
                />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1 py-0.2 rounded bg-[#FE2C55] text-[8px] font-black uppercase tracking-wider text-white shadow">
                  LIVE
                </span>
              </div>

              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-extrabold text-white truncate">
                    {channel.hostName}
                  </span>
                  {channel.hostVerified && (
                    <span
                      className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full shrink-0"
                      style={{
                        background:
                          'radial-gradient(circle at 35% 35%, #86efac 0%, #22c55e 55%, #15803d 100%)',
                      }}
                    >
                      <Check className="w-2 h-2 stroke-[4] text-black" />
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-white/80 font-semibold flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5 text-[#4ade80]" />
                  <span>Public • {(liveLikes / 1000).toFixed(1)}k J&apos;aime</span>
                </div>
              </div>

              {!isMyChannel ? (
                <button
                  type="button"
                  onClick={() => onToggleFollow(channel.hostId)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold transition active:scale-95 shrink-0 ${
                    isFollowing
                      ? 'bg-[#2563eb] text-white border border-blue-400/60 shadow-[0_0_12px_rgba(37,99,235,0.75)]'
                      : 'bg-[#FE2C55] text-white shadow-md'
                  }`}
                >
                  {isFollowing ? 'Abonné' : '+ Suivre'}
                </button>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/50 text-[#4ade80] text-[9px] font-black uppercase">
                  Vous
                </span>
              )}
            </div>

            {/* Right Viewers + Live List Drawer Button + Close */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsLiveListDrawerOpen(true)}
                className="px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-[#FE2C55]/60 flex items-center justify-center text-white hover:bg-[#FE2C55]/25 transition active:scale-95"
                title="Ouvrir la liste de tous les utilisateurs en LIVE public"
              >
                <Radio className="w-3 h-3 text-[#FE2C55] animate-pulse" />
              </button>

              {/* Viewer count removed */}

              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 flex items-center gap-1 text-xs font-bold text-white hover:bg-black/85 transition active:scale-95 shadow-lg"
                title="Retour"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Retour</span>
              </button>
            </div>
          </div>
        </div>

        {/* Discovery Toast Banner when new public lives are loaded */}
        {discoveryBanner && (
          <div className="relative z-30 mx-3 mt-1.5 px-3 py-1.5 rounded-full bg-[#25F4EE]/20 backdrop-blur-md border border-[#25F4EE] text-[#25F4EE] text-[11px] font-black text-center animate-bounce">
            {discoveryBanner}
          </div>
        )}

        {/* Public Broadcast Active Banner when current user is in LIVE */}
        {isCurrentUserLive && (
          <div className="relative z-20 mx-3 mt-1 px-3 py-1.5 rounded-2xl bg-[#FE2C55]/20 backdrop-blur-md border border-[#FE2C55]/60 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FE2C55] animate-ping" />
              <span className="text-[11px] font-extrabold text-white">
                Vous êtes dans la liste publique des LIVEs TokVibe
              </span>
            </div>
            <Globe className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
          </div>
        )}

        {/* Payment Confirmation Toast Banner */}
        {paymentSuccessBanner && (
          <div className="relative z-30 mx-3 mt-2 px-3.5 py-2.5 rounded-2xl bg-emerald-950/95 border border-[#22c55e] shadow-[0_0_25px_rgba(34,197,94,0.5)] flex items-center gap-2.5 animate-bounce">
            <ShieldCheck className="w-5 h-5 text-[#4ade80] shrink-0" />
            <span className="text-xs font-extrabold text-white text-left leading-snug">
              {paymentSuccessBanner}
            </span>
          </div>
        )}

        {/* TokVibe LIVE Animated Gift Combo Banner */}
        {activeGiftBanner && (
          <div className="relative z-30 mx-3 mt-4 flex items-center">
            <div className="flex items-center gap-3 bg-gradient-to-r from-black/90 via-emerald-950/90 to-amber-500/30 backdrop-blur-xl border-2 border-[#22c55e] rounded-full p-1.5 pr-5 shadow-[0_0_30px_rgba(34,197,94,0.6)] animate-bounce">
              <img
                src={activeGiftBanner.senderAvatar}
                alt={activeGiftBanner.senderName}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#22c55e]"
              />
              <div className="text-left">
                <div className="text-xs font-black text-white">
                  {activeGiftBanner.senderName}
                </div>
                <div className="text-[11px] font-bold text-[#4ade80]">
                  a offert {activeGiftBanner.gift.name} !
                </div>
              </div>
              <div className="text-4xl drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] animate-pulse">
                {activeGiftBanner.gift.emoji}
              </div>
              <div className="text-xl font-black italic text-amber-300 drop-shadow">
                x{activeGiftBanner.combo}
              </div>
            </div>
          </div>
        )}

        {/* Spacer pushing chat and controls to the bottom */}
        <div className="flex-1 relative pointer-events-none">
          {floatingHearts.map((h) => (
            <div
              key={h.id}
              className="absolute bottom-4 animate-bounce pointer-events-none"
              style={{ left: `${h.left}%`, color: h.color }}
            >
              <Heart className="w-7 h-7 fill-current drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" />
            </div>
          ))}
        </div>

        {/* BOTTOM SECTION: Live Chat Stream + Action Bar */}
        <div className="relative z-20 px-3 pb-4 flex flex-col gap-2.5">
          {/* Live Title & Goal Banner */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/10 max-w-[65%] text-xs font-bold text-white/95 truncate">
              <Radio className="w-3.5 h-3.5 text-[#FE2C55] animate-pulse shrink-0" />
              <span className="truncate">{channel.title}</span>
            </div>

            <div />
          </div>

          {/* Scrolling Live Chat Messages */}
          <div className="w-[85%] max-h-44 overflow-y-auto no-scrollbar flex flex-col gap-1.5 pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                  setChatInput(`@${msg.user} `);
                  chatInputRef.current?.focus();
                }}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-xl max-w-fit text-left backdrop-blur-md cursor-pointer hover:border-white/40 transition active:scale-95 ${
                  msg.isGift
                    ? 'bg-gradient-to-r from-amber-500/30 to-emerald-500/30 border border-amber-400/50'
                    : msg.isSystem
                    ? 'bg-white/10 text-white/80'
                    : 'bg-black/45 border border-white/5'
                }`}
                title={`Mentionner @${msg.user}`}
              >
                <img
                  src={msg.avatar}
                  alt={msg.user}
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                />
                <div className="text-[10px] leading-snug italic">
                  <span className="font-extrabold text-white/70 mr-1 not-italic">
                    @{msg.user}
                  </span>
                  <span className={msg.isGift ? 'font-extrabold text-amber-300' : 'text-[#22c55e] font-medium'}>
                    {msg.text}
                  </span>
                  {msg.isGift && msg.giftEmoji && (
                    <span className="ml-1 text-sm">{msg.giftEmoji}</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Bottom Controls Row: Comment Input + Quick Rose + Cadeaux Shop + Carte Visa/Mastercard + Like */}
          <div className="flex items-center gap-2 pt-1">
            <form onSubmit={handleSendChat} className="flex-1 relative">
              <input
                ref={chatInputRef}
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="w-full bg-black/60 backdrop-blur-md border border-white/20 rounded-full pl-3.5 pr-9 py-2.5 text-xs text-white placeholder-white/50 focus:outline-none focus:border-[#22c55e]"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#22c55e] text-black flex items-center justify-center hover:scale-105 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Main TokVibe "Cadeaux" Button */}
            <button
              type="button"
              onClick={() => setIsGiftDrawerOpen(true)}
              className="px-3.5 h-9 rounded-full bg-gradient-to-r from-[#FE2C55] via-rose-500 to-amber-500 text-white font-bold text-[10px] flex items-center gap-1.5 shadow-[0_0_10px_rgba(254,44,85,0.4)] hover:scale-105 active:scale-95 transition shrink-0"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Cadeaux</span>
            </button>

            {/* Tap Heart Button */}
            <button
              type="button"
              onClick={spawnFloatingHeart}
              className="w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-[#FE2C55] hover:scale-110 active:scale-75 transition shrink-0"
              title="Envoyer des J'aime"
            >
              <Heart className="w-4 h-4 fill-[#FE2C55]" />
            </button>
          </div>
        </div>

        {/* =====================================================================
            MODAL: PASSER EN LIVE PUBLIC POUR TOUS LES UTILISATEURS TOKVIBE
           ===================================================================== */}
        {isGoLiveSetupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-sm bg-zinc-950 border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FE2C55] animate-ping" />
                  <h3 className="text-sm font-black text-white">
                    Passer en LIVE Public sur TokVibe
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGoLiveSetupOpen(false)}
                  className="p-1 rounded-full bg-white/5 text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview of Profile Photo with TokVibe LIVE Signal */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-[#FE2C55]/40">
                <div className="relative shrink-0">
                  <span className="absolute -inset-1 rounded-full border-2 border-[#FE2C55] animate-ping opacity-75" />
                  <img
                    src={
                      currentUser?.photoURL ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                    }
                    alt="Profil LIVE"
                    className="relative w-14 h-14 rounded-full object-cover ring-2 ring-[#FE2C55]"
                  />
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#FE2C55] text-[9px] font-black uppercase text-white shadow">
                    LIVE
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-white">
                    @{currentUser?.handle || 'mon_tikflow'}
                  </div>
                  <p className="text-[11px] text-white/70 mt-0.5 leading-snug">
                    Le signal <strong className="text-[#FE2C55]">LIVE</strong> apparaîtra sur votre photo de profil et votre direct sera visible publiquement par tous les utilisateurs TokVibe.
                  </p>
                </div>
              </div>

              <form onSubmit={handleStartCountdown} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">
                    Aperçu de votre caméra
                  </label>
                  <div className="relative w-full aspect-video rounded-2xl bg-black border border-white/10 overflow-hidden mb-3">
                    {hasCameraStream ? (
                      <video
                        ref={cameraVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/40">
                        <Video className="w-8 h-8" />
                        <span className="text-[10px]">Chargement de la caméra...</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={toggleCamera}
                      className="absolute top-2 right-2 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">
                    Titre de votre LIVE Public
                  </label>
                  <input
                    type="text"
                    value={customLiveTitle}
                    onChange={(e) => setCustomLiveTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FE2C55]"
                    placeholder="Ex: Discussion & Musique en direct !"
                  />
                </div>

                {isCountingDown ? (
                  <div className="w-full py-8 flex flex-col items-center justify-center gap-4">
                    <div className="text-7xl font-black text-white animate-bounce">
                      {countdown}
                    </div>
                    <p className="text-xs font-bold text-[#FE2C55] uppercase tracking-widest">
                      Lancement imminent...
                    </p>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-[#FE2C55] py-4 rounded-2xl text-white font-black text-sm shadow-xl shadow-rose-500/20 active:scale-95 transition-all hover:brightness-110 flex items-center justify-center gap-2"
                  >
                    <Video className="w-5 h-5" />
                    DÉMARRER LE LIVE MAINTENANT
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

        {/* =====================================================================
            DRAWER 1: TokVibe LIVE GIFT SHOP ("Envoyer un cadeau")
           ===================================================================== */}
        {isGiftDrawerOpen && (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setIsGiftDrawerOpen(false)} />

            <div className="relative z-10 w-full max-w-md bg-zinc-950/95 border-t border-white/15 rounded-t-3xl p-4 pb-6 shadow-2xl flex flex-col gap-3.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#FE2C55]" />
                  <div className="text-left">
                    <h3 className="text-sm font-black text-white">
                      Cadeaux LIVE TokVibe
                    </h3>
                    <p className="text-[10px] text-white/60">
                      Soutenez @{channel.hostHandle} en direct
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMode('coin_pack');
                      setIsPaymentModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center gap-1.5 text-xs font-extrabold text-amber-300 hover:bg-amber-500/30 transition"
                  >
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>{coinsBalance}</span>
                    <span className="text-[10px] bg-[#22c55e] text-black px-1.5 py-0.2 rounded-full font-black">
                      Recharger
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsGiftDrawerOpen(false)}
                    className="p-1.5 rounded-full bg-white/5 text-white/70 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <MastercardLogo className="w-8 h-5" />
                  <VisaLogo className="w-8 h-5" />
                  <span className="text-[11px] font-bold text-white/90">
                    Achat direct par Mastercard &amp; Visa activé
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMode('coin_pack');
                    setIsPaymentModalOpen(true);
                  }}
                  className="text-[11px] font-extrabold text-[#4ade80] flex items-center gap-0.5 hover:underline"
                >
                  <span>Packs Pièces</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2.5 max-h-64 overflow-y-auto no-scrollbar py-1">
                {LIVE_GIFTS.map((gift) => {
                  const isSelected = selectedGift.id === gift.id;
                  return (
                    <div
                      key={gift.id}
                      onClick={() => setSelectedGift(gift)}
                      className={`cursor-pointer rounded-2xl p-2 flex flex-col items-center justify-between border transition-all ${
                        isSelected
                          ? `bg-gradient-to-b ${gift.color} scale-[1.03] shadow-lg ring-2 ring-[#22c55e]`
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-3xl my-1 drop-shadow">{gift.emoji}</span>
                      <span className="text-[11px] font-extrabold text-white truncate w-full text-center">
                        {gift.name}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300 mt-0.5">
                        <Coins className="w-3 h-3 text-amber-400" />
                        <span>{gift.coins}</span>
                      </div>
                      <span className="text-[9px] text-white/60 font-semibold">
                        ou {gift.priceEur.toFixed(2).replace('.', ',')} €
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleSendGiftWithCoins(selectedGift)}
                  className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>
                    Envoyer ({selectedGift.coins} {selectedGift.coins > 1 ? 'Pièces' : 'Pièce'})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenCardCheckoutForGift(selectedGift)}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#22c55e] to-emerald-600 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:opacity-95 transition active:scale-95"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    Acheter {selectedGift.priceEur.toFixed(2).replace('.', ',')} € (Visa/MC)
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            MODAL 2: MASTERCARD & VISA CHECKOUT (DIRECT GIFT OR COIN PACKS)
           ===================================================================== */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4">
            <div className="absolute inset-0" onClick={() => setIsPaymentModalOpen(false)} />

            <div className="relative z-10 w-full max-w-md max-h-[92dvh] overflow-y-auto no-scrollbar bg-zinc-950 border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center -space-x-1.5">
                    <MastercardLogo className="w-9 h-6 shadow" />
                    <VisaLogo className="w-9 h-6 shadow" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-black text-white">
                      Paiement Sécurisé Mastercard &amp; Visa
                    </h3>
                    <p className="text-[10px] text-[#4ade80] font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Chiffrement SSL 256-bits instantané
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 text-white/70 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-white/10">
                <button
                  type="button"
                  onClick={() => setPaymentMode('direct_gift')}
                  className={`py-2 rounded-xl text-xs font-extrabold transition ${
                    paymentMode === 'direct_gift'
                      ? 'bg-[#22c55e] text-black shadow'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  🎁 Achat Cadeau Direct
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('coin_pack')}
                  className={`py-2 rounded-xl text-xs font-extrabold transition ${
                    paymentMode === 'coin_pack'
                      ? 'bg-[#22c55e] text-black shadow'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  🪙 Pack de Pièces
                </button>
              </div>

              {paymentMode === 'direct_gift' ? (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-zinc-900 border border-[#22c55e]/40">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{selectedGift.emoji}</span>
                    <div className="text-left">
                      <div className="text-xs font-black text-white">
                        Cadeau : {selectedGift.name}
                      </div>
                      <div className="text-[11px] text-white/70">
                        Envoyé immédiatement à @{channel.hostHandle}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-[#4ade80]">
                      {selectedGift.priceEur.toFixed(2).replace('.', ',')} €
                    </div>
                    <div className="text-[10px] text-amber-300 font-bold">
                      ({selectedGift.coins} Pièces)
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {COIN_PACKS.map((pack) => {
                    const active = selectedCoinPack.id === pack.id;
                    return (
                      <button
                        key={pack.id}
                        type="button"
                        onClick={() => setSelectedCoinPack(pack)}
                        className={`relative p-2.5 rounded-2xl border text-center flex flex-col items-center transition ${
                          active
                            ? 'bg-emerald-500/20 border-[#22c55e] ring-2 ring-[#22c55e]/60'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {pack.popular && (
                          <span className="absolute -top-2 px-1.5 py-0.2 rounded-full bg-[#FE2C55] text-[8px] font-black text-white uppercase">
                            Populaire
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-xs font-black text-amber-300 mt-1">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span>{pack.coins}</span>
                        </div>
                        <span className="text-[9px] text-[#4ade80] font-bold">
                          +{pack.bonusCoins} bonus
                        </span>
                        <span className="text-xs font-black text-white mt-1">
                          {pack.priceEur.toFixed(2).replace('.', ',')} €
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <form onSubmit={handleConfirmCardPayment} className="flex flex-col gap-3">
                {!isAddingNewCard && savedCards.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white/80">
                        Choisir votre carte bancaire
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewCard(true)}
                        className="text-[11px] font-extrabold text-[#4ade80] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Nouvelle carte Visa / Mastercard
                      </button>
                    </div>

                    {savedCards.map((card) => {
                      const isChosen = selectedCardId === card.id;
                      return (
                        <div
                          key={card.id}
                          onClick={() => setSelectedCardId(card.id)}
                          className={`cursor-pointer p-3 rounded-2xl border flex items-center justify-between transition ${
                            isChosen
                              ? 'bg-white/10 border-[#22c55e] ring-1 ring-[#22c55e]'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {card.brand === 'mastercard' ? (
                              <MastercardLogo className="w-11 h-7" />
                            ) : (
                              <VisaLogo className="w-11 h-7" />
                            )}
                            <div className="text-left">
                              <div className="text-xs font-black text-white flex items-center gap-1.5">
                                <span className="uppercase">
                                  {card.brand === 'mastercard' ? 'Mastercard' : 'Visa'}
                                </span>
                                <span>•••• {card.last4}</span>
                              </div>
                              <div className="text-[10px] text-white/60">
                                {card.holder} • Exp. {card.expiry}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              isChosen
                                ? 'bg-[#22c55e] text-black'
                                : 'border border-white/30'
                            }`}
                          >
                            {isChosen && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white">
                        Nouvelle carte Mastercard ou Visa
                      </span>
                      {savedCards.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsAddingNewCard(false)}
                          className="text-[11px] font-bold text-white/60 hover:text-white"
                        >
                          Utiliser une carte enregistrée
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => fillDemoCard('mastercard')}
                        className={`p-2 rounded-xl border flex items-center justify-center gap-2 text-xs font-extrabold transition ${
                          cardBrand === 'mastercard'
                            ? 'bg-amber-500/20 border-amber-400 text-white'
                            : 'bg-black/40 border-white/10 text-white/70'
                        }`}
                      >
                        <MastercardLogo className="w-8 h-5" />
                        <span>Mastercard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fillDemoCard('visa')}
                        className={`p-2 rounded-xl border flex items-center justify-center gap-2 text-xs font-extrabold transition ${
                          cardBrand === 'visa'
                            ? 'bg-blue-500/20 border-blue-400 text-white'
                            : 'bg-black/40 border-white/10 text-white/70'
                        }`}
                      >
                        <VisaLogo className="w-8 h-5" />
                        <span>Visa</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-white/70 uppercase mb-1 text-left">
                        Numéro de carte ({cardBrand === 'mastercard' ? 'Mastercard' : 'Visa'})
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          placeholder={
                            cardBrand === 'mastercard'
                              ? '5412 7589 3412 8890'
                              : '4532 8910 2345 4242'
                          }
                          className="w-full bg-black/70 border border-white/20 rounded-xl px-3 py-2.5 pr-12 text-xs font-mono text-white focus:outline-none focus:border-[#22c55e]"
                        />
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                          {cardBrand === 'mastercard' ? (
                            <MastercardLogo className="w-8 h-5" />
                          ) : (
                            <VisaLogo className="w-8 h-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-white/70 uppercase mb-1 text-left">
                        Nom du titulaire
                      </label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="EX: ADAM LORGEAT"
                        className="w-full bg-black/70 border border-white/20 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-[#22c55e]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-white/70 uppercase mb-1 text-left">
                          Expiration (MM/AA)
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          placeholder="08/29"
                          className="w-full bg-black/70 border border-white/20 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#22c55e]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/70 uppercase mb-1 text-left">
                          Cryptogramme (CVV)
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="•••"
                          className="w-full bg-black/70 border border-white/20 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#22c55e]"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={saveCardForLater}
                        onChange={(e) => setSaveCardForLater(e.target.checked)}
                        className="rounded accent-[#22c55e]"
                      />
                      <span>Enregistrer cette carte pour mes prochains cadeaux LIVE</span>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#22c55e] via-emerald-500 to-teal-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:opacity-95 active:scale-98 transition disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isProcessingPayment
                      ? 'Validation Mastercard / Visa en cours...'
                      : paymentMode === 'direct_gift'
                      ? `Payer ${selectedGift.priceEur.toFixed(2).replace('.', ',')} € et Envoyer ${selectedGift.emoji} ${selectedGift.name}`
                      : `Payer ${selectedCoinPack.priceEur.toFixed(2).replace('.', ',')} € (+${
                          selectedCoinPack.coins + selectedCoinPack.bonusCoins
                        } Pièces)`}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================================
            DRAWER 3: LISTE COMPLÈTE DES UTILISATEURS EN LIVE PUBLIC (DÉFILER)
           ===================================================================== */}
        {isLiveListDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-md">
            <div className="absolute inset-0" onClick={() => setIsLiveListDrawerOpen(false)} />

            <div className="relative z-10 w-full max-w-md max-h-[82dvh] bg-zinc-950 border-t border-white/15 rounded-t-3xl p-4 pb-6 shadow-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FE2C55] animate-ping" />
                  <div className="text-left">
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>Utilisateurs en LIVE Public ({channels.length})</span>
                    </h3>
                    <p className="text-[10px] text-[#4ade80] font-bold flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Tous les LIVEs sont publics • Défilez pour explorer
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleTriggerDiscoverMoreLives}
                    className="px-2.5 py-1.5 rounded-full bg-[#25F4EE]/20 border border-[#25F4EE]/60 text-[#25F4EE] text-[10px] font-black flex items-center gap-1 hover:bg-[#25F4EE]/30 transition active:scale-95"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>+ Trouver nouveaux LIVEs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLiveListDrawerOpen(false)}
                    className="p-1.5 rounded-full bg-white/10 text-white/70 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-1">
                {channels.map((ch, idx) => {
                  const isCurrent = idx === safeIndex;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => {
                        scrollToLiveChannel(idx);
                        setIsLiveListDrawerOpen(false);
                      }}
                      className={`cursor-pointer p-3 rounded-2xl border flex items-center justify-between gap-3 transition active:scale-98 ${
                        isCurrent
                          ? 'bg-gradient-to-r from-[#FE2C55]/25 via-zinc-900 to-zinc-900 border-[#FE2C55] ring-1 ring-[#FE2C55]'
                          : 'bg-zinc-900/90 border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <span className="absolute -inset-0.5 rounded-full border-2 border-[#FE2C55] animate-ping opacity-60 pointer-events-none" />
                          <img
                            src={ch.hostAvatar}
                            alt={ch.hostName}
                            className="relative w-12 h-12 rounded-full object-cover border-2 border-[#FE2C55]"
                          />
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-[#FE2C55] text-[8px] font-black uppercase text-white shadow">
                            LIVE
                          </span>
                        </div>

                        <div className="text-left min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-white truncate">
                              {ch.hostName}
                            </span>
                            {ch.hostVerified && (
                              <span
                                className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full shrink-0"
                                style={{
                                  background:
                                    'radial-gradient(circle at 35% 35%, #86efac 0%, #22c55e 55%, #15803d 100%)',
                                }}
                              >
                                <Check className="w-2 h-2 stroke-[4] text-black" />
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-400/40 text-[#4ade80] text-[9px] font-black uppercase">
                              Public
                            </span>
                          </div>
                          <div className="text-[11px] text-white/85 font-semibold truncate mt-0.5">
                            {ch.title}
                          </div>
                          <div className="text-[10px] text-white/50 flex items-center gap-2 mt-0.5">
                            <span>@{ch.hostHandle}</span>
                            <span>•</span>
                            {/* Spectateurs removed */}
                            <span>•</span>
                            <span>{ch.category}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-black shrink-0 ${
                          isCurrent
                            ? 'bg-[#22c55e] text-black'
                            : 'bg-[#FE2C55] text-white shadow-md'
                        }`}
                      >
                        {isCurrent ? 'En cours' : 'Regarder'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {!isCurrentUserLive && (
                <button
                  type="button"
                  onClick={() => {
                    setIsLiveListDrawerOpen(false);
                    setIsGoLiveSetupOpen(true);
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FE2C55] to-rose-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
                >
                  <Video className="w-4 h-4" />
                  <span>Rejoindre la liste • Passer en LIVE Public</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
