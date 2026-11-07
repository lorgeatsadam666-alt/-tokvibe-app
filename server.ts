import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

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

// Fallback high-quality trending challenges with search citations
const DEFAULT_CHALLENGES: ChallengeItem[] = [
  {
    id: 'ch-1',
    title: '⚡ Cyber Transition 2026',
    hashtag: '#CyberTransition',
    trendTopic: 'IA générative et mode cyberpunk virale sur TikTok & Google Trends',
    description: 'Enregistrez un plan ordinaire de votre tenue ou bureau, puis clignez des yeux pour basculer en mode néon futuriste avec le filtre Cyberpunk.',
    soundIdea: 'Nightcall (Synthwave Speed Up Bass Boost)',
    difficulty: 'Facile',
    potentialViews: '1.4M+',
    rewardBonus: '+25% de RPM créateur',
    category: 'tech',
    searchCitations: [
      { title: 'Google Trends: Tendances Vidéos Cyberpunk & Effets IA', url: 'https://trends.google.fr' },
    ],
  },
  {
    id: 'ch-2',
    title: '🍳 Wok Hei Flame Challenge',
    hashtag: '#WokFlame',
    trendTopic: 'Explosion des recettes street-food asiatiques et techniques au feu vif',
    description: 'Montrez l\'ingrédient secret avant de lancer la flamme dans la poêle ou au wok. Utilisez le ralenti (slow-mo) au moment du flambage.',
    soundIdea: 'Beat Lo-Fi & crépitement grillade',
    difficulty: 'Intermédiaire',
    potentialViews: '850k+',
    rewardBonus: '+50 $ bonus viralité',
    category: 'food',
    searchCitations: [
      { title: 'Google Search: Street Food Trends & Fast Cooking Shorts', url: 'https://trends.google.fr' },
    ],
  },
  {
    id: 'ch-3',
    title: '🕺 Afro-Drill Shuffle Step',
    hashtag: '#AfroDrillStep',
    trendTopic: 'Rythmes Amapiano et chorégraphies synchronisées en tête des recherches',
    description: 'Apprenez les 3 pas de shuffle de base et réalisez la transition en duo ou en solo dans la rue avec des baskets stylées.',
    soundIdea: 'Tshwala Bam (Viral Dance Edit 2026)',
    difficulty: 'Intermédiaire',
    potentialViews: '2.8M+',
    rewardBonus: '+35% d\'engagement garanti',
    category: 'dance',
    searchCitations: [
      { title: 'Billboard & TikTok Hot Sounds Index', url: 'https://trends.google.fr' },
    ],
  },
  {
    id: 'ch-4',
    title: '☕ Latte Art en 10 Secondes',
    hashtag: '#LatteArt10s',
    trendTopic: 'Micro-tutoriels barista et vidéos satisfaisantes (ASMR)',
    description: 'Versez la mousse de lait en dessinant une rosace ou un cœur en gros plan parfait avec un son naturel relaxant.',
    soundIdea: 'Morning Coffee Acoustic Warm Lo-Fi',
    difficulty: 'Facile',
    potentialViews: '620k+',
    rewardBonus: '+20 $ bonus ASMR',
    category: 'art',
    searchCitations: [
      { title: 'YouTube Shorts & Google Trends: Barista Craft', url: 'https://trends.google.fr' },
    ],
  },
  {
    id: 'ch-5',
    title: '🌊 Sunset Mirror Pose',
    hashtag: '#SunsetMirror',
    trendTopic: 'Photographie créative au crépuscule et reflets aquatiques',
    description: 'Placez un miroir au bord de l\'eau ou sur le sable pour capturer le coucher de soleil à l\'envers dans un cadrage hypnotique.',
    soundIdea: 'Golden Hour (Deep Acoustic Ocean)',
    difficulty: 'Expert',
    potentialViews: '1.9M+',
    rewardBonus: '+100 $ Fonds Créateur TikFlow',
    category: 'nature',
    searchCitations: [
      { title: 'Photography Trends Google Search 2026', url: 'https://trends.google.fr' },
    ],
  },
];

// Cache & Quota Cooldown State to prevent 429 RESOURCE_EXHAUSTED spikes
let cachedPayload: {
  challenges: ChallengeItem[];
  groundedDate: string;
  isGrounded: boolean;
  searchCitations: { title: string; url: string }[];
  timestamp: number;
} | null = null;

