import React, { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  TrendingUp,
  Eye,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  BarChart3,
  Globe2,
  MapPin,
  PlayCircle,
  Users,
  Compass,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Check,
  UserCheck,
  UserPlus,
  Film,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Gift,
  Sliders,
  CreditCard,
  Lock,
  ChevronRight,
  Info,
  Calendar,
  Building2,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CreatorAnalytics, VideoItem, UserProfile } from '../types';

export type StudioAnalyticsSubTab = 'video_overview' | 'video_location' | 'profile_visitors';

export interface ProfileVisitorItem {
  id: string;
  authorId: string;
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  visitedAt: string;
  visitCount: number;
  countryFlag: string;
  cityCountry: string;
  sourceVideoCaption?: string;
  watchedFullVideo: boolean;
}

export const INITIAL_PROFILE_VISITORS: ProfileVisitorItem[] = [
  {
    id: 'vis-1',
    authorId: 'creator-tokyo',
    name: 'Kenji Cyber',
    handle: 'tokyo_drift_tech',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    verified: true,
    visitedAt: 'Il y a 2 min',
    visitCount: 4,
    countryFlag: '🇫🇷',
    cityCountry: 'Paris, France',
    sourceVideoCaption: 'A regardé 100% de votre vidéo avant de visiter votre profil',
    watchedFullVideo: true,
  },
  {
    id: 'vis-2',
    authorId: 'creator-dance',
    name: 'Léa Vance',
    handle: 'lea_vance_off',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    verified: true,
    visitedAt: 'Il y a 11 min',
    visitCount: 2,
    countryFlag: '🇧🇪',
    cityCountry: 'Bruxelles, Belgique',
    sourceVideoCaption: 'Venue depuis le fil Pour Toi (Vue complète 100%)',
    watchedFullVideo: true,
  },
  {
    id: 'vis-3',
    authorId: 'creator-food',
    name: 'Chef Marco',
    handle: 'marco_gusto',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    verified: true,
    visitedAt: 'Il y a 28 min',
    visitCount: 3,
    countryFlag: '🇨🇦',
    cityCountry: 'Montréal, Canada',
    sourceVideoCaption: 'A consulté vos vidéos publiées et aimé 2 vidéos',
    watchedFullVideo: true,
  },
  {
    id: 'vis-4',
    authorId: 'visitor-amina',
    name: 'Amina Vibes',
    handle: 'amina_danse_24',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    verified: true,
    visitedAt: 'Il y a 45 min',
    visitCount: 5,
    countryFlag: '🇲🇦',
    cityCountry: 'Casablanca, Maroc',
    sourceVideoCaption: 'A regardé 3 de vos vidéos en entier (100%)',
    watchedFullVideo: true,
  },
  {
    id: 'vis-5',
    authorId: 'creator-nature',
    name: 'Lucas Horizon',
    handle: 'lucas_drone_4k',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    verified: false,
    visitedAt: "Aujourd'hui, 09:40",
    visitCount: 1,
    countryFlag: '🇨🇭',
    cityCountry: 'Genève, Suisse',
    sourceVideoCaption: 'A trouvé votre profil via #tech',
    watchedFullVideo: false,
  },
  {
    id: 'vis-6',
    authorId: 'creator-art',
    name: 'Sofia Studio',
    handle: 'sofia_neon_art',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    verified: true,
    visitedAt: "Aujourd'hui, 08:15",
    visitCount: 6,
    countryFlag: '🇫🇷',
    cityCountry: 'Lyon, France',
    sourceVideoCaption: 'A regardé 100% de votre vidéo et partagé votre profil',
    watchedFullVideo: true,
  },
  {
    id: 'vis-7',
    authorId: 'visitor-youssef',
    name: 'Youssef Beats',
    handle: 'youssef_synth',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    verified: true,
    visitedAt: 'Hier, 23:12',
    visitCount: 2,
    countryFlag: '🇺🇸',
    cityCountry: 'Los Angeles, États-Unis',
    sourceVideoCaption: 'A découvert votre profil via votre son original',
    watchedFullVideo: true,
  },
  {
    id: 'vis-8',
    authorId: 'visitor-chloe',
    name: 'Chloé Paris',
    handle: 'chloe_lifestyle',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    verified: false,
    visitedAt: 'Hier, 21:05',
    visitCount: 3,
    countryFlag: '🇫🇷',
    cityCountry: 'Marseille, France',
    sourceVideoCaption: 'Venue depuis le fil Pour Toi (Vue complète 100%)',
    watchedFullVideo: true,
  },
];

interface CreatorStudioModalProps {
  analytics: CreatorAnalytics;
  myVideos: VideoItem[];
  allVideos?: VideoItem[];
  currentUser: UserProfile;
  followedAuthorIds?: string[];
  onToggleFollow?: (authorId: string) => void;
  initialTab?: 'analytics' | 'monetization';
  initialSubTab?: StudioAnalyticsSubTab;
  initialVideo?: VideoItem | null;
  onClose: () => void;
  onWithdraw: (amount: number) => void;
}

type PeriodRange = '7d' | '28d' | '60d';

interface LocationTerritory {
  code: string;
  country: string;
  flag: string;
  pct: number;
  fullViewRate: number;
  cities: { name: string; pct: number }[];
}

const BASE_LOCATIONS: LocationTerritory[] = [
  {
    code: 'FR',
    country: 'France',
    flag: '🇫🇷',
    pct: 44,
    fullViewRate: 87.4,
    cities: [
      { name: 'Paris', pct: 46 },
      { name: 'Lyon', pct: 18 },
      { name: 'Marseille', pct: 15 },
      { name: 'Lille', pct: 11 },
      { name: 'Bordeaux', pct: 10 },
    ],
  },
  {
    code: 'US',
    country: 'États-Unis',
    flag: '🇺🇸',
    pct: 22,
    fullViewRate: 82.1,
    cities: [
      { name: 'Los Angeles', pct: 38 },
      { name: 'New York', pct: 34 },
      { name: 'Miami', pct: 16 },
      { name: 'Chicago', pct: 12 },
    ],
  },
  {
    code: 'BE',
    country: 'Belgique',
    flag: '🇧🇪',
    pct: 12,
    fullViewRate: 86.0,
    cities: [
      { name: 'Bruxelles', pct: 54 },
      { name: 'Liège', pct: 26 },
      { name: 'Anvers', pct: 20 },
    ],
  },
  {
    code: 'CA',
    country: 'Canada',
    flag: '🇨🇦',
    pct: 10,
    fullViewRate: 85.2,
    cities: [
      { name: 'Montréal', pct: 62 },
      { name: 'Québec', pct: 22 },
      { name: 'Toronto', pct: 16 },
    ],
  },
  {
    code: 'CH',
    country: 'Suisse',
    flag: '🇨🇭',
    pct: 6,
    fullViewRate: 88.9,
    cities: [
      { name: 'Genève', pct: 49 },
      { name: 'Lausanne', pct: 31 },
      { name: 'Zurich', pct: 20 },
    ],
  },
  {
    code: 'MA',
    country: 'Maroc & Afrique Francophone',
    flag: '🇲🇦',
    pct: 6,
    fullViewRate: 83.5,
    cities: [
      { name: 'Casablanca', pct: 42 },
      { name: 'Rabat', pct: 23 },
      { name: 'Dakar', pct: 19 },
      { name: 'Abidjan', pct: 16 },
    ],
  },
];

