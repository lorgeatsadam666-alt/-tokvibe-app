import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  TrendingUp,
  Play,
  X,
  Sparkles,
  RefreshCw,
  Award,
  Music2,
  ExternalLink,
  Flame,
  ArrowRight,
  Zap,
  Check,
  Hash,
  AtSign,
  User,
  Radio,
  Users,
  UserPlus,
} from 'lucide-react';
import { VideoItem } from '../types';
import { LiveChannel } from './LiveStreamModal';

export interface ChallengeItem {
  id: string;
  title: string;
  hashtag: string;
  trendTopic: string;
  description: string;
  soundIdea: string;
  difficulty: 'Facile' | 'Intermédiaire' | 'Expert';
  potentialViews: string;
  rewardBonus: string;
  category: string;
  searchCitations?: { title: string; url: string }[];
}

interface ExploreTabProps {
  videos: VideoItem[];
  liveChannels?: LiveChannel[];
  followedAuthorIds?: string[];
  onToggleFollow?: (authorId: string) => void;
  onOpenLive?: (hostId?: string) => void;
  onSelectVideo: (videoId: string) => void;
  onSelectCreator: (authorId: string) => void;
  onSelectHashtag?: (hashtag: string) => void;
  onParticipateChallenge?: (challenge: ChallengeItem) => void;
  onSelectSoundForCreate?: (soundTitle: string) => void;
}

type SearchFilterScope = 'all' | 'hashtag' | 'user';