let quotaCooldownUntil = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const QUOTA_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes cooldown on 429

// Server-side route to fetch AI challenges with Google Search Grounding
app.get('/api/challenges', async (req, res) => {
  const now = Date.now();
  const forceRefresh = req.query.refresh === 'true';

  const currentFormattedDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // 1. Return cached response if valid and not forced
  if (!forceRefresh && cachedPayload && now - cachedPayload.timestamp < CACHE_TTL_MS) {
    return res.json({
      success: true,
      ...cachedPayload,
    });
  }

  // 2. If no API key or currently in 429 quota cooldown, serve curated challenges cleanly
  if (!process.env.GEMINI_API_KEY || now < quotaCooldownUntil) {
    return res.json({
      success: true,
      challenges: cachedPayload?.challenges || DEFAULT_CHALLENGES,
      groundedDate: currentFormattedDate,
      isGrounded: false,
      quotaNotice:
        now < quotaCooldownUntil
          ? 'Quota API temporairement atteint — défis tendances pré-chargés activés.'
          : undefined,
    });
  }

  try {
    const prompt = `Trouve les dernières tendances virales actuelles sur TikTok, Instagram Reels et Google en date d'aujourd'hui.
Génère une liste JSON de 5 défis (challenges) vidéos très créatifs pour les créateurs de l'application TOKVIBE.
Pour chaque défi, inclus exactement :
- id: un identifiant court unique (ex: "ch-trend-1")
- title: titre accrocheur avec emoji
- hashtag: hashtag sans espace commençant par # (ex: #TechFuture, #DanseChallenge)
- trendTopic: explication en une phrase de la tendance Google Search détectée
- description: consignes concrètes pour filmer la vidéo en 15 à 30 secondes
- soundIdea: ambiance ou titre de musique suggéré
- difficulty: "Facile", "Intermédiaire" ou "Expert"
- potentialViews: estimation de vues (ex: "1.2M+")
- rewardBonus: récompense de monétisation pour le créateur (ex: "+25% RPM" ou "+50 $ bonus")
- category: une catégorie parmi "tech", "dance", "food", "nature", "art", "lifestyle"

Renvoie UNIQUEMENT un tableau JSON valide commençant par [ et finissant par ]. Pas de texte additionnel.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const responseText = response.text || '';

    // Extract search citations from groundingMetadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchCitations: { title: string; url: string }[] = [];
    for (const chunk of groundingChunks) {
      if ((chunk as any).web?.uri) {
        searchCitations.push({
          title: (chunk as any).web?.title || 'Tendance Google Search',
          url: (chunk as any).web?.uri,
        });
      }
    }

    // Parse JSON
    let challenges: ChallengeItem[] = [];
    const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      challenges = JSON.parse(jsonMatch[0]);
    } else {
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      challenges = JSON.parse(cleaned);
    }

    // Attach search citations if found
    if (searchCitations.length > 0) {
      challenges = challenges.map((ch, idx) => ({
        ...ch,
        searchCitations: [searchCitations[idx % searchCitations.length]],
      }));
    }

    const finalChallenges = challenges.length > 0 ? challenges : DEFAULT_CHALLENGES;

    cachedPayload = {
      challenges: finalChallenges,
      groundedDate: currentFormattedDate,
      isGrounded: searchCitations.length > 0,
      searchCitations,
      timestamp: now,
    };

    return res.json({
      success: true,
      ...cachedPayload,
    });
  } catch (error: any) {
    const errMsg = String(error?.message || error || '');
    if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || error?.status === 429) {
      quotaCooldownUntil = Date.now() + QUOTA_COOLDOWN_MS;
    }

    // Graceful fallback to default challenges without throwing or logging fatal errors
    return res.json({
      success: true,
      challenges: cachedPayload?.challenges || DEFAULT_CHALLENGES,
      groundedDate: currentFormattedDate,
      isGrounded: false,
      quotaNotice:
        'Mode défis tendances instantanés activé (limite de requêtes Gemini atteinte). Vous pouvez configurer une clé API avec facturation dans Settings > Secrets pour augmenter le quota.',
    });
  }
});

// In-memory Public Live Streams shared across all TokVibe users
export interface PublicLiveStream {
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
  isPublic: boolean;
  startedAt: number;
}

let publicLiveStreams: PublicLiveStream[] = [
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
    startedAt: Date.now() - 1800000,
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
    startedAt: Date.now() - 950000,
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
    startedAt: Date.now() - 600000,
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
    startedAt: Date.now() - 480000,
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
    startedAt: Date.now() - 320000,
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
    startedAt: Date.now() - 210000,
  },
];

const DISCOVERABLE_PUBLIC_LIVES: Omit<PublicLiveStream, 'startedAt'>[] = [
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

// Get all active public LIVE streams on TokVibe
app.get('/api/lives', (_req, res) => {
  // Guarantee all live streams are public
  publicLiveStreams = publicLiveStreams.map((s) => ({ ...s, isPublic: true }));
  return res.json({
    success: true,
    lives: publicLiveStreams,
  });
});

// Start, stop, or discover new public LIVE streams for all TokVibe users
app.post('/api/lives', (req, res) => {
  const { action, stream, hostId } = req.body || {};

  if (action === 'stop' && hostId) {
    publicLiveStreams = publicLiveStreams.filter((s) => s.hostId !== hostId);
    return res.json({
      success: true,
      lives: publicLiveStreams,
    });
  }

  if (action === 'discover') {
    // Find a discoverable public live stream not yet in the active list, or create a fresh public live session
    const existingIds = new Set(publicLiveStreams.map((s) => s.hostId));
    const available = DISCOVERABLE_PUBLIC_LIVES.filter((d) => !existingIds.has(d.hostId));

    if (available.length > 0) {
      const nextLive: PublicLiveStream = {
        ...available[0],
        isPublic: true,
        viewersCount: available[0].viewersCount + Math.floor(Math.random() * 400),
        startedAt: Date.now(),
      };
      publicLiveStreams = [...publicLiveStreams, nextLive];
      return res.json({
        success: true,
        lives: publicLiveStreams,
        discoveredStream: nextLive,
      });
    } else {
      // Refresh viewers & surface a fresh public live at the end of the scroll
      const pick = DISCOVERABLE_PUBLIC_LIVES[Math.floor(Math.random() * DISCOVERABLE_PUBLIC_LIVES.length)];
      const freshId = `${pick.id}-${Date.now().toString().slice(-4)}`;
      const freshLive: PublicLiveStream = {
        ...pick,
        id: freshId,
        hostId: `${pick.hostId}-${Date.now().toString().slice(-3)}`,
        isPublic: true,
        viewersCount: pick.viewersCount + Math.floor(150 + Math.random() * 900),
        startedAt: Date.now(),
      };
      publicLiveStreams = [...publicLiveStreams, freshLive];
      return res.json({
        success: true,
        lives: publicLiveStreams,
        discoveredStream: freshLive,
      });
    }
  }

  if (action === 'start' && stream && stream.hostId) {
    const newStream: PublicLiveStream = {
      id: stream.id || `live-${stream.hostId}`,
      hostId: stream.hostId,
      hostName: stream.hostName || 'Créateur TokVibe',
      hostHandle: stream.hostHandle || 'createur_tokvibe',
      hostAvatar:
        stream.hostAvatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      hostVerified: Boolean(stream.hostVerified),
      title: stream.title || '🔴 En Direct Public sur TokVibe !',
      category: stream.category || 'Direct Public',
      viewersCount: stream.viewersCount || 340,
      likesCount: stream.likesCount || 4800,
      videoUrl:
        stream.videoUrl ||
        'https://assets.mixkit.co/videos/preview/mixkit-dj-playing-music-at-a-nightclub-43442-large.mp4',
      goalLabel: stream.goalLabel || 'Objectif Cadeaux 🎁',
      goalCurrent: stream.goalCurrent || 12,
      goalTarget: stream.goalTarget || 50,
      isPublic: true,
      startedAt: Date.now(),
    };

    publicLiveStreams = [
      newStream,
      ...publicLiveStreams.filter((s) => s.hostId !== stream.hostId),
    ];

    return res.json({
      success: true,
      lives: publicLiveStreams,
      activeStream: newStream,
    });
  }

  return res.json({
    success: true,
    lives: publicLiveStreams.map((s) => ({ ...s, isPublic: true })),
  });
});

// Mount Vite or serve static assets
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