export const CreatorStudioModal: React.FC<CreatorStudioModalProps> = ({
  analytics,
  myVideos,
  allVideos = [],
  currentUser,
  followedAuthorIds = [],
  onToggleFollow,
  initialTab = 'analytics',
  initialSubTab = 'video_overview',
  initialVideo = null,
  onClose,
  onWithdraw,
}) => {
  const videosList = allVideos.length > 0 ? allVideos : myVideos;

  const isHaitiUser = (() => {
    const c =
      currentUser?.idCountry ||
      (typeof window !== 'undefined' ? localStorage.getItem('tokvibe_user_country') : '') ||
      'Haïti';
    return c === 'Haïti' || c.toLowerCase() === 'haiti';
  })();

  const [activeTab, setActiveTab] = useState<'analytics' | 'monetization'>(
    isHaitiUser ? initialTab : 'analytics'
  );
  const [subTab, setSubTab] = useState<StudioAnalyticsSubTab>(initialSubTab);
  const [period, setPeriod] = useState<PeriodRange>('7d');
  // Strictly per-video only: always select a single video
  const [selectedVideo, setSelectedVideo] = useState<VideoItem>(
    initialVideo || videosList[0]
  );
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('FR');
  const [profileViewsHistoryEnabled, setProfileViewsHistoryEnabled] = useState<boolean>(true);
  const [visitorFilter, setVisitorFilter] = useState<'all' | 'full_watcher'>('all');
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Close immediately on mobile device Back button or ESC
  useEffect(() => {
    window.history.pushState({ modal: 'creator_studio' }, '');
    const handlePop = () => {
      onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('popstate', handlePop);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handlePop);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // TikTok Monetization Sub-tabs & State
  const [monetizationSubTab, setMonetizationSubTab] = useState<'rewards' | 'parameters' | 'payout' | 'rules'>('rewards');
  const [rpmViewsSlider, setRpmViewsSlider] = useState<number>(100000);
  const [rpmRateSlider, setRpmRateSlider] = useState<number>(0.85);
  const [isAppliedForMonetization, setIsAppliedForMonetization] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tokvibe_monetization_enrolled') === 'true';
    } catch {
      return false;
    }
  });
  const [applySuccessMessage, setApplySuccessMessage] = useState<string | null>(null);
  const [applyErrorMessage, setApplyErrorMessage] = useState<string | null>(null);

  // Monetization Settings Toggles
  const [enableVideoGifts, setEnableVideoGifts] = useState<boolean>(() => {
    try { return localStorage.getItem('tokvibe_monetiz_gifts') !== 'false'; } catch { return true; }
  });
  const [enableTips, setEnableTips] = useState<boolean>(() => {
    try { return localStorage.getItem('tokvibe_monetiz_tips') !== 'false'; } catch { return true; }
  });
  const [enableLiveSubs, setEnableLiveSubs] = useState<boolean>(() => {
    try { return localStorage.getItem('tokvibe_monetiz_live_subs') !== 'false'; } catch { return true; }
  });
  const [enableShopAffiliate, setEnableShopAffiliate] = useState<boolean>(() => {
    try { return localStorage.getItem('tokvibe_monetiz_shop') !== 'false'; } catch { return true; }
  });
  const [enablePaywalledSeries, setEnablePaywalledSeries] = useState<boolean>(() => {
    try { return localStorage.getItem('tokvibe_monetiz_series') !== 'false'; } catch { return true; }
  });

  // PayPal Payment & Payout State
  const [paypalInput, setPaypalInput] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('tokvibe_paypal_email');
      if (saved) return saved;
    } catch {}
    return currentUser?.handle ? `${currentUser.handle}@gmail.com` : 'creator@gmail.com';
  });
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [paypalValidatedMessage, setPaypalValidatedMessage] = useState<string | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<
    Array<{ id: string; title: string; date: string; amount: number; email: string }>
  >([
    {
      id: 'tx-oct',
      title: 'Programme Récompenses Octobre',
      date: 'Versé le 15 Octobre 2026',
      amount: 382.5,
      email: currentUser?.handle ? `${currentUser.handle}@gmail.com` : 'creator@gmail.com',
    },
    {
      id: 'tx-sep',
      title: 'Cadeaux & Diamants Vidéos',
      date: 'Versé le 15 Septembre 2026',
      amount: 148.0,
      email: currentUser?.handle ? `${currentUser.handle}@gmail.com` : 'creator@gmail.com',
    },
  ]);

  const calculateAge = (dobString?: string): number => {
    if (!dobString) return 24;
    const dob = new Date(dobString);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age;
  };

  // Strict 5 Mandatory TokVibe Monetization Rules
  const userAge = calculateAge(currentUser?.birthDate);
  const userFollowers = currentUser?.followersCount ?? 0;
  const totalRecentViews =
    analytics?.totalViews && analytics.totalViews > 0
      ? analytics.totalViews
      : videosList.reduce((acc, v) => acc + (v.viewsCount || 0), 0);
  const watchTimeQualifiedHours = Math.max(1250, analytics?.watchTimeHours || 1420);

  const [ruleAgeConfirmed, setRuleAgeConfirmed] = useState<boolean>(() => userAge >= 18);
  const [ruleFollowersConfirmed, setRuleFollowersConfirmed] = useState<boolean>(
    () => userFollowers >= 10000
  );
  const [ruleViewsConfirmed, setRuleViewsConfirmed] = useState<boolean>(
    () => totalRecentViews >= 100000
  );
  const [ruleLongVideoConfirmed, setRuleLongVideoConfirmed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tokvibe_rule_long_video') === 'true';
    } catch {
      return false;
    }
  });
  const [ruleTokVibeAccepted, setRuleTokVibeAccepted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tokvibe_rules_accepted') === 'true';
    } catch {
      return false;
    }
  });

  const isAgeEligible = userAge >= 18 && ruleAgeConfirmed;
  const isFollowersEligible = userFollowers >= 10000 && ruleFollowersConfirmed;
  const followersProgressPct = isFollowersEligible
    ? 100
    : Math.min(99, Math.round((Math.min(userFollowers, 7500) / 10000) * 100));
  const isViewsEligible = totalRecentViews >= 100000 && ruleViewsConfirmed;
  const viewsProgressPct = isViewsEligible
    ? 100
    : Math.min(99, Math.round((Math.min(totalRecentViews, 68000) / 100000) * 100));
  const isLongVideoEligible = ruleLongVideoConfirmed;
  const communityStandingValid = ruleTokVibeAccepted;

  const validatedRulesCount = [
    isAgeEligible,
    isFollowersEligible,
    isViewsEligible,
    isLongVideoEligible,
    communityStandingValid,
  ].filter(Boolean).length;

  // All 5 TokVibe rules MUST be fulfilled to unlock the TokVibe monetization button
  const isFullyEligible =
    isAgeEligible &&
    isFollowersEligible &&
    isViewsEligible &&
    isLongVideoEligible &&
    communityStandingValid;

  // If any rule is not fulfilled, monetization cannot remain active
  const isMonetizationActive = isFullyEligible && isAppliedForMonetization;

  const handleApplyMonetization = () => {
    if (!isFullyEligible) {
      setApplyErrorMessage(
        `Accès refusé : Vous devez obligatoirement remplir les 5 règles TokVibe (${validatedRulesCount}/5 validées) avant de pouvoir activer la monétisation TokVibe.`
      );
      setTimeout(() => setApplyErrorMessage(null), 5000);
      return;
    }
    setApplyErrorMessage(null);
    setIsAppliedForMonetization(true);
    try {
      localStorage.setItem('tokvibe_monetization_enrolled', 'true');
    } catch {}
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    setApplySuccessMessage(
      'Félicitations ! Toutes les règles TokVibe (5/5) sont remplies : la Monétisation TokVibe est maintenant activée.'
    );
    setTimeout(() => setApplySuccessMessage(null), 5000);
  };

  useEffect(() => {
    if (initialVideo) {
      setSelectedVideo(initialVideo);
    }
  }, [initialVideo]);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Compute deterministic per-video statistics for the currently selected video
  const videoIndex = Math.max(
    0,
    videosList.findIndex((v) => v.id === selectedVideo?.id)
  );
  const seed = (videoIndex + 1) * 7 + (selectedVideo?.likesCount || 100);

  const periodMultiplier = period === '7d' ? 1 : period === '28d' ? 1.85 : 2.65;

  // Per-video Views, 100% Full Views, Watch time, Duration & Replay Rate
  const videoTotalViews = Math.round((selectedVideo?.viewsCount || 48000) * periodMultiplier);
  const videoFullViewRate = Number((81.2 + ((seed % 115) / 10)).toFixed(1)); // e.g., 81.2% - 92.6%
  const videoFullViewsCount = Math.round(videoTotalViews * (videoFullViewRate / 100));
  const videoTotalDurationSec = Number((14.5 + (videoIndex % 5) * 1.8).toFixed(1));
  const videoAvgWatchSec = Number(
    (videoTotalDurationSec * (videoFullViewRate / 100)).toFixed(1)
  );
  const videoWatchTimeHours = Math.max(
    12,
    Math.round((videoTotalViews * videoAvgWatchSec) / 3600)
  );
  const videoReplayRate = Number((26.4 + ((seed % 90) / 10)).toFixed(1));
  const videoProfileVisitsGenerated = Math.max(
    48,
    Math.round(videoTotalViews * 0.014)
  );

  // Per-video dynamic country breakdown
  const videoLocations: LocationTerritory[] = BASE_LOCATIONS.map((loc, idx) => {
    const shift = ((videoIndex + idx) % 3) - 1; // -1, 0, or +1
    const adjustedPct = Math.max(4, loc.pct + shift * 2);
    const adjustedFullRate = Number(
      Math.min(96.5, loc.fullViewRate + ((videoIndex + idx) % 4) * 0.9).toFixed(1)
    );
    return {
      ...loc,
      pct: adjustedPct,
      fullViewRate: adjustedFullRate,
    };
  });

  const selectedTerritory =
    videoLocations.find((l) => l.code === selectedCountryCode) || videoLocations[0];

  // Per-video retention curve points
  const videoRetentionPoints = [
    { sec: '0:00', pct: 100 },
    { sec: '0:02', pct: Math.min(99, Math.round(videoFullViewRate + 11)) },
    { sec: '0:04', pct: Math.min(98, Math.round(videoFullViewRate + 8)) },
    { sec: '0:06', pct: Math.min(96, Math.round(videoFullViewRate + 6)) },
    { sec: '0:09', pct: Math.min(95, Math.round(videoFullViewRate + 4)) },
    { sec: '0:12', pct: Math.min(94, Math.round(videoFullViewRate + 2)) },
    { sec: `${videoTotalDurationSec}s (Fin)`, pct: videoFullViewRate },
  ];

  // Per-video traffic sources
  const videoTrafficSources = [
    {
      label: 'Pour toi (For You)',
      pct: Math.min(84, 72 + (videoIndex % 5) * 2),
      color: 'from-[#FE2C55] to-rose-500',
    },
    {
      label: 'Visites depuis votre Profil',
      pct: Math.max(8, 14 - (videoIndex % 4)),
      color: 'from-[#25F4EE] to-cyan-500',
    },
    {
      label: 'Abonnements (Following)',
      pct: 7,
      color: 'from-[#2563eb] to-blue-400',
    },
    {
      label: `Recherche (#${selectedVideo?.tags?.[0] || 'tokvibe'})`,
      pct: 5,
      color: 'from-emerald-400 to-green-600',
    },
    {
      label: `Son (${selectedVideo?.musicTitle?.slice(0, 18) || 'Audio original'})`,
      pct: 2,
      color: 'from-amber-400 to-orange-500',
    },
  ];

  const filteredVisitors =
    visitorFilter === 'full_watcher'
      ? INITIAL_PROFILE_VISITORS.filter((v) => v.watchedFullVideo)
      : INITIAL_PROFILE_VISITORS;

  const handleValidatePaypalPayment = () => {
    const trimmedEmail = paypalInput.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setPaypalError('Veuillez saisir une adresse e-mail PayPal valide (ex: nom@gmail.com).');
      setPaypalValidatedMessage(null);
      return;
    }
    if (!isFullyEligible) {
      setPaypalError(
        `Paiement PayPal bloqué : Vous devez d'abord remplir toutes les règles de monétisation TokVibe (${validatedRulesCount}/5 validées).`
      );
      setPaypalValidatedMessage(null);
      return;
    }

    setPaypalError(null);
    setIsProcessing(true);
    try {
      localStorage.setItem('tokvibe_paypal_email', trimmedEmail);
    } catch {}

    const amountToPay = currentUser.walletBalance;
    setTimeout(() => {
      if (amountToPay > 0) {
        onWithdraw(amountToPay);
        const nowLabel = new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date());
        setPayoutHistory((prev) => [
          {
            id: `tx-${Date.now()}`,
            title: `Paiement PayPal Validé (${trimmedEmail})`,
            date: `Validé le ${nowLabel}`,
            amount: amountToPay,
            email: trimmedEmail,
          },
          ...prev,
        ]);
        setPaypalValidatedMessage(
          `Paiement PayPal de ${formatCurrency(amountToPay)} validé avec succès vers ${trimmedEmail} !`
        );
      } else {
        setPaypalValidatedMessage(
          `Compte et paiement PayPal (${trimmedEmail}) validés et enregistrés avec succès !`
        );
      }
      setIsProcessing(false);
      setPayoutSuccess(true);
      confetti({
        particleCount: 45,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#25F4EE', '#3b82f6'],
      });
      setTimeout(() => setPayoutSuccess(false), 5000);
    }, 650);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const formatCompact = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black select-none">
      <div className="relative w-full max-w-md h-full bg-black flex flex-col overflow-hidden text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 bg-zinc-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#25F4EE] via-[#FE2C55] to-amber-500 flex items-center justify-center text-black shadow-lg">
              <BarChart3 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black text-white">
                  Mode Statistique Par Vidéo & Vues Profil
                </h2>
                <span className="px-1.5 py-0.2 rounded bg-[#25F4EE] text-black text-[9px] font-black uppercase">
                  TokVibe PRO
                </span>
              </div>
              <span className="text-[10px] text-white/60 font-medium flex items-center gap-1">
                <Globe2 className="w-3 h-3 text-[#25F4EE]" />
                Statistiques par vidéo uniquement + Utilisateurs ayant vu votre profil
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/60 hover:text-white bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Mode Switcher: Statistiques vs Monétisation (Uniquement visible pour Haïti 🇭🇹) */}
        <div className="flex border-b border-white/10 bg-black/60 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'analytics' || !isHaitiUser
                ? 'border-[#25F4EE] text-white bg-white/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#25F4EE]" />
            <span>Statistiques Vidéo & Vues Profil</span>
          </button>
          {isHaitiUser && (
            <button
              type="button"
              onClick={() => setActiveTab('monetization')}
              className={`flex-1 py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 border-b-2 transition ${
                activeTab === 'monetization'
                  ? 'border-[#FE2C55] text-white bg-white/5'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Fonds Créateurs & Pubs 🇭🇹</span>
            </button>
          )}
        </div>

        {/* =========================================================
            TAB 1: MODE STATISTIQUE (PAR VIDÉO UNIQUEMENT + VUES DU PROFIL)
           ========================================================= */}
        {activeTab === 'analytics' || !isHaitiUser ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Sub-Navigation:
                1. Vue complète (Vidéo)
                2. Localisation (Vidéo)
                3. Qui a vu ton profil (Utilisateurs) */}
            <div className="px-3.5 pt-2.5 pb-2 bg-zinc-900/60 border-b border-white/10 space-y-2 shrink-0">
              <div className="grid grid-cols-3 gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setSubTab('video_overview')}
                  className={`py-2 px-2 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 transition ${
                    subTab === 'video_overview'
                      ? 'bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] text-white shadow'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <PlayCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Vue complète (Vidéo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubTab('video_location')}
                  className={`py-2 px-2 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 transition ${
                    subTab === 'video_location'
                      ? 'bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] text-white shadow'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Localisation (Vidéo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubTab('profile_visitors')}
                  className={`py-2 px-2 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 transition ${
                    subTab === 'profile_visitors'
                      ? 'bg-gradient-to-r from-[#2563eb] to-[#25F4EE] text-white shadow'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    Vues profil ({INITIAL_PROFILE_VISITORS.length})
                  </span>
                </button>
              </div>

              {/* Per-Video Selector Strip (Shown when in Video Statistics tabs) */}
              {subTab !== 'profile_visitors' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#25F4EE] flex items-center gap-1">
                      <Film className="w-3 h-3" />
                      Statistiques par vidéo uniquement — Sélectionnez une vidéo :
                    </span>
                    {/* Period Selector: 7j | 28j | 60j */}
                    <div className="flex items-center gap-0.5 bg-zinc-900 p-0.5 rounded-lg border border-white/10 shrink-0">
                      {(
                        [
                          { id: '7d', label: '7j' },
                          { id: '28d', label: '28j' },
                          { id: '60d', label: '60j' },
                        ] as const
                      ).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPeriod(p.id)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold transition ${
                            period === p.id
                              ? 'bg-[#25F4EE] text-black'
                              : 'text-white/55 hover:text-white'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Horizontal Carousel of Individual Videos */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
                    {videosList.map((vid, idx) => {
                      const isSelected = selectedVideo?.id === vid.id;
                      const vidSeed = (idx + 1) * 7 + vid.likesCount;
                      const vidRate = Number((81.2 + ((vidSeed % 115) / 10)).toFixed(1));
                      return (
                        <button
                          key={vid.id}
                          type="button"
                          onClick={() => setSelectedVideo(vid)}
                          className={`flex items-center gap-2 p-1.5 rounded-xl border shrink-0 text-left transition max-w-[195px] ${
                            isSelected
                              ? 'bg-[#25F4EE]/15 border-[#25F4EE] shadow-[0_0_12px_rgba(37,244,238,0.3)]'
                              : 'bg-black/50 border-white/10 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={vid.thumbnailUrl || vid.authorAvatar}
                            alt={vid.caption}
                            className="w-8 h-11 rounded-lg object-cover shrink-0 border border-white/15"
                          />
                          <div className="min-w-0">
                            <div className="text-[10px] font-black text-white truncate">
                              Vidéo #{idx + 1} • @{vid.authorHandle}
                            </div>
                            <div className="text-[9px] text-white/60 truncate">
                              {vid.caption}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] font-extrabold text-[#25F4EE]">
                                {formatCompact(vid.viewsCount)} vues
                              </span>
                              <span className="text-[8px] px-1 rounded bg-emerald-500/20 text-[#4ade80] font-black">
                                {vidRate}% 100%
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
              {/* Selected Video Identity Banner (when in video_overview or video_location) */}
              {subTab !== 'profile_visitors' && selectedVideo && (
                <div className="p-3 rounded-2xl bg-zinc-900/90 border border-white/15 flex items-center gap-3">
                  <img
                    src={selectedVideo.thumbnailUrl || selectedVideo.authorAvatar}
                    alt={selectedVideo.caption}
                    className="w-14 h-20 rounded-xl object-cover shrink-0 border border-[#25F4EE]/50"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#FE2C55]/20 text-[#FE2C55] text-[9px] font-black uppercase">
                        Vidéo sélectionnée #{videoIndex + 1}
                      </span>
                      <span className="text-[10px] text-white/50 font-bold">
                        {selectedVideo.createdAt}
                      </span>
                    </div>
                    <p className="text-xs font-extrabold text-white line-clamp-1">
                      {selectedVideo.caption}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-white/70 font-bold pt-0.5">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-[#22c55e]" />
                        {formatCompact(selectedVideo.likesCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-[#25F4EE]" />
                        {formatCompact(selectedVideo.commentsCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="w-3 h-3 text-amber-400" />
                        {formatCompact(selectedVideo.bookmarksCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3 h-3 text-[#FE2C55]" />
                        {formatCompact(selectedVideo.sharesCount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------------
                  SUB-TAB 1: VUE COMPLÈTE DE CETTE VIDÉO UNIQUEMENT
                 --------------------------------------------------------- */}
              {subTab === 'video_overview' && (
                <>
                  {/* Hero Card: Watched Full Video for THIS video */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-[#25F4EE]/40 shadow-[0_0_25px_rgba(37,244,238,0.12)] space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#25F4EE]/15 text-[#25F4EE] text-[10px] font-black uppercase tracking-wider">
                          <PlayCircle className="w-3 h-3" />
                          Statistique Unique de cette Vidéo
                        </span>
                        <h3 className="text-sm font-black text-white mt-1">
                          Vidéo regardée en entier (Vues complètes 100%)
                        </h3>
                        <p className="text-[11px] text-white/55">
                          Part des spectateurs ayant regardé cette vidéo jusqu'à la dernière seconde.
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-black text-[#25F4EE]">
                          {videoFullViewRate}%
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-400">
                          +{((videoIndex % 5) + 4.2).toFixed(1)}% vs moy.
                        </span>
                      </div>
                    </div>

                    {/* Full View Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-extrabold">
                        <span className="text-white">
                          {formatCompact(videoFullViewsCount)} vues complètes (100%)
                        </span>
                        <span className="text-white/60">
                          sur {formatCompact(videoTotalViews)} vues de cette vidéo
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#25F4EE] via-[#22c55e] to-[#FE2C55] transition-all duration-500"
                          style={{ width: `${Math.min(100, videoFullViewRate)}%` }}
                        />
                      </div>
                    </div>

                    {/* Mini stats row inside Full View card */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="p-2 rounded-xl bg-black/50 border border-white/10">
                        <span className="text-[10px] text-white/50 block">Durée moy. lue</span>
                        <span className="text-xs font-black text-white">
                          {videoAvgWatchSec}s / {videoTotalDurationSec}s
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-black/50 border border-white/10">
                        <span className="text-[10px] text-white/50 block">Taux de Replay</span>
                        <span className="text-xs font-black text-[#4ade80]">
                          {videoReplayRate}% (Boucle)
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-black/50 border border-white/10">
                        <span className="text-[10px] text-white/50 block">Pays #1 Vidéo</span>
                        <span className="text-xs font-black text-[#25F4EE]">
                          {videoLocations[0].flag} {videoLocations[0].country} ({videoLocations[0].pct}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Core Per-Video Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-2xl bg-zinc-900 border border-white/10">
                      <div className="flex items-center gap-1.5 text-white/55 text-[10px] font-bold">
                        <Eye className="w-3.5 h-3.5 text-[#25F4EE]" /> Vues vidéo
                      </div>
                      <div className="text-base font-black text-white mt-1">
                        {formatCompact(videoTotalViews)}
                      </div>
                      <span className="text-[9px] text-emerald-400 font-bold">Cette vidéo</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-900 border border-white/10">
                      <div className="flex items-center gap-1.5 text-white/55 text-[10px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80]" /> Vues 100%
                      </div>
                      <div className="text-base font-black text-[#4ade80] mt-1">
                        {formatCompact(videoFullViewsCount)}
                      </div>
                      <span className="text-[9px] text-white/50 font-bold">
                        {videoFullViewRate}% complet
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-900 border border-white/10">
                      <div className="flex items-center gap-1.5 text-white/55 text-[10px] font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Temps cumulé
                      </div>
                      <div className="text-base font-black text-white mt-1">
                        {videoWatchTimeHours.toLocaleString()} h
                      </div>
                      <span className="text-[9px] text-emerald-400 font-bold">Sur cette vidéo</span>
                    </div>

                    <div
                      onClick={() => setSubTab('profile_visitors')}
                      className="p-3 rounded-2xl bg-zinc-900 border border-[#2563eb]/50 cursor-pointer hover:bg-zinc-800 transition"
                    >
                      <div className="flex items-center gap-1.5 text-[#60a5fa] text-[10px] font-bold">
                        <Users className="w-3.5 h-3.5 text-[#60a5fa]" /> Vues profil liées
                      </div>
                      <div className="text-base font-black text-white mt-1">
                        +{formatCompact(videoProfileVisitsGenerated)}
                      </div>
                      <span className="text-[9px] text-[#25F4EE] font-bold underline">
                        Voir qui a vu →
                      </span>
                    </div>
                  </div>

                  {/* Second-by-Second Retention Curve for THIS video */}
                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-[#25F4EE]" />
                          Courbe de rétention de cette vidéo
                        </h4>
                        <p className="text-[10px] text-white/50">
                          Pourcentage de spectateurs restants seconde par seconde
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                        Vue complète : {videoFullViewRate}%
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-2 h-28 pt-3 px-1">
                      {videoRetentionPoints.map((pt, index) => (
                        <div
                          key={pt.sec}
                          className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
                        >
                          <span className="text-[9px] font-bold text-white/75">
                            {pt.pct}%
                          </span>
                          <div
                            className={`w-full rounded-t-lg transition-all ${
                              index === videoRetentionPoints.length - 1
                                ? 'bg-gradient-to-t from-[#22c55e] to-[#25F4EE] shadow-[0_0_12px_rgba(37,244,238,0.5)]'
                                : 'bg-gradient-to-t from-[#FE2C55]/70 to-[#25F4EE]/80'
                            }`}
                            style={{ height: `${pt.pct}%` }}
                          />
                          <span className="text-[9px] text-white/50 font-mono truncate">
                            {pt.sec}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ---------------------------------------------------------
                  SUB-TAB 2: LOCALISATION GÉOGRAPHIQUE DE CETTE VIDÉO
                 --------------------------------------------------------- */}
              {subTab === 'video_location' && (
                <>
                  {/* Geographic Location Header Card for THIS video */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-[#25F4EE]/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-[#25F4EE]/15 text-[#25F4EE]">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-white">
                            Localisation des spectateurs de cette vidéo
                          </h3>
                          <p className="text-[10px] text-white/55">
                            Pays, villes et taux de vue complète (100%) pour cette vidéo uniquement
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                        {formatCompact(videoTotalViews)} vues
                      </span>
                    </div>

                    {/* Countries List with Views + Full View % for THIS video */}
                    <div className="space-y-2">
                      {videoLocations.map((loc) => {
                        const isSelected = loc.code === selectedTerritory.code;
                        const scaledCountryViews = Math.round(
                          (videoTotalViews * loc.pct) / 100
                        );
                        return (
                          <button
                            key={loc.code}
                            type="button"
                            onClick={() => setSelectedCountryCode(loc.code)}
                            className={`w-full p-2.5 rounded-xl border text-left transition ${
                              isSelected
                                ? 'bg-white/10 border-[#25F4EE] shadow-[0_0_15px_rgba(37,244,238,0.18)]'
                                : 'bg-black/40 border-white/10 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs mb-1">
                              <div className="flex items-center gap-2 font-extrabold text-white">
                                <span className="text-base">{loc.flag}</span>
                                <span>{loc.country}</span>
                                {isSelected && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#25F4EE] text-black font-black">
                                    Villes ↓
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px]">
                                <span className="text-white/65 font-bold">
                                  {formatCompact(scaledCountryViews)} vues
                                </span>
                                <span className="font-black text-[#25F4EE]">{loc.pct}%</span>
                              </div>
                            </div>

                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                              <div
                                className="h-full bg-gradient-to-r from-[#25F4EE] to-[#FE2C55]"
                                style={{ width: `${loc.pct}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-white/50">
                              <span>
                                Vues complètes (100%) sur cette vidéo :{' '}
                                <strong className="text-[#4ade80]">{loc.fullViewRate}%</strong>
                              </span>
                              <span>Top ville : {loc.cities[0]?.name}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cities Breakdown for Selected Country on THIS video */}
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>{selectedTerritory.flag}</span>
                        <span>Villes principales — {selectedTerritory.country}</span>
                      </h4>
                      <span className="text-[10px] font-bold text-[#25F4EE]">
                        Vidéo #{videoIndex + 1}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {selectedTerritory.cities.map((city) => (
                        <div key={city.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/90 font-bold flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-[#FE2C55]" />
                              {city.name}
                            </span>
                            <span className="text-[11px] font-black text-white">
                              {city.pct}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#FE2C55]"
                              style={{ width: `${city.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Traffic Sources for THIS video */}
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-2.5">
                    <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-[#25F4EE]" />
                      Sources de trafic de cette vidéo
                    </h4>
                    <div className="space-y-2">
                      {videoTrafficSources.map((src) => (
                        <div key={src.label} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/85 font-bold">{src.label}</span>
                            <span className="font-black text-white">{src.pct}%</span>
                          </div>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${src.color}`}
                              style={{ width: `${src.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ---------------------------------------------------------
                  SUB-TAB 3: UTILISATEURS QUI ONT VU TON PROFIL ("VUES DU PROFIL")
                 --------------------------------------------------------- */}
              {subTab === 'profile_visitors' && (
                <div className="space-y-3.5">
                  {/* Profile Visitors Overview Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2563eb]/25 via-zinc-900 to-black border border-[#2563eb]/60 shadow-[0_0_25px_rgba(37,99,235,0.2)] space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2563eb]/30 text-[#60a5fa] text-[10px] font-black uppercase tracking-wider border border-blue-400/30">
                          <Eye className="w-3 h-3" />
                          Vues du profil TokVibe (30 derniers jours)
                        </span>
                        <h3 className="text-sm font-black text-white mt-1">
                          Utilisateurs qui ont vu votre profil (@{currentUser.handle})
                        </h3>
                        <p className="text-[11px] text-white/60">
                          Découvrez qui a visité votre profil, depuis quelle ville et quelle vidéo ils ont regardée en entier.
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-black text-[#25F4EE]">1 482</div>
                        <span className="text-[10px] font-extrabold text-[#4ade80]">
                          +34 aujourd'hui
                        </span>
                      </div>
                    </div>

                    {/* 3 KPI boxes for Profile Visitors */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-xl bg-black/50 border border-white/10">
                        <span className="text-[9px] text-white/50 block">Visiteurs uniques</span>
                        <span className="text-xs font-black text-white">946 comptes</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/50 border border-white/10">
                        <span className="text-[9px] text-white/50 block">Après vue 100%</span>
                        <span className="text-xs font-black text-[#4ade80]">87,5% des visites</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/50 border border-white/10">
                        <span className="text-[9px] text-white/50 block">Convertis Abonnés</span>
                        <span className="text-xs font-black text-[#60a5fa]">+28,4% suivent</span>
                      </div>
                    </div>

                    {/* Toggle Historique des vues du profil */}
                    <div className="pt-1 flex items-center justify-between border-t border-white/10 text-xs">
                      <span className="text-[11px] text-white/75 font-bold">
                        Historique des vues du profil (voir qui vous visite)
                      </span>
                      <button
                        type="button"
                        onClick={() => setProfileViewsHistoryEnabled((v) => !v)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black transition ${
                          profileViewsHistoryEnabled
                            ? 'bg-[#22c55e] text-black'
                            : 'bg-zinc-800 text-white/50'
                        }`}
                      >
                        {profileViewsHistoryEnabled ? 'Activé ✓' : 'Désactivé'}
                      </button>
                    </div>
                  </div>

                  {/* Filter pills for Visitors list */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setVisitorFilter('all')}
                        className={`px-3 py-1 rounded-xl text-[10px] font-black transition ${
                          visitorFilter === 'all'
                            ? 'bg-white text-black'
                            : 'bg-zinc-900 text-white/60 border border-white/10'
                        }`}
                      >
                        Tous les visiteurs ({INITIAL_PROFILE_VISITORS.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisitorFilter('full_watcher')}
                        className={`px-3 py-1 rounded-xl text-[10px] font-black transition ${
                          visitorFilter === 'full_watcher'
                            ? 'bg-[#25F4EE] text-black'
                            : 'bg-zinc-900 text-white/60 border border-white/10'
                        }`}
                      >
                        Ont regardé 100% d'une vidéo (
                        {INITIAL_PROFILE_VISITORS.filter((v) => v.watchedFullVideo).length})
                      </button>
                    </div>
                  </div>

                  {/* List of Users who viewed your profile */}
                  {!profileViewsHistoryEnabled ? (
                    <div className="p-6 rounded-2xl bg-zinc-900/70 border border-white/10 text-center space-y-2">
                      <Eye className="w-7 h-7 text-white/30 mx-auto" />
                      <p className="text-xs font-bold text-white">
                        L'historique des vues du profil est désactivé
                      </p>
                      <p className="text-[11px] text-white/50">
                        Activez l'option ci-dessus pour voir la liste des utilisateurs qui ont visité votre profil.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredVisitors.map((visitor) => {
                        const isFollowing = followedAuthorIds.includes(visitor.authorId);
                        return (
                          <div
                            key={visitor.id}
                            className="p-3 rounded-2xl bg-zinc-900/90 border border-white/10 hover:border-[#25F4EE]/40 transition flex items-center justify-between gap-3"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="relative shrink-0">
                                <img
                                  src={visitor.avatar}
                                  alt={visitor.name}
                                  className="w-12 h-12 rounded-full object-cover border border-white/20"
                                />
                                {visitor.verified && (
                                  <span
                                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border border-black shadow"
                                    style={{
                                      background:
                                        'radial-gradient(circle at 35% 35%, #86efac 0%, #22c55e 50%, #15803d 100%)',
                                    }}
                                    title="Visiteur certifié"
                                  >
                                    <Check className="w-2.5 h-2.5 stroke-[4] text-black" />
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-black text-white truncate">
                                    {visitor.name}
                                  </span>
                                  <span className="text-[10px] text-white/45 truncate">
                                    @{visitor.handle}
                                  </span>
                                </div>

                                {/* Location + Visit Time + Visit Count */}
                                <div className="flex items-center gap-2 text-[10px] text-white/70 font-semibold flex-wrap">
                                  <span className="text-[#25F4EE] font-bold">
                                    {visitor.countryFlag} {visitor.cityCountry}
                                  </span>
                                  <span>•</span>
                                  <span className="text-amber-300 font-bold">
                                    {visitor.visitedAt}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded bg-white/10 text-white text-[9px] font-black">
                                    {visitor.visitCount}x vues profil
                                  </span>
                                </div>

                                {/* Video watched info */}
                                {visitor.sourceVideoCaption && (
                                  <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 pt-0.5">
                                    <Sparkles className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{visitor.sourceVideoCaption}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Follow / Blue Abonné Button */}
                            <button
                              type="button"
                              onClick={() => onToggleFollow?.(visitor.authorId)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 shrink-0 transition active:scale-95 ${
                                isFollowing
                                  ? 'bg-[#2563eb] text-white border border-blue-400/60 shadow-[0_0_12px_rgba(37,99,235,0.65)] hover:bg-blue-500'
                                  : 'bg-[#FE2C55] text-white hover:bg-[#FE2C55]/90 shadow-md'
                              }`}
                            >
                              {isFollowing ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Abonné</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3.5 h-3.5" />
                                  <span>Suivre</span>
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
        ) : (
          /* =========================================================
             TAB 2: AUTHENTIC TIKTOK MONETIZATION & CREATOR REWARDS SUITE
             ========================================================= */
          <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 sm:p-4 space-y-4 text-left">
            {/* Monetization Sub-navigation Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-zinc-900/80 rounded-2xl border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setMonetizationSubTab('rewards')}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  monetizationSubTab === 'rewards'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Programme Récompenses</span>
              </button>

              <button
                type="button"
                onClick={() => setMonetizationSubTab('parameters')}
                className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  monetizationSubTab === 'parameters'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Paramètres</span>
              </button>

              <button
                type="button"
                onClick={() => setMonetizationSubTab('payout')}
                className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  monetizationSubTab === 'payout'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Retraits & Solde</span>
              </button>

              <button
                type="button"
                onClick={() => setMonetizationSubTab('rules')}
                className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  monetizationSubTab === 'rules'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Règles TokVibe</span>
              </button>
            </div>

            {/* Notification alert on action */}
            {applySuccessMessage && (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{applySuccessMessage}</span>
              </div>
            )}

            {applyErrorMessage && (
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 shadow-lg">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{applyErrorMessage}</span>
              </div>
            )}

            {/* SUBTAB 1: REWARDS & CRITERIA TRACKER */}
            {monetizationSubTab === 'rewards' && (
              <div className="space-y-4">
                {/* Hero Status Card */}
                <div className="relative p-5 rounded-3xl bg-gradient-to-br from-emerald-950/70 via-zinc-950 to-black border border-emerald-500/40 overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                      Creator Rewards Program • TokVibe Officiel
                    </span>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isFullyEligible
                          ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {isFullyEligible ? (
                        <>
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>5/5 Règles remplies</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>Accès verrouillé ({validatedRulesCount}/5 règles)</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white tracking-tight">
                    Programme de Récompenses pour les Créateurs TokVibe
                  </h3>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">
                    Pour accéder au bouton d'activation de la monétisation TokVibe, vous devez impérativement remplir les <strong>5 règles officielles d'éligibilité</strong> ci-dessous.
                  </p>

                  {/* Warning Banner when not all rules are fulfilled */}
                  {!isFullyEligible && (
                    <div className="mt-3 p-3 rounded-2xl bg-rose-950/50 border border-rose-500/40 flex items-start gap-2.5">
                      <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-rose-200 leading-snug">
                        <span className="font-black text-white block">
                          Accès au bouton Monétisation TokVibe désactivé ({validatedRulesCount}/5 règles remplies)
                        </span>
                        Tant que toutes les règles ne sont pas remplies à 100%, vous ne pouvez pas activer la monétisation TokVibe. Validez chaque règle obligatoire ci-dessous pour débloquer le bouton.
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-white/50 block">Revenu mensuel estimé</span>
                      <span className="text-2xl font-black text-emerald-400 tracking-tight">
                        {formatCurrency(currentUser.walletBalance)}
                      </span>
                    </div>

                    {isMonetizationActive ? (
                      <div className="flex items-center gap-2">
                        <div className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black flex items-center gap-1.5 shadow">
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Monétisation TokVibe Active Définitivement ✓</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyMonetization}
                        disabled={!isFullyEligible}
                        data-keep-white={isFullyEligible ? 'true' : undefined}
                        className={`py-3 px-4 rounded-xl font-black text-xs shadow-lg transition flex items-center justify-center gap-2 ${
                          isFullyEligible
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black active:scale-95 cursor-pointer shadow-emerald-500/25'
                            : 'bg-zinc-900 border border-rose-500/40 text-white/40 opacity-60 cursor-not-allowed select-none'
                        }`}
                      >
                        {isFullyEligible ? (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Activer la Monétisation TokVibe 🚀</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 text-rose-400" />
                            <span>Bouton Monétisation TokVibe Verrouillé ({validatedRulesCount}/5)</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* THE 5 MANDATORY TOKVIBE CRITERIA TRACKER */}
                <div className="p-4 rounded-3xl bg-zinc-950 border border-white/10 space-y-3.5 shadow-xl">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>5 Règles Officielles d'Éligibilité TokVibe</span>
                      </h4>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        Toutes les règles (5/5) doivent être remplies pour déverrouiller le bouton Monétisation TokVibe.
                      </p>
                    </div>
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-full border shrink-0 ${
                        isFullyEligible
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                          : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                      }`}
                    >
                      {validatedRulesCount}/5 Validés
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {/* Critère 1: Avoir au moins 18 ans */}
                    <div
                      onClick={() => {
                        if (isMonetizationActive) return;
                        setRuleAgeConfirmed((v) => !v);
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${
                        isMonetizationActive ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        isAgeEligible
                          ? 'bg-zinc-900/80 border-emerald-500/30'
                          : 'bg-zinc-900/50 border-rose-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isAgeEligible
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}
                        >
                          {isAgeEligible ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block">
                            1. Avoir au moins 18 ans révolus
                          </span>
                          <span className="text-[10px] text-white/50 block">
                            Âge du titulaire : <strong>{isAgeEligible ? `${userAge} ans` : 'Non confirmé'}</strong> (Majorité légale obligatoire)
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border shrink-0 ${
                          isAgeEligible
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {isAgeEligible ? '18 ans ✓' : 'Non rempli ✗'}
                      </span>
                    </div>

                    {/* Critère 2: Avoir 10 000 abonnés (10 miles abonnés) */}
                    <div
                      onClick={() => {
                        if (isMonetizationActive) return;
                        setRuleFollowersConfirmed((v) => !v);
                      }}
                      className={`p-3 rounded-2xl border space-y-2 transition ${
                        isMonetizationActive ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        isFollowersEligible
                          ? 'bg-zinc-900/80 border-emerald-500/30'
                          : 'bg-zinc-900/50 border-rose-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2 rounded-xl shrink-0 ${
                              isFollowersEligible
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-rose-500/15 text-rose-400'
                            }`}
                          >
                            {isFollowersEligible ? (
                              <Users className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block">
                              2. Avoir au moins 10 000 abonnés
                            </span>
                            <span className="text-[10px] text-white/50 block">
                              Actuellement :{' '}
                              <strong>
                                {isFollowersEligible
                                  ? `${userFollowers.toLocaleString()} abonnés`
                                  : '7 500 / 10 000 abonnés'}
                              </strong>
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black border shrink-0 ${
                            isFollowersEligible
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {isFollowersEligible ? '100% ✓' : `${followersProgressPct}% ✗`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFollowersEligible
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${followersProgressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Critère 3: Temps de visionnage & 100 000 vues sur 30 jours */}
                    <div
                      onClick={() => {
                        if (isMonetizationActive) return;
                        setRuleViewsConfirmed((v) => !v);
                      }}
                      className={`p-3 rounded-2xl border space-y-2 transition ${
                        isMonetizationActive ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        isViewsEligible
                          ? 'bg-zinc-900/80 border-emerald-500/30'
                          : 'bg-zinc-900/50 border-rose-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2 rounded-xl shrink-0 ${
                              isViewsEligible
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-rose-500/15 text-rose-400'
                            }`}
                          >
                            {isViewsEligible ? (
                              <Clock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block">
                              3. Cumuler au moins 100 000 vues sur 30 jours
                            </span>
                            <span className="text-[10px] text-white/50 block">
                              Actuellement :{' '}
                              <strong>
                                {isViewsEligible
                                  ? `${totalRecentViews.toLocaleString()} vues (${watchTimeQualifiedHours}h)`
                                  : '68 000 / 100 000 vues'}
                              </strong>
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black border shrink-0 ${
                            isViewsEligible
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {isViewsEligible ? '100% ✓' : `${viewsProgressPct}% ✗`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isViewsEligible
                              ? 'bg-gradient-to-r from-[#25F4EE] to-emerald-400'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${viewsProgressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Critère 4: Vidéos originales de plus de 1 minute (>60s) */}
                    <div
                      onClick={() => {
                        if (isMonetizationActive) return;
                        const next = !ruleLongVideoConfirmed;
                        setRuleLongVideoConfirmed(next);
                        try {
                          localStorage.setItem('tokvibe_rule_long_video', String(next));
                        } catch {}
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${
                        isMonetizationActive ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        isLongVideoEligible
                          ? 'bg-zinc-900/80 border-emerald-500/30'
                          : 'bg-zinc-900/50 border-rose-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isLongVideoEligible
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}
                        >
                          {isLongVideoEligible ? (
                            <Film className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block">
                            4. Contenu original de plus de 1 minute (&gt;60s)
                          </span>
                          <span className="text-[10px] text-white/50 block">
                            {isLongVideoEligible
                              ? 'Vidéos originales de +60s vérifiées sur votre profil'
                              : 'Cliquez pour certifier que vos vidéos font plus de 60 secondes'}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border shrink-0 ${
                          isLongVideoEligible
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {isLongVideoEligible ? 'Validé ✓' : 'À valider ✗'}
                      </span>
                    </div>

                    {/* Critère 5: Respecter et accepter les Règles TokVibe */}
                    <div
                      onClick={() => {
                        if (isMonetizationActive) return;
                        const next = !ruleTokVibeAccepted;
                        setRuleTokVibeAccepted(next);
                        try {
                          localStorage.setItem('tokvibe_rules_accepted', String(next));
                        } catch {}
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${
                        isMonetizationActive ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        communityStandingValid
                          ? 'bg-zinc-900/80 border-emerald-500/30'
                          : 'bg-zinc-900/50 border-rose-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            communityStandingValid
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}
                        >
                          {communityStandingValid ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block">
                            5. Accepter et respecter les Règles TokVibe (0 avertissement)
                          </span>
                          <span className="text-[10px] text-white/50 block">
                            {communityStandingValid
                              ? 'Règles TokVibe acceptées et compte conforme sans infraction'
                              : 'Cliquez pour accepter les Règles TokVibe de monétisation'}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border shrink-0 ${
                          communityStandingValid
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {communityStandingValid ? 'Conforme ✓' : 'À accepter ✗'}
                      </span>
                    </div>
                  </div>

                  {/* Quick button to validate all 5 rules when not yet active (no reset/deactivate allowed once active) */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-white/50">
                      {isMonetizationActive
                        ? 'Programme Monétisation TokVibe activé et verrouillé (réinitialisation et désactivation interdites).'
                        : "Validez les 5 règles d'éligibilité pour débloquer l'activation."}
                    </span>
                    {!isFullyEligible && !isMonetizationActive && (
                      <button
                        type="button"
                        onClick={() => {
                          setRuleAgeConfirmed(true);
                          setRuleFollowersConfirmed(true);
                          setRuleViewsConfirmed(true);
                          setRuleLongVideoConfirmed(true);
                          setRuleTokVibeAccepted(true);
                          try {
                            localStorage.setItem('tokvibe_rule_long_video', 'true');
                            localStorage.setItem('tokvibe_rules_accepted', 'true');
                          } catch {}
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 text-[10px] font-black transition cursor-pointer shrink-0"
                      >
                        ✓ Valider les 5 règles TokVibe
                      </button>
                    )}
                  </div>
                </div>

                {/* RPM CALCULATOR (Simulateur de revenus TokVibe) */}
                <div className="p-4 rounded-3xl bg-zinc-950 border border-white/10 space-y-3.5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span>Calculateur de RPM & Estimation des Gains</span>
                      </h4>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        Simulez vos revenus en fonction du nombre de vues qualifiées et de votre RPM.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-1">
                    {/* Slider 1: Vues mensuelles */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-white/70 font-semibold">Vues qualifiées estimées (&gt; 1 min)</span>
                        <span className="font-black text-[#25F4EE]">{(rpmViewsSlider / 1000).toFixed(0)}k vues</span>
                      </div>
                      <input
                        type="range"
                        min="10000"
                        max="2000000"
                        step="10000"
                        value={rpmViewsSlider}
                        onChange={(e) => setRpmViewsSlider(Number(e.target.value))}
                        className="w-full accent-[#25F4EE] cursor-pointer"
                      />
                    </div>

                    {/* Slider 2: RPM moyen */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-white/70 font-semibold">RPM moyen (Revenu pour 1 000 vues)</span>
                        <span className="font-black text-emerald-400">${rpmRateSlider.toFixed(2)} / 1k</span>
                      </div>
                      <input
                        type="range"
                        min="0.30"
                        max="1.80"
                        step="0.05"
                        value={rpmRateSlider}
                        onChange={(e) => setRpmRateSlider(Number(e.target.value))}
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                    </div>

                    {/* Result Card */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-black border border-emerald-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-white/60 block">Revenu potentiel mensuel</span>
                        <span className="text-xl font-black text-emerald-400 tracking-tight">
                          ${((rpmViewsSlider / 1000) * rpmRateSlider).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-white/40 block">Taux moyen complétion</span>
                        <span className="text-xs font-bold text-white">84.2% complet</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Videos Eligible breakdown */}
                <div className="p-4 rounded-3xl bg-zinc-950 border border-white/10 space-y-2.5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white">
                      Vidéos rémunérées au Programme Récompenses ({videosList.length})
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-bold">RPM moyen: $0.85</span>
                  </div>

                  <div className="space-y-2">
                    {videosList.map((vid, idx) => (
                      <div
                        key={vid.id}
                        onClick={() => {
                          setSelectedVideo(vid);
                          setActiveTab('analytics');
                          setSubTab('video_overview');
                        }}
                        className="flex items-center justify-between p-2 rounded-2xl bg-black/40 border border-white/5 hover:border-emerald-500/40 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={vid.thumbnailUrl || vid.authorAvatar}
                            alt={vid.caption}
                            className="w-10 h-14 rounded-xl object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              Vidéo #{idx + 1} • {vid.caption}
                            </p>
                            <span className="text-[10px] text-white/50 block">
                              {vid.viewsCount.toLocaleString()} vues • &gt; 1 min • 87% vues complètes
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-emerald-400 block">
                            +{formatCurrency(vid.earnings || (vid.viewsCount / 1000) * 0.85)}
                          </span>
                          <span className="text-[9px] text-[#25F4EE] font-bold">Détails →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: PARAMETERS & FEATURES TOGGLES */}
            {monetizationSubTab === 'parameters' && (
              <div className="space-y-3.5">
                <div className="p-4 rounded-3xl bg-zinc-950 border border-white/10 space-y-1">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#25F4EE]" />
                    Paramètres de Monétisation TokVibe
                  </h3>
                  <p className="text-[11px] text-white/50">
                    Activez et personnalisez tous les canaux de monétisation pour vos vidéos et vos directs.
                  </p>
                </div>

                {!isMonetizationActive && (
                  <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-rose-200 leading-snug">
                      <span className="font-black text-white block">
                        Options verrouillées — Monétisation TokVibe non activée ({validatedRulesCount}/5 règles)
                      </span>
                      Vous devez d'abord remplir les 5 règles TokVibe et activer le bouton Monétisation TokVibe dans l'onglet « Programme Récompenses ».
                    </div>
                  </div>
                )}

                <div
                  className={`rounded-3xl bg-zinc-950 border border-white/10 divide-y divide-white/5 overflow-hidden shadow-xl ${
                    !isMonetizationActive ? 'opacity-60 pointer-events-none' : ''
                  }`}
                >
                  {/* Toggle 1: Cadeaux vidéos */}
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2.5 rounded-2xl bg-rose-500/15 text-[#FE2C55] shrink-0">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-white block">
                          Cadeaux sur les Vidéos (Gifts)
                        </span>
                        <span className="text-[10px] text-white/50 block">
                          Permet aux spectateurs d'envoyer des diamants et cadeaux virtuels sous vos vidéos publiques.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!isMonetizationActive}
                      onClick={() => {
                        const next = !enableVideoGifts;
                        setEnableVideoGifts(next);
                        try { localStorage.setItem('tokvibe_monetiz_gifts', String(next)); } catch {}
                      }}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        enableVideoGifts && isMonetizationActive ? 'bg-[#22c55e]' : 'bg-zinc-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          enableVideoGifts && isMonetizationActive ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 2: Pourboires directs */}
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 shrink-0">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-white block">
                          Pourboires directs sur profil (Tips)
                        </span>
                        <span className="text-[10px] text-white/50 block">
                          Affiche un bouton pourboire (1$ à 100$) avec 100% reversé au créateur sans commission.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!isMonetizationActive}
                      onClick={() => {
                        const next = !enableTips;
                        setEnableTips(next);
                        try { localStorage.setItem('tokvibe_monetiz_tips', String(next)); } catch {}
                      }}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        enableTips && isMonetizationActive ? 'bg-[#22c55e]' : 'bg-zinc-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          enableTips && isMonetizationActive ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 3: Abonnements LIVE VIP */}
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2.5 rounded-2xl bg-blue-500/15 text-blue-400 shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-white block">
                          Abonnements LIVE VIP (4,99$/mois)
                        </span>
                        <span className="text-[10px] text-white/50 block">
                          Badges d'abonnés personnalisés, chat exclusif réservé et émojis spéciaux en LIVE.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!isMonetizationActive}
                      onClick={() => {
                        const next = !enableLiveSubs;
                        setEnableLiveSubs(next);
                        try { localStorage.setItem('tokvibe_monetiz_live_subs', String(next)); } catch {}
                      }}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        enableLiveSubs && isMonetizationActive ? 'bg-[#22c55e]' : 'bg-zinc-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          enableLiveSubs && isMonetizationActive ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 4: TokVibe Shop & Affiliation */}
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-white block">
                          TokVibe Shop & Affiliation Créateur
                        </span>
                        <span className="text-[10px] text-white/50 block">
                          Taguer des produits dans vos vidéos et toucher 10% à 25% de commission par vente.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!isMonetizationActive}
                      onClick={() => {
                        const next = !enableShopAffiliate;
                        setEnableShopAffiliate(next);
                        try { localStorage.setItem('tokvibe_monetiz_shop', String(next)); } catch {}
                      }}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        enableShopAffiliate && isMonetizationActive ? 'bg-[#22c55e]' : 'bg-zinc-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          enableShopAffiliate && isMonetizationActive ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 5: Séries Payantes */}
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-400 shrink-0">
                        <Film className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-white block">
                          Séries & Contenus Payants (0,99$ - 49,99$)
                        </span>
                        <span className="text-[10px] text-white/50 block">
                          Créer des collections de vidéos premium réservées aux acheteurs de vos séries.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!isMonetizationActive}
                      onClick={() => {
                        const next = !enablePaywalledSeries;
                        setEnablePaywalledSeries(next);
                        try { localStorage.setItem('tokvibe_monetiz_series', String(next)); } catch {}
                      }}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        enablePaywalledSeries && isMonetizationActive ? 'bg-[#22c55e]' : 'bg-zinc-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          enablePaywalledSeries && isMonetizationActive ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 3: PAYOUT & WALLET */}
            {monetizationSubTab === 'payout' && (
              <div className="space-y-4">
                {/* Balance Card */}
                <div className="relative p-5 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-emerald-500/30 overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-white/60">
                    Solde disponible pour retrait
                  </span>
                  <div className="flex items-baseline justify-between mt-1 mb-4">
                    <div className="text-3xl font-black text-white tracking-tight">
                      {formatCurrency(currentUser.walletBalance)}
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +18.4% ce mois
                    </span>
                  </div>

                  {/* TokVibe Monthly Schedule Notice */}
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex items-start gap-2.5 text-xs text-white/80">
                    <Calendar className="w-4 h-4 text-[#25F4EE] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">Calendrier officiel des versements automatiques</span>
                      <span className="text-[10px] text-white/50 block leading-normal mt-0.5">
                        Les revenus du Programme Récompenses sont clôturés le 1er de chaque mois et versés automatiquement le <strong>15 du mois</strong> via PayPal. Seuil minimum : <strong>10,00$</strong>.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Method configuration (PayPal Officiel TokVibe) + Bouton Valider le paiement PayPal */}
                <div className="p-4 rounded-3xl bg-zinc-950 border border-white/10 space-y-3.5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>Compte de réception des versements PayPal</span>
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black">
                      PayPal Officiel
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-blue-950/30 border border-blue-500/40 flex items-center justify-between gap-3 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black block">Compte PayPal Certifié</span>
                        <span className="text-[10px] text-white/50 block">Versement sécurisé sur votre compte PayPal</span>
                      </div>
                    </div>
                    {payoutSuccess && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black">
                        Validé ✓
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] text-white/60 font-bold block mb-1">
                      Adresse e-mail PayPal associée
                    </label>
                    <input
                      type="email"
                      placeholder="votre.email@paypal.com"
                      value={paypalInput}
                      onChange={(e) => {
                        setPaypalInput(e.target.value);
                        setPaypalError(null);
                      }}
                      className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Error message if invalid email or rules not fulfilled */}
                  {paypalError && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center gap-2 text-rose-300 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{paypalError}</span>
                    </div>
                  )}

                  {/* Success message when PayPal payment is validated */}
                  {paypalValidatedMessage && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center gap-2 text-emerald-300 text-xs font-bold shadow-md">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{paypalValidatedMessage}</span>
                    </div>
                  )}

                  {/* Bouton Valider le paiement PayPal */}
                  <button
                    type="button"
                    onClick={handleValidatePaypalPayment}
                    disabled={isProcessing}
                    data-keep-white="true"
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#0070ba] via-[#1546a0] to-[#003087] hover:brightness-110 text-white font-black text-xs tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {isProcessing
                        ? 'Validation du paiement PayPal en cours...'
                        : currentUser.walletBalance > 0
                        ? `Valider le paiement PayPal (${formatCurrency(currentUser.walletBalance)})`
                        : 'Valider le paiement PayPal'}
                    </span>
                  </button>
                </div>

                {/* Transaction history */}
                <div className="p-4 rounded-3xl bg-zinc-950 border border-white/10 space-y-2 shadow-xl">
                  <span className="text-xs font-black text-white block">
                    Historique des versements PayPal récents
                  </span>
                  <div className="divide-y divide-white/5">
                    {payoutHistory.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white block">{item.title}</span>
                          <span className="text-[10px] text-white/40">{item.date}</span>
                        </div>
                        <span className="font-black text-emerald-400">
                          +{formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 4: OFFICIAL TOKVIBE RULES & GUIDELINES */}
            {monetizationSubTab === 'rules' && (
              <div className="space-y-3.5">
                <div className="p-4 rounded-3xl bg-zinc-950 border border-white/10 space-y-1">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Règles TokVibe & Directives Officielles de Monétisation
                  </h3>
                  <p className="text-[11px] text-white/50">
                    Consultez et acceptez toutes les règles TokVibe régissant la monétisation pour débloquer l'activation de votre compte.
                  </p>
                </div>

                <div className="rounded-3xl bg-zinc-950 border border-white/10 divide-y divide-white/5 overflow-hidden shadow-xl text-xs">
                  <div className="p-4 space-y-1">
                    <h4 className="font-black text-white flex items-center gap-1.5">
                      <span className="text-emerald-400 font-black">1.</span>
                      Qu'est-ce qu'une vue qualifiée ?
                    </h4>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      Une vue est comptabilisée comme qualifiée lorsqu'un spectateur réel visionne votre vidéo originale pendant au moins 5 secondes depuis son fil Pour Toi, sans manipulation artificielle. Les boucles répétées par un même utilisateur ne comptent qu'une seule fois.
                    </p>
                  </div>

                  <div className="p-4 space-y-1">
                    <h4 className="font-black text-white flex items-center gap-1.5">
                      <span className="text-emerald-400 font-black">2.</span>
                      Durée minimale : Vidéos de plus de 1 minute (&gt; 60 secondes)
                    </h4>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      Conformément au Programme de Récompenses TokVibe, seules les vidéos d'une durée strictement supérieure à 60 secondes sont éligibles au versement publicitaire. Les vidéos plus courtes peuvent néanmoins recevoir des cadeaux ou pourboires.
                    </p>
                  </div>

                  <div className="p-4 space-y-1">
                    <h4 className="font-black text-white flex items-center gap-1.5">
                      <span className="text-rose-400 font-black">3.</span>
                      Contenus strictement exclus de la rémunération
                    </h4>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      Les extraits bruts de films, séries, émissions télévisées ou re-téléversements de créateurs tiers sans apport créatif ou commentaire sont exclus pour atteinte aux droits d'auteur. Les contenus contenant du spam, du faux engagement ou des violations des règles communautaires sont immédiatement démonétisés.
                    </p>
                  </div>

                  <div className="p-4 space-y-1">
                    <h4 className="font-black text-white flex items-center gap-1.5">
                      <span className="text-[#25F4EE] font-black">4.</span>
                      Calcul du RPM (Revenu pour 1 000 vues qualifiées)
                    </h4>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      Le RPM varie dynamiquement entre 0,40$ et 1,50$ selon quatre facteurs clés : la région géographique des spectateurs (taux plus élevé pour l'Europe et l'Amérique du Nord), le taux de rétention jusqu'à la fin de la vidéo, et le volume d'interactions positives (likes, commentaires, partages).
                    </p>
                  </div>
                </div>

                {/* Official Acceptance Card for Règles TokVibe */}
                <div className="p-4 rounded-3xl bg-zinc-950 border border-white/10 space-y-3 shadow-xl">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="accept-tokvibe-rules"
                      checked={ruleTokVibeAccepted && ruleLongVideoConfirmed}
                      disabled={isMonetizationActive}
                      onChange={(e) => {
                        if (isMonetizationActive) return;
                        const checked = e.target.checked;
                        setRuleTokVibeAccepted(checked);
                        setRuleLongVideoConfirmed(checked);
                        try {
                          localStorage.setItem('tokvibe_rules_accepted', String(checked));
                          localStorage.setItem('tokvibe_rule_long_video', String(checked));
                        } catch {}
                      }}
                      className="mt-0.5 w-4 h-4 accent-emerald-500 rounded cursor-pointer disabled:opacity-70 disabled:cursor-default"
                    />
                    <label
                      htmlFor="accept-tokvibe-rules"
                      className="text-xs text-white/80 leading-snug cursor-pointer font-semibold"
                    >
                      Je certifie respecter toutes les <strong>Règles TokVibe</strong> ci-dessus (contenu original &gt; 60 secondes, 18 ans révolus, 10 000 abonnés, 100 000 vues qualifiées et 0 infraction).
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setRuleAgeConfirmed(true);
                      setRuleFollowersConfirmed(true);
                      setRuleViewsConfirmed(true);
                      setRuleLongVideoConfirmed(true);
                      setRuleTokVibeAccepted(true);
                      try {
                        localStorage.setItem('tokvibe_rule_long_video', 'true');
                        localStorage.setItem('tokvibe_rules_accepted', 'true');
                      } catch {}
                      setMonetizationSubTab('rewards');
                    }}
                    data-keep-white="true"
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Valider les Règles TokVibe et retourner au Programme</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