export const ExploreTab: React.FC<ExploreTabProps> = ({
  videos,
  liveChannels = [],
  followedAuthorIds = [],
  onToggleFollow,
  onOpenLive,
  onSelectVideo,
  onSelectCreator,
  onSelectHashtag,
  onParticipateChallenge,
  onSelectSoundForCreate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<SearchFilterScope>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [exploreMode, setExploreMode] = useState<'explore' | 'friends' | 'sounds'>('explore');
  const [friendSearchQuery, setFriendSearchQuery] = useState('');

  // AI Challenges State
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [groundedDate, setGroundedDate] = useState<string>('');
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false);
  const [challengesError, setChallengesError] = useState<string | null>(null);

  // Extract all unique creators and hashtags from videos for autocomplete & quick filtering
  const allCreators = useMemo(() => {
    const map = new Map<
      string,
      {
        authorId: string;
        authorName: string;
        authorHandle: string;
        authorAvatar: string;
        authorVerified?: boolean;
        videoCount: number;
      }
    >();
    videos.forEach((v) => {
      const existing = map.get(v.authorHandle.toLowerCase());
      if (existing) {
        existing.videoCount += 1;
      } else {
        map.set(v.authorHandle.toLowerCase(), {
          authorId: v.authorId,
          authorName: v.authorName,
          authorHandle: v.authorHandle,
          authorAvatar: v.authorAvatar,
          authorVerified: v.authorVerified,
          videoCount: 1,
        });
      }
    });
    return Array.from(map.values());
  }, [videos]);

  // Friends & Followed Creators computations
  const followedCreators = useMemo(() => {
    return allCreators.filter((c) => followedAuthorIds.includes(c.authorId));
  }, [allCreators, followedAuthorIds]);

  const suggestedCreators = useMemo(() => {
    return allCreators.filter((c) => !followedAuthorIds.includes(c.authorId));
  }, [allCreators, followedAuthorIds]);

  const filteredFriends = useMemo(() => {
    if (!friendSearchQuery.trim()) return followedCreators;
    const q = friendSearchQuery.toLowerCase().trim();
    return followedCreators.filter(
      (c) =>
        c.authorName.toLowerCase().includes(q) ||
        c.authorHandle.toLowerCase().includes(q)
    );
  }, [followedCreators, friendSearchQuery]);

  const friendsVideos = useMemo(() => {
    return videos.filter((v) => followedAuthorIds.includes(v.authorId));
  }, [videos, followedAuthorIds]);

  const allHashtags = useMemo(() => {
    const counts = new Map<string, number>();
    videos.forEach((v) => {
      const tagSet = new Set<string>();
      v.tags.forEach((t) => tagSet.add(t.replace(/^#/, '').toLowerCase()));
      const captionMatches = v.caption.match(/#([a-zA-Z0-9_\u00C0-\u017F]+)/g) || [];
      captionMatches.forEach((m) => tagSet.add(m.replace(/^#/, '').toLowerCase()));
      tagSet.forEach((cleanTag) => {
        counts.set(cleanTag, (counts.get(cleanTag) || 0) + 1);
      });
    });
    return Array.from(counts.entries()).map(([tag, count]) => ({
      tag,
      displayTag: `#${tag}`,
      count,
    }));
  }, [videos]);

  // Live counter for trending challenges based on number of videos created under each hashtag
  const [liveVideoIncrements, setLiveVideoIncrements] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVideoIncrements((prev) => {
        const next = { ...prev };
        allHashtags.forEach((h, idx) => {
          const current = next[h.tag] || 0;
          if (Math.random() > 0.3) {
            next[h.tag] = current + (idx % 2 === 0 ? 1 : 3);
          }
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [allHashtags]);

  const fetchChallenges = async () => {
    setIsLoadingChallenges(true);
    setChallengesError(null);
    try {
      const res = await fetch('/api/challenges');
      const data = await res.json();
      if (data && data.challenges) {
        setChallenges(data.challenges);
        setGroundedDate(data.groundedDate || '');
      }
    } catch (err: any) {
      console.warn('Fetch challenges failed:', err);
      setChallengesError('Impossible de charger les défis. Réessayez.');
    } finally {
      setIsLoadingChallenges(false);
    }
  };

  useEffect(() => {
    if (challenges.length === 0) {
      fetchChallenges();
    }
  }, [challenges.length]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Auto-adjust scope if user explicitly types # or @ prefix
    if (value.startsWith('#')) {
      setSearchScope('hashtag');
    } else if (value.startsWith('@')) {
      setSearchScope('user');
    }
  };

  const categories = [
    { id: 'all', label: '🔥 Tout Défiler' },
    { id: 'dance', label: '💃 Danse' },
    { id: 'tech', label: '🤖 Tech & IA' },
    { id: 'food', label: '🍜 Cuisine' },
    { id: 'nature', label: '🌊 Nature' },
    { id: 'art', label: '🎨 Art' },
  ];



  // Normalized query without leading # or @ for flexible matching
  const rawTrimmed = searchQuery.trim().toLowerCase();
  const cleanQuery = rawTrimmed.replace(/^[#@]+/, '');

  // NLP Intent Recognition & Semantic Search Analyzer
  const nlpIntentResult = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || q.startsWith('#') || q.startsWith('@')) return null;

    if (q.includes('cuisine') || q.includes('recette') || q.includes('food') || q.includes('manger') || q.includes('wok') || q.includes('tuto')) {
      return {
        category: 'food',
        suggestedHashtag: '#FoodPorn',
        intentSummary: 'Intention NLP : Recherche de recettes / cuisine rapide (Catégorie: Cuisine)',
      };
    }
    if (q.includes('danse') || q.includes('chore') || q.includes('shuffle') || q.includes('move') || q.includes('drôle') || q.includes('chat')) {
      return {
        category: 'dance',
        suggestedHashtag: '#DanceChallenge',
        intentSummary: 'Intention NLP : Recherche de chorégraphies et vidéos divertissantes (Catégorie: Danse)',
      };
    }
    if (q.includes('tech') || q.includes('futur') || q.includes('ia') || q.includes('cyber') || q.includes('smartphone')) {
      return {
        category: 'tech',
        suggestedHashtag: '#tech',
        intentSummary: 'Intention NLP : Recherche de nouveautés tech et futurisme (Catégorie: Tech)',
      };
    }
    if (q.includes('nature') || q.includes('surf') || q.includes('soleil') || q.includes('mer') || q.includes('drone')) {
      return {
        category: 'nature',
        suggestedHashtag: '#SurfVibe',
        intentSummary: 'Intention NLP : Recherche de paysages naturels et évasion (Catégorie: Nature)',
      };
    }
    if (q.includes('art') || q.includes('cafe') || q.includes('latte') || q.includes('peinture') || q.includes('glow')) {
      return {
        category: 'art',
        suggestedHashtag: '#LatteArt',
        intentSummary: 'Intention NLP : Recherche artistique et créative (Catégorie: Art)',
      };
    }

    return {
      category: null,
      suggestedHashtag: null,
      intentSummary: `Intention NLP analysée : Recherche sémantique pour "${searchQuery}"`,
    };
  }, [searchQuery]);

  // Real-time filtered videos by hashtag, username, or NLP semantic intent
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchesCategory =
        activeCategory === 'all' ||
        v.category === activeCategory ||
        (nlpIntentResult?.category ? v.category === nlpIntentResult.category : false);
      if (!matchesCategory && !cleanQuery) return false;
      if (!cleanQuery) return true;

      // Extract hashtags from tags array + caption
      const captionTags = (v.caption.match(/#([a-zA-Z0-9_\u00C0-\u017F]+)/g) || []).map((t) =>
        t.replace(/^#/, '').toLowerCase()
      );
      const videoHashtags = [
        ...v.tags.map((t) => t.replace(/^#/, '').toLowerCase()),
        ...captionTags,
      ];

      const matchesHashtag = videoHashtags.some((tag) => tag.includes(cleanQuery));
      const matchesUsername =
        v.authorHandle.toLowerCase().includes(cleanQuery) ||
        v.authorName.toLowerCase().includes(cleanQuery);
      const matchesCaption = v.caption.toLowerCase().includes(cleanQuery);
      const matchesNlpCategory = nlpIntentResult?.category ? v.category === nlpIntentResult.category : false;

      if (searchScope === 'hashtag') {
        return matchesHashtag;
      }
      if (searchScope === 'user') {
        return matchesUsername;
      }
      // 'all': matches hashtag, username/handle, caption, or NLP category intent
      return matchesHashtag || matchesUsername || matchesCaption || matchesNlpCategory;
    });
  }, [videos, activeCategory, cleanQuery, searchScope, nlpIntentResult]);

  // Matching creators for live search suggestions
  const matchingCreators = useMemo(() => {
    if (!cleanQuery || searchScope === 'hashtag') return [];
    return allCreators.filter(
      (c) =>
        c.authorHandle.toLowerCase().includes(cleanQuery) ||
        c.authorName.toLowerCase().includes(cleanQuery)
    );
  }, [allCreators, cleanQuery, searchScope]);

  // Matching hashtags for live search suggestions
  const matchingHashtags = useMemo(() => {
    if (!cleanQuery || searchScope === 'user') return [];
    return allHashtags.filter((h) => h.tag.includes(cleanQuery));
  }, [allHashtags, cleanQuery, searchScope]);

  const [playingSoundTitle, setPlayingSoundTitle] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const activeTimeoutsRef = useRef<number[]>([]);

  const stopActiveSound = () => {
    activeOscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
      } catch {}
    });
    activeOscillatorsRef.current = [];
    activeTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
    activeTimeoutsRef.current = [];
  };

  useEffect(() => {
    return () => {
      stopActiveSound();
    };
  }, []);

  const handlePlaySoundPreview = (s: { title: string; author: string; melody?: string }) => {
    if (playingSoundTitle === s.title) {
      stopActiveSound();
      setPlayingSoundTitle(null);
      return;
    }

    // Stop any currently playing sound immediately (TikTok rule: only 1 sound plays at a time)
    stopActiveSound();
    setPlayingSoundTitle(s.title);

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const type = s.melody || 'pop';
        let notes = [440, 554.37, 659.25, 880];
        let oscType: OscillatorType = 'triangle';

        if (type === 'synthwave') {
          notes = [220, 329.63, 440, 523.25, 659.25, 880];
          oscType = 'sawtooth';
        } else if (type === 'afro' || type === 'amapiano') {
          notes = [300, 450, 600, 750, 900, 1050];
          oscType = 'square';
        } else if (type === 'lofi') {
          notes = [261.63, 329.63, 392, 493.88, 523.25];
          oscType = 'sine';
        } else if (type === 'acoustic') {
          notes = [349.23, 440, 523.25, 698.46, 880];
          oscType = 'sine';
        } else if (type === 'bass') {
          notes = [110, 164.81, 220, 329.63];
          oscType = 'sawtooth';
        } else if (type === 'latino') {
          notes = [329.63, 392, 440, 523.25, 659.25, 783.99];
          oscType = 'square';
        } else {
          notes = [440, 493.88, 554.37, 659.25, 880];
          oscType = 'triangle';
        }

        const playLoop = (loopCount = 0) => {
          notes.forEach((freq, idx) => {
            try {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = oscType;
              osc.frequency.value = freq;
              gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.18);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.18 + 0.35);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(ctx.currentTime + idx * 0.18);
              osc.stop(ctx.currentTime + idx * 0.18 + 0.35);
              activeOscillatorsRef.current.push(osc);
            } catch {}
          });

          if (loopCount < 12) {
            const t = window.setTimeout(() => playLoop(loopCount + 1), 1800) as unknown as number;
            activeTimeoutsRef.current.push(t);
          } else {
            setPlayingSoundTitle((prev) => (prev === s.title ? null : prev));
          }
        };

        playLoop(0);
      }
    } catch {
      // Fallback
    }
  };

  const popularSounds = useMemo(() => {
    const soundCounts = new Map<string, { title: string, author: string, count: number, duration?: string, melody?: string }>();
    videos.forEach(v => {
      if (v.musicTitle) {
        const key = `${v.musicTitle}-${v.musicAuthor || 'Artiste TokVibe'}`;
        const current = soundCounts.get(key) || { title: v.musicTitle, author: v.musicAuthor || 'Artiste TokVibe', count: 0, duration: '1:00', melody: 'pop' };
        current.count += 1;
        soundCounts.set(key, current);
      }
    });
    const dynamicSounds = Array.from(soundCounts.values());
    const defaultViralSounds = [
      // 🇫🇷 Artistes Français (FR)
      { title: 'Djadja (Remix Viral TikTok)', author: 'Aya Nakamura', count: 4280, duration: '0:45', melody: 'pop' },
      { title: 'Bella (Acoustic & Club Edit)', author: 'Gims', count: 3120, duration: '1:30', melody: 'synthwave' },
      { title: 'Macarena (Speed Up Bass)', author: 'Damso', count: 2950, duration: '1:00', melody: 'bass' },
      { title: 'Lettre à une femme (Trend Edit)', author: 'Ninho', count: 3840, duration: '1:15', melody: 'amapiano' },
      { title: 'La Terre est ronde (A Cappella)', author: 'Orelsan', count: 1890, duration: '0:45', melody: 'lofi' },
      { title: 'Papaoutai (Electro Vibe Remix)', author: 'Stromae', count: 4120, duration: '1:00', melody: 'synthwave' },

      // 🇺🇸🇬🇧 Artistes Anglais & Américains (US/UK)
      { title: 'Blinding Lights (TikTok Viral Speed)', author: 'The Weeknd', count: 6420, duration: '1:00', melody: 'synthwave' },
      { title: 'Cruel Summer (Eras Tour Live Edit)', author: 'Taylor Swift', count: 5890, duration: '1:30', melody: 'pop' },
      { title: 'bad guy (Bass Boosted Remix)', author: 'Billie Eilish', count: 4710, duration: '0:45', melody: 'bass' },
      { title: 'As It Was (Speed Up Vibe)', author: 'Harry Styles', count: 3920, duration: '0:30', melody: 'acoustic' },
      { title: 'God\'s Plan (TikTok Club Edit)', author: 'Drake', count: 5120, duration: '1:15', melody: 'pop' },
      { title: 'Shape of You (Dancehall Bounce)', author: 'Ed Sheeran', count: 5310, duration: '1:00', melody: 'pop' },
      { title: 'Levitating (Future Disco Mix)', author: 'Dua Lipa', count: 4890, duration: '0:45', melody: 'synthwave' },

      // 🇪🇸🇲🇽 Artistes Espagnols & Latino (ES/LATAM)
      { title: 'DESPECHÁ (Official Dance Mix)', author: 'Rosalía', count: 5340, duration: '0:45', melody: 'latino' },
      { title: 'Tití Me Preguntó (Reggaeton Bounce)', author: 'Bad Bunny', count: 6120, duration: '1:30', melody: 'latino' },
      { title: 'BZRP Music Sessions #53 (Viral Club)', author: 'Shakira & Bizarrap', count: 7230, duration: '1:00', melody: 'pop' },
      { title: 'Todo De Ti (Summer Vibes Edit)', author: 'Rauw Alejandro', count: 4180, duration: '0:45', melody: 'chill' },
      { title: 'PROVENZA (Acoustic Chill Remix)', author: 'Karol G', count: 3750, duration: '1:15', melody: 'acoustic' },
      { title: 'Ella Baila Sola (Corridos Tumbados)', author: 'Peso Pluma', count: 4950, duration: '1:00', melody: 'latino' },

      // 🇰🇷 Artistes Coréens / K-Pop (KR)
      { title: 'Dynamite (Disco Remix TikTok)', author: 'BTS', count: 8150, duration: '1:00', melody: 'pop' },
      { title: 'How You Like That (Dance Challenge)', author: 'BLACKPINK', count: 7840, duration: '0:45', melody: 'synthwave' },
      { title: 'Super Shy (Y2K Club Edit)', author: 'NewJeans', count: 5620, duration: '0:45', melody: 'pop' },

      // 🇳🇬 Artistes Africains / Afrobeat (AFRICA)
      { title: 'Last Last (Afrobeat Bounce)', author: 'Burna Boy', count: 5210, duration: '1:00', melody: 'afro' },
      { title: 'Essence (Chill Vibe Edit)', author: 'Wizkid ft. Tems', count: 4830, duration: '1:15', melody: 'afro' },
      { title: 'Calm Down (TikTok Remix)', author: 'Rema', count: 8940, duration: '0:45', melody: 'afro' },

      // 🇧🇷 Artistes Brésiliens / Samba Funk (BR)
      { title: 'Envolver (Funk Carioca Mix)', author: 'Anitta', count: 4910, duration: '0:45', melody: 'latino' },

      // 🇮🇪🇮🇹 Artistes Européens (EU)
      { title: 'ZITTI E BUONI (Rock Arena Edit)', author: 'Måneskin (Italie)', count: 3620, duration: '1:00', melody: 'bass' },
    ];
    const mergedMap = new Map<string, { title: string; author: string; count: number; duration?: string; melody?: string }>();
    defaultViralSounds.forEach(s => mergedMap.set(s.title, s));
    dynamicSounds.forEach(s => {
      if (!mergedMap.has(s.title)) {
        mergedMap.set(s.title, s);
      }
    });
    return Array.from(mergedMap.values()).sort((a, b) => b.count - a.count);
  }, [videos]);

  const formatViews = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
    return n.toString();
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col overflow-y-auto no-scrollbar pb-24 text-left">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-xl px-4 pt-3 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-4 mb-3 border-b border-white/10 pb-1">
          <button
            type="button"
            onClick={() => setExploreMode('explore')}
            className={`px-2 pb-1 text-xs font-black transition ${
              exploreMode === 'explore'
                ? 'text-white border-b-2 border-[#22c55e]'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Explorer
          </button>
          <button
            type="button"
            onClick={() => setExploreMode('friends')}
            className={`px-2 pb-1 text-xs font-black transition flex items-center gap-1.5 ${
              exploreMode === 'friends'
                ? 'text-white border-b-2 border-[#25F4EE]'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Amis</span>
            {followedCreators.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#25F4EE]/20 text-[#25F4EE] font-black">
                {followedCreators.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setExploreMode('sounds')}
            className={`px-2 pb-1 text-xs font-black transition ${
              exploreMode === 'sounds'
                ? 'text-white border-b-2 border-[#FE2C55]'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Sons
          </button>
        </div>
        
        {exploreMode === 'explore' && (
        <>
        {/* Real-Time Search Input Bar */}
        <div className="relative flex items-center mb-2">
          <Search className="absolute left-3.5 w-4 h-4 text-[#22c55e] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={
              searchScope === 'hashtag'
                ? 'Filtrer par #hashtag (ex: #tech, #dance, #food)...'
                : searchScope === 'user'
                ? 'Filtrer par @utilisateur (ex: @tokyo_neon, @chef)...'
                : 'Rechercher par #hashtag ou @nom d’utilisateur...'
            }
            className="w-full bg-zinc-900/95 border border-white/15 text-white placeholder-white/45 text-xs rounded-full py-2.5 pl-10 pr-20 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition"
          />

          {/* Quick # and @ insert/filter buttons inside the search bar */}
          <div className="absolute right-2 flex items-center gap-1">
            {!searchQuery && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSearchScope('hashtag');
                    setSearchQuery('#');
                  }}
                  title="Rechercher un #hashtag"
                  className="px-2 py-1 rounded-full bg-white/10 hover:bg-[#25F4EE]/20 text-[10px] font-black text-[#25F4EE] transition"
                >
                  #Tag
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchScope('user');
                    setSearchQuery('@');
                  }}
                  title="Rechercher un @utilisateur"
                  className="px-2 py-1 rounded-full bg-white/10 hover:bg-[#22c55e]/20 text-[10px] font-black text-[#4ade80] transition"
                >
                  @User
                </button>
              </>
            )}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchScope('all');
                }}
                className="p-1 rounded-full bg-white/10 text-white/70 hover:text-white transition"
                title="Effacer la recherche"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* NLP Intent Recognition Banner */}
        {nlpIntentResult && searchQuery.trim() !== '' && (
          <div className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between mb-2 animate-fade-in">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">{nlpIntentResult.intentSummary}</span>
            </div>
            <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-black shrink-0 ml-2">
              NLP AI Match
            </span>
          </div>
        )}

        {/* Search Filter Scope Pills: Tout | # Hashtags | @ Utilisateurs */}
        <div className="flex items-center gap-1.5 mb-2">
          <button
            type="button"
            onClick={() => setSearchScope('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 transition ${
              searchScope === 'all'
                ? 'bg-[#22c55e] text-black shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                : 'bg-zinc-900 text-white/70 border border-white/10 hover:text-white'
            }`}
          >
            <Search className="w-3 h-3" />
            <span>Tout</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchScope('hashtag')}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 transition ${
              searchScope === 'hashtag'
                ? 'bg-[#25F4EE] text-black shadow-[0_0_10px_rgba(37,244,238,0.4)]'
                : 'bg-zinc-900 text-white/70 border border-white/10 hover:text-white'
            }`}
          >
            <Hash className="w-3 h-3" />
            <span>Hashtags</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchScope('user')}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 transition ${
              searchScope === 'user'
                ? 'bg-[#FE2C55] text-white shadow-[0_0_10px_rgba(254,44,85,0.4)]'
                : 'bg-zinc-900 text-white/70 border border-white/10 hover:text-white'
            }`}
          >
            <AtSign className="w-3 h-3" />
            <span>Utilisateurs</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveCategory('dance');
              setSearchScope('hashtag');
              setSearchQuery('#dance');
            }}
            className="px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 transition bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-[0_0_10px_rgba(236,72,153,0.4)] hover:opacity-90 active:scale-95"
            title="Afficher instantanément les danses et défis dance"
          >
            <span>💃 Danses</span>
          </button>
        </div>

        {/* Categories Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                activeCategory === c.id
                  ? 'bg-white text-black shadow-md'
                  : 'bg-zinc-900 text-white/70 hover:bg-zinc-800 border border-white/5'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        </>
        )}
      </div>

      {/* SINGLE UNIFIED VERTICAL SCROLLABLE LIST: Public LIVEs + Filtered Videos + Daily AI Challenges */}
      <div className="flex flex-col">
        {exploreMode === 'sounds' && (
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-white">Musiques Populaires • Artistes du Monde entier 🌍</h2>
                <p className="text-xs text-white/50">Explorez les tubes internationaux (FR, US, Latino, K-Pop, Afro...) et filmez en direct.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {popularSounds.map((s, i) => {
                const isPlaying = playingSoundTitle === s.title;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900 border border-white/10 hover:border-[#25F4EE]/50 transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handlePlaySoundPreview(s)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg shrink-0 transition shadow-md ${
                          isPlaying ? 'bg-[#25F4EE] text-black animate-pulse' : 'bg-gradient-to-tr from-[#25F4EE] to-rose-500 hover:scale-105'
                        }`}
                        title={isPlaying ? "Mettre en pause l'extrait" : "Écouter l'extrait audio"}
                      >
                        {isPlaying ? '⏸️' : '▶️'}
                      </button>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-white truncate group-hover:text-[#25F4EE] transition">{s.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-black text-[#25F4EE]">⏱️ {(s as any).duration || '1:00'}</span>
                          <p className="text-[10px] text-white/50 truncate">{s.author} • {s.count} vidéos</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectSoundForCreate?.(s.title)}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] hover:opacity-95 text-white font-extrabold text-[11px] shrink-0 flex items-center gap-1 shadow transition active:scale-95"
                      title="Ouvrir la caméra avec ce son"
                    >
                      <span>Filmer 📸</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* TAB AMIS (FRIENDS LIST IN GLOBAL) */}
        {exploreMode === 'friends' && (
          <div className="px-4 py-4 space-y-5 animate-fade-in">
            {/* Header with Title and Counter */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#25F4EE]" />
                  Liste de vos Amis
                </h2>
                <p className="text-xs text-white/60">
                  {followedCreators.length} ami{followedCreators.length > 1 ? 's' : ''} suivi{followedCreators.length > 1 ? 's' : ''} • Restez connecté avec vos créateurs
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#25F4EE]/10 border border-[#25F4EE]/30 text-[#25F4EE] text-xs font-black">
                {followedCreators.length} Abonnés
              </span>
            </div>

            {/* Friends Search Input */}
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-white/40 pointer-events-none" />
              <input
                type="text"
                value={friendSearchQuery}
                onChange={(e) => setFriendSearchQuery(e.target.value)}
                placeholder="Rechercher parmi vos amis..."
                className="w-full bg-zinc-900 border border-white/10 text-white placeholder-white/40 text-xs rounded-full py-2.5 pl-10 pr-9 focus:outline-none focus:border-[#25F4EE] focus:ring-1 focus:ring-[#25F4EE]/40 transition"
              />
              {friendSearchQuery && (
                <button
                  type="button"
                  onClick={() => setFriendSearchQuery('')}
                  className="absolute right-3 p-1 text-white/50 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Online Friends Activity & Live Stories */}
            {followedCreators.length > 0 && (
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-white/50 mb-2.5">
                  En ligne & Activité
                </h3>
                <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                  {followedCreators.map((friend) => {
                    const hasLive = liveChannels.some((l) => l.hostId === friend.authorId);
                    return (
                      <button
                        key={friend.authorId}
                        type="button"
                        onClick={() => {
                          if (hasLive && onOpenLive) {
                            onOpenLive(friend.authorId);
                          } else {
                            onSelectCreator(friend.authorId);
                          }
                        }}
                        className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition-transform"
                      >
                        <div
                          className={`relative p-0.5 rounded-full ${
                            hasLive
                              ? 'bg-gradient-to-tr from-[#FE2C55] to-[#25F4EE] animate-pulse'
                              : 'bg-gradient-to-tr from-[#22c55e] to-[#25F4EE]'
                          }`}
                        >
                          <img
                            src={friend.authorAvatar}
                            alt={friend.authorName}
                            className="w-14 h-14 rounded-full object-cover border-2 border-black"
                          />
                          {hasLive ? (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-[#FE2C55] text-white text-[9px] font-black rounded-full uppercase tracking-tighter shadow-sm">
                              LIVE
                            </span>
                          ) : (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#22c55e] border-2 border-black" />
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-white/90 truncate max-w-[70px]">
                          {friend.authorName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Friends List Cards */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-white/50">
                Vos Amis ({filteredFriends.length})
              </h3>

              {filteredFriends.length === 0 ? (
                <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10 text-center space-y-2">
                  <User className="w-10 h-10 text-white/30 mx-auto" />
                  <p className="text-sm font-bold text-white/80">
                    {friendSearchQuery
                      ? 'Aucun ami trouvé pour cette recherche'
                      : "Vous ne suivez pas encore d'amis"}
                  </p>
                  <p className="text-xs text-white/50">
                    {friendSearchQuery
                      ? 'Essayez un autre mot-clé.'
                      : 'Explorez les suggestions ci-dessous pour ajouter vos premiers créateurs et amis !'}
                  </p>
                </div>
              ) : (
                filteredFriends.map((friend) => {
                  const friendLatestVideo = videos.find((v) => v.authorId === friend.authorId);
                  const isLive = liveChannels.some((l) => l.hostId === friend.authorId);

                  return (
                    <div
                      key={friend.authorId}
                      className="p-3 rounded-2xl bg-zinc-900/80 border border-white/10 hover:border-white/20 transition flex items-center justify-between gap-3"
                    >
                      <div
                        className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                        onClick={() => onSelectCreator(friend.authorId)}
                      >
                        <div className="relative shrink-0">
                          <img
                            src={friend.authorAvatar}
                            alt={friend.authorName}
                            className="w-12 h-12 rounded-full object-cover border border-white/20"
                          />
                          {isLive && (
                            <span className="absolute -bottom-1 -right-1 px-1 bg-[#FE2C55] text-white text-[8px] font-black rounded-full animate-pulse">
                              LIVE
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white truncate">
                              {friend.authorName}
                            </span>
                            {friend.authorVerified && (
                              <span className="text-[10px] text-[#25F4EE]">✓</span>
                            )}
                          </div>
                          <p className="text-xs text-white/50 truncate">
                            @{friend.authorHandle} • {friend.videoCount} vidéo{friend.videoCount > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {friendLatestVideo && (
                          <button
                            type="button"
                            onClick={() => onSelectVideo(friendLatestVideo.id)}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 text-xs font-bold"
                            title="Regarder la dernière vidéo"
                          >
                            <Play className="w-3.5 h-3.5 text-[#22c55e] fill-current" />
                          </button>
                        )}

                        {onToggleFollow && (
                          <button
                            type="button"
                            onClick={() => onToggleFollow(friend.authorId)}
                            className="px-3 py-1.5 rounded-xl text-xs font-extrabold transition bg-zinc-800 text-white/80 hover:bg-zinc-700 hover:text-white border border-white/10 active:scale-95"
                          >
                            Abonné
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Suggested Friends to Add */}
            {suggestedCreators.length > 0 && (
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#22c55e]" />
                    Suggestions d'amis à découvrir
                  </h3>
                  <span className="text-[11px] text-white/40">Recommandé</span>
                </div>

                <div className="space-y-2">
                  {suggestedCreators.slice(0, 5).map((creator) => (
                    <div
                      key={creator.authorId}
                      className="p-3 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/15 transition flex items-center justify-between gap-3"
                    >
                      <div
                        className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                        onClick={() => onSelectCreator(creator.authorId)}
                      >
                        <img
                          src={creator.authorAvatar}
                          alt={creator.authorName}
                          className="w-11 h-11 rounded-full object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate">
                              {creator.authorName}
                            </span>
                            {creator.authorVerified && (
                              <span className="text-[10px] text-[#25F4EE]">✓</span>
                            )}
                          </div>
                          <p className="text-[11px] text-white/40 truncate">
                            @{creator.authorHandle} • {creator.videoCount} vidéo{creator.videoCount > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {onToggleFollow && (
                        <button
                          type="button"
                          onClick={() => onToggleFollow(creator.authorId)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-black transition bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white shadow-[0_0_10px_rgba(254,44,85,0.3)] active:scale-95 flex items-center gap-1 shrink-0"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Suivre</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends Videos Grid */}
            {friendsVideos.length > 0 && (
              <div className="pt-3 space-y-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                  <Play className="w-3 h-3 text-[#25F4EE]" />
                  Dernières vidéos de vos amis
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {friendsVideos.slice(0, 6).map((vid) => (
                    <div
                      key={vid.id}
                      onClick={() => onSelectVideo(vid.id)}
                      className="relative aspect-[9/16] rounded-xl overflow-hidden bg-zinc-900 border border-white/10 cursor-pointer group"
                    >
                      <img
                        src={vid.thumbnailUrl || vid.authorAvatar}
                        alt={vid.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
                        <span className="text-[10px] font-bold text-white truncate">
                          @{vid.authorHandle}
                        </span>
                        <span className="text-[9px] text-white/70 flex items-center gap-1">
                          ❤️ {vid.likesCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {exploreMode === 'explore' && (
        <>
        {/* Live Matching Creators & Hashtags when user is typing */}
        {cleanQuery && (matchingCreators.length > 0 || matchingHashtags.length > 0) && (
          <div className="px-4 pt-3 pb-1 space-y-2.5 border-b border-white/10 bg-zinc-950/60">
            {/* Matching Users Row */}
            {matchingCreators.length > 0 && (
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-white/50 mb-1.5 flex items-center gap-1">
                  <User className="w-3 h-3 text-[#FE2C55]" />
                  <span>Utilisateurs correspondants ({matchingCreators.length})</span>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {matchingCreators.map((creator) => (
                    <button
                      key={creator.authorHandle}
                      type="button"
                      onClick={() => {
                        setSearchScope('user');
                        setSearchQuery(`@${creator.authorHandle}`);
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-zinc-900 border border-white/10 hover:border-[#FE2C55]/60 shrink-0 transition active:scale-95"
                    >
                      <img
                        src={creator.authorAvatar}
                        alt={creator.authorName}
                        className="w-7 h-7 rounded-full object-cover border border-white/20"
                      />
                      <div className="text-left">
                        <div className="text-xs font-extrabold text-white flex items-center gap-1">
                          <span>{creator.authorName}</span>
                          {creator.authorVerified && (
                            <span
                              className="inline-flex items-center justify-center w-3 h-3 rounded-full"
                              style={{
                                background:
                                  'radial-gradient(circle at 35% 35%, #86efac 0%, #22c55e 55%, #15803d 100%)',
                              }}
                            >
                              <Check className="w-2 h-2 stroke-[4] text-black" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-white/50">
                          {creator.authorName} • {creator.videoCount}{' '}
                          {creator.videoCount > 1 ? 'vidéos' : 'vidéo'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Hashtags Row */}
            {matchingHashtags.length > 0 && (
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-white/50 mb-1.5 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-[#25F4EE]" />
                  <span>Hashtags correspondants ({matchingHashtags.length})</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {matchingHashtags.map((h) => (
                    <button
                      key={h.tag}
                      type="button"
                      onClick={() => {
                        setSearchScope('hashtag');
                        setSearchQuery(`#${h.tag}`);
                      }}
                      className="px-2.5 py-1 rounded-full bg-[#25F4EE]/15 border border-[#25F4EE]/40 text-xs font-extrabold text-[#25F4EE] flex items-center gap-1 shrink-0 hover:bg-[#25F4EE]/25 transition active:scale-95"
                    >
                      <span>{h.displayTag}</span>
                      <span className="text-[10px] text-white/60">({h.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Default Quick Filter Strip: Public LIVEs, Hashtags Tendances & Créateurs Populaires */}
        {!cleanQuery && activeCategory === 'all' && (
          <div className="px-4 pt-3 pb-2 space-y-3">
            {/* Public LIVE Streams on TokVibe (Signal LIVE on profile photos) */}
            {liveChannels.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#FE2C55] animate-pulse" />
                    <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-white">
                      En Direct Public sur TokVibe
                    </h3>
                  </div>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                  {liveChannels.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => onOpenLive?.(ch.hostId)}
                      className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition"
                    >
                      <div className="relative">
                        <span className="absolute -inset-0.5 rounded-full border-2 border-[#FE2C55] animate-ping opacity-70 pointer-events-none" />
                        <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#FE2C55] via-rose-500 to-amber-500 shadow-[0_0_15px_rgba(254,44,85,0.8)]">
                          <img
                            src={ch.hostAvatar}
                            alt={ch.hostName}
                            className="w-full h-full rounded-full object-cover border-2 border-black"
                          />
                        </div>
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-[#FE2C55] text-[8px] font-black uppercase text-white ring-1 ring-black shadow">
                          LIVE
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold text-white max-w-[68px] truncate">
                        @{ch.hostHandle}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Hashtags */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-[#25F4EE]" />
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-white/80">
                  Filtrer par #Hashtag
                </h3>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
                {allHashtags.map((h) => (
                  <button
                    key={h.tag}
                    type="button"
                    onClick={() => {
                      setSearchScope('hashtag');
                      setSearchQuery(`#${h.tag}`);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-zinc-900 border border-white/10 hover:border-[#25F4EE]/50 transition shrink-0 active:scale-95 text-left"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#25F4EE]/20 text-[#25F4EE] flex items-center justify-center text-xs font-black">
                      #
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{h.displayTag}</div>
                      <div className="text-[10px] text-white/45">
                        {h.count} {h.count > 1 ? 'vidéos' : 'vidéo'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Creators */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AtSign className="w-3.5 h-3.5 text-[#22c55e]" />
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-white/80">
                  Filtrer par @Utilisateur
                </h3>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
                {allCreators.map((creator) => (
                  <button
                    key={creator.authorHandle}
                    type="button"
                    onClick={() => {
                      setSearchScope('user');
                      setSearchQuery(`@${creator.authorHandle}`);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-zinc-900 border border-white/10 hover:border-[#22c55e]/50 transition shrink-0 active:scale-95 text-left"
                  >
                    <img
                      src={creator.authorAvatar}
                      alt={creator.authorName}
                      className="w-6 h-6 rounded-full object-cover border border-white/20"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <span>{creator.authorName}</span>
                        {creator.authorVerified && (
                          <span
                            className="inline-flex items-center justify-center w-3 h-3 rounded-full"
                            style={{
                              background:
                                'radial-gradient(circle at 35% 35%, #86efac 0%, #22c55e 55%, #15803d 100%)',
                            }}
                          >
                            <Check className="w-2 h-2 stroke-[4] text-black" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-white/45">{creator.authorHandle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Count & Active Filter Summary */}
        <div className="px-4 py-2 flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Flame className="w-3.5 h-3.5 text-[#FE2C55]" />
            <span className="font-bold text-white">
              {filteredVideos.length} {filteredVideos.length > 1 ? 'vidéos trouvées' : 'vidéo trouvée'}
            </span>
            {cleanQuery && (
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-[#4ade80]">
                {searchScope === 'hashtag'
                  ? `Hashtag : #${cleanQuery}`
                  : searchScope === 'user'
                  ? `Utilisateur : @${cleanQuery}`
                  : `Recherche : "${searchQuery}"`}
              </span>
            )}
          </div>
          {(searchQuery || activeCategory !== 'all' || searchScope !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchScope('all');
                setActiveCategory('all');
              }}
              className="text-[#25F4EE] font-bold hover:underline shrink-0"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Empty State if no videos match */}
        {filteredVideos.length === 0 ? (
          <div className="mx-4 my-4 p-8 rounded-3xl bg-zinc-900/60 border border-white/10 flex flex-col items-center justify-center text-center">
            <Search className="w-10 h-10 text-white/30 mb-2" />
            <p className="text-sm font-extrabold text-white">
              Aucune vidéo trouvée pour « {searchQuery} »
            </p>
            <p className="text-xs text-white/50 mt-1 max-w-xs">
              Essayez un autre #hashtag (ex: #tech, #dance) ou un autre @nom d&apos;utilisateur.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchScope('all');
                setActiveCategory('all');
              }}
              className="mt-4 px-4 py-2 rounded-full bg-[#22c55e] text-black text-xs font-extrabold hover:opacity-95 transition active:scale-95"
            >
              Afficher toutes les vidéos
            </button>
          </div>
        ) : (
          /* 2-Column Responsive Video Grid */
          <div className="grid grid-cols-2 gap-2.5 px-3">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video.id)}
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-[#22c55e]/50 cursor-pointer shadow-lg active:scale-98 transition"
              >
                <img
                  src={video.thumbnailUrl || video.authorAvatar}
                  alt={video.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent pointer-events-none" />

                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white font-semibold border border-white/10">
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>{formatViews(video.viewsCount)}</span>
                </div>

                <div className="absolute bottom-2.5 inset-x-2.5 text-left flex flex-col gap-1.5">
                  {/* Clickable Hashtags Chips on Card */}
                  <div className="flex flex-wrap gap-1">
                    {video.tags.slice(0, 3).map((tag) => {
                      const normalizedTag = tag.replace(/^#/, '');
                      const isMatched =
                        cleanQuery !== '' &&
                        normalizedTag.toLowerCase().includes(cleanQuery);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchScope('hashtag');
                            setSearchQuery(`#${normalizedTag}`);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold transition ${
                            isMatched
                              ? 'bg-[#25F4EE] text-black shadow'
                              : 'bg-black/60 text-[#25F4EE] border border-white/10 hover:bg-black/80'
                          }`}
                        >
                          #{normalizedTag}
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-xs font-medium text-white line-clamp-2 leading-snug drop-shadow-md pointer-events-none">
                    {video.caption}
                  </p>

                  {/* Clickable Creator Username & Handle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchScope('user');
                      setSearchQuery(`@${video.authorHandle}`);
                    }}
                    title={`Filtrer les vidéos de @${video.authorHandle}`}
                    className="flex items-center gap-1.5 pt-0.5 text-left group/author"
                  >
                    <img
                      src={video.authorAvatar}
                      alt={video.authorName}
                      className="w-5 h-5 rounded-full object-cover border border-white/20 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-extrabold text-white truncate flex items-center gap-1 group-hover/author:text-[#4ade80]">
                        <span className="truncate">{video.authorName}</span>
                        {video.authorVerified && (
                          <span
                            className="relative inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-emerald-300/80 shrink-0"
                            style={{
                              background:
                                'radial-gradient(circle at 35% 35%, #86efac 0%, #22c55e 50%, #15803d 85%, #052e16 100%)',
                            }}
                            title="Compte certifié"
                          >
                            <Check className="w-2 h-2 stroke-[4] text-black" />
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-white/55 truncate">
                        {video.authorName}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TENDANCES DU MOMENT: Live counter for challenges based on number of videos created under each hashtag */}
        <div className="p-4 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FE2C55] animate-ping" />
              <h3 className="text-xs font-black tracking-wider uppercase text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#FE2C55]" />
                <span>Tendances du moment & Défis Actifs</span>
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Compteur Direct
            </span>
          </div>
          <p className="text-[11px] text-white/60">
            Suivez en temps réel le nombre de vidéos créées sous chaque hashtag et participez aux défis viraux.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {allHashtags.slice(0, 4).map((h, idx) => {
              const liveExtra = liveVideoIncrements[h.tag] || 0;
              const effectiveVideoCount = h.count + liveExtra;

              const tagVideos = videos.filter((v) => {
                const tagSet = new Set([
                  ...v.tags.map((t) => t.replace(/^#/, '').toLowerCase()),
                  ...((v.caption.match(/#([a-zA-Z0-9_\u00C0-\u017F]+)/g) || []).map((t) =>
                    t.replace(/^#/, '').toLowerCase()
                  )),
                ]);
                return tagSet.has(h.tag);
              });
              const totalViews = tagVideos.reduce((acc, v) => acc + (v.viewsCount || 0), 0) + (liveExtra * 1450);

              return (
                <div
                  key={h.tag}
                  onClick={() => {
                    setSearchScope('hashtag');
                    setSearchQuery(h.displayTag);
                  }}
                  className="group relative p-3 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 hover:border-[#FE2C55]/50 transition cursor-pointer shadow-md flex flex-col justify-between"
                >
                  <div className="absolute top-2 right-2 text-[10px] font-black text-[#FE2C55]">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#FE2C55] to-[#25F4EE] text-black flex items-center justify-center text-xs font-black mb-1.5 shadow">
                      #
                    </div>
                    <h4 className="text-xs font-black text-white group-hover:text-[#25F4EE] transition truncate">
                      {h.displayTag}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold animate-pulse">
                        🔴 {effectiveVideoCount} vidéos
                      </span>
                    </div>
                    <p className="text-[10px] text-white/45 mt-1">
                      {formatViews(totalViews)} vues globales
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] font-extrabold text-[#25F4EE]">
                    <span>Participer au défi</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DAILY AI CHALLENGES IN THE SAME SINGLE SCROLLABLE LIST */}
        <div className="p-4 pt-6 space-y-4">
          <div className="relative p-4 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-[#25F4EE]/30 overflow-hidden shadow-xl">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#25F4EE]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#25F4EE] animate-ping" />
                <span className="text-[11px] font-black tracking-wider uppercase text-[#25F4EE]">
                  Défis du Jour IA • Google Search
                </span>
              </div>
              <button
                type="button"
                onClick={fetchChallenges}
                disabled={isLoadingChallenges}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white transition disabled:opacity-50 active:scale-95"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingChallenges ? 'animate-spin' : ''}`} />
                <span>Régénérer</span>
              </button>
            </div>

            <h2 className="text-base font-black text-white leading-tight">
              Défis Viraux Quotidiens TokVibe
            </h2>
            <p className="text-xs text-white/70 mt-1 leading-relaxed">
              Idées de vidéos courtes générées chaque jour à partir des tendances actuelles.
            </p>

            {groundedDate && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/60">
                <span>🗓️ Mis à jour le : {groundedDate}</span>
              </div>
            )}
          </div>

          {isLoadingChallenges && (
            <div className="py-8 flex flex-col items-center justify-center text-center text-white/60">
              <div className="w-10 h-10 rounded-full border-2 border-[#25F4EE] border-t-transparent animate-spin mb-2" />
              <span className="text-xs font-bold text-white">Chargement des défis du jour...</span>
            </div>
          )}

          {challengesError && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {challengesError}
            </div>
          )}

          {!isLoadingChallenges &&
            challenges.map((challenge, index) => (
              <div
                key={challenge.id || index}
                className="p-4 rounded-3xl bg-zinc-900/90 border border-white/10 hover:border-[#25F4EE]/40 transition shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      {challenge.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchScope('hashtag');
                        setSearchQuery(challenge.hashtag);
                      }}
                      className="inline-block text-xs font-black text-[#25F4EE] hover:text-[#FE2C55] mt-0.5 transition active:scale-95"
                    >
                      {challenge.hashtag}
                    </button>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      challenge.difficulty === 'Facile'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : challenge.difficulty === 'Intermédiaire'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {challenge.difficulty}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-white/80 flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                      Tendance Détectée
                    </span>
                    <p className="mt-0.5 leading-snug">{challenge.trendTopic}</p>
                    {challenge.searchCitations && challenge.searchCitations.length > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-[#25F4EE]">
                        <ExternalLink className="w-3 h-3" />
                        <a
                          href={challenge.searchCitations[0].url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline truncate max-w-[200px]"
                        >
                          {challenge.searchCitations[0].title}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-white/90 leading-relaxed">{challenge.description}</p>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5 text-[11px]">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 text-white/80">
                    <Music2 className="w-3 h-3 text-[#25F4EE]" />
                    <span className="truncate max-w-[150px]">{challenge.soundIdea}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                    <Award className="w-3 h-3" />
                    <span>{challenge.rewardBonus}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-800 text-white/60">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>{challenge.potentialViews} vues</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => onParticipateChallenge?.(challenge)}
                    className="flex-1 py-2 px-3 rounded-2xl bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] hover:opacity-95 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Participer à ce Défi
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectHashtag?.(challenge.hashtag)}
                    className="py-2 px-3 rounded-2xl bg-zinc-800 hover:bg-zinc-750 text-white/80 text-xs font-semibold flex items-center justify-center gap-1 transition active:scale-95"
                    title="Voir les vidéos de ce hashtag"
                  >
                    <span>Vidéos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </>
      )}
      </div>
    </div>
  );
};
