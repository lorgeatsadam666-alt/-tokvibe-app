import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Wand2,
  Music2,
  Sparkles,
  Check,
  Scissors,
  Type,
  Smile,
  Sliders,
  Play,
  Pause,
  Camera,
  Film,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Gauge,
  Globe,
  Users,
  Lock,
  Trash2,
  Layers,
  Plus,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VideoItem, FilterPreset, UserProfile, StoryItem } from '../types';
import { FILTER_PRESETS, getFilterCss } from './VideoFilterOverlay';
import { validateVideoSafety, validateVideoFormat } from '../lib/moderation';

interface CreateVideoModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
  onPublish: (
    video: Omit<
      VideoItem,
      | 'id'
      | 'likesCount'
      | 'commentsCount'
      | 'bookmarksCount'
      | 'sharesCount'
      | 'viewsCount'
      | 'earnings'
      | 'createdAt'
    >
  ) => void;
  onPublishStory?: (story: Omit<StoryItem, 'id' | 'createdAt' | 'expiresAt'>) => void;
  initialChallenge?: { hashtag: string; soundIdea: string } | null;
  mode?: 'video' | 'story';
  onOpenLive?: () => void;
}

type StudioStep = 'source' | 'studio' | 'publish';
type EditorToolTab = 'trim' | 'filters' | 'text' | 'stickers' | 'audio';

interface StudioTextOverlay {
  id: string;
  text: string;
  stylePreset: 'neon' | 'TokVibe' | 'classic' | 'gold';
  position: 'top' | 'center' | 'bottom';
}

interface StudioStickerOverlay {
  id: string;
  emoji: string;
  label: string;
  x: number; // percentage 15..85
  y: number; // percentage 20..75
}

export interface StudioDraft {
  id: string;
  savedAt: string;
  timestamp: number;
  selectedVideoUrl: string;
  selectedThumbUrl: string;
  uploadedFileName?: string | null;
  caption: string;
  category: VideoItem['category'];
  filter: FilterPreset;
  brightness: number;
  contrast: number;
  saturation: number;
  trimStart: number;
  trimEnd: number;
  playbackSpeed: number;
  musicTitle: string;
  originalAudioVol: number;
  musicTrackVol: number;
  textOverlays: StudioTextOverlay[];
  stickerOverlays: StudioStickerOverlay[];
  hasSafetyWarning: boolean;
  safetyWarningText: string;
}

const DEMO_VIDEO_CLIPS = [
  {
    label: 'Océans & Surf HD',
    url: 'https://vjs.zencdn.net/v/oceans.mp4',
    thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    duration: '00:15',
  },
  {
    label: 'Animation Sintel 4K',
    url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
    duration: '00:52',
  },
  {
    label: 'Nature & Floraison',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumb: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600',
    duration: '00:10',
  },
];

const GALLERY_MEDIA_ITEMS = [
  { type: 'video', url: 'https://vjs.zencdn.net/v/oceans.mp4', thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', label: 'Océan & Surf' },
  { type: 'video', url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600', label: 'Animation 4K' },
  { type: 'video', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', thumb: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600', label: 'Nature Floraison' },
  { type: 'image', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600', thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600', label: 'Portrait Néon' },
  { type: 'image', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600', thumb: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600', label: 'Dance Vibe' },
  { type: 'image', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', label: 'Street Style' },
];

const STUDIO_MUSIC_LIBRARY = [
  { title: 'Nightcall (Synthwave Remix 2026)', artist: 'Kavinsky AI', bpm: '124 BPM' },
  { title: 'Cyberpunk Bass Boosted', artist: 'DJ TokVibe', bpm: '140 BPM' },
  { title: 'Afro Beats Summer Vibe', artist: 'Kofi Groove', bpm: '112 BPM' },
  { title: 'Lo-Fi Chill Aesthetic', artist: 'Tokyo Sunset', bpm: '90 BPM' },
  { title: 'Phonky Drift Viral', artist: 'Drift King', bpm: '155 BPM' },
];

const STUDIO_STICKERS_LIST = [
  { emoji: '🔥', label: 'Feu Viral' },
  { emoji: '✨', label: 'Étoiles' },
  { emoji: '👑', label: 'Couronne' },
  { emoji: '💯', label: '100% Validé' },
  { emoji: '🚀', label: 'Fusée' },
  { emoji: '💚', label: 'Cœur Vert' },
  { emoji: '😂', label: 'Rire' },
  { emoji: '🎬', label: 'Cinéma' },
];

const QUICK_HASHTAGS = ['#PourToi', '#TikVibe', '#StudioEdit', '#Viral', '#Tendance2026'];

export const CreateVideoModal: React.FC<CreateVideoModalProps> = ({
  currentUser,
  onClose,
  onPublish,
  onPublishStory,
  initialChallenge,
  mode = 'video',
  onOpenLive,
}) => {
  // 3-Stage Workflow: 'source' | 'studio' | 'publish'
  const [step, setStep] = useState<StudioStep>('source');
  const [activeTool, setActiveTool] = useState<EditorToolTab>('trim');

  // Video source & file upload state
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>(
    DEMO_VIDEO_CLIPS[1].url
  );
  const [selectedThumbUrl, setSelectedThumbUrl] = useState<string>(
    DEMO_VIDEO_CLIPS[1].thumb
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Camera live preview state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecordingCamera, setIsRecordingCamera] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Studio Editor Playback & Timeline state
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(15);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(100); // percentage 20..100
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Visual Filters & Color Grading state
  const [filter, setFilter] = useState<FilterPreset>('none');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);

  // Text Overlays state
  const [textOverlays, setTextOverlays] = useState<StudioTextOverlay[]>(
    initialChallenge?.hashtag
      ? [
          {
            id: 'txt-init',
            text: `Défi ${initialChallenge.hashtag}`,
            stylePreset: 'neon',
            position: 'top',
          },
        ]
      : []
  );
  const [newTextInput, setNewTextInput] = useState<string>('');
  const [newTextStyle, setNewTextStyle] = useState<StudioTextOverlay['stylePreset']>('neon');
  const [newTextPos, setNewTextPos] = useState<StudioTextOverlay['position']>('center');

  // Sticker Overlays on video canvas
  const [stickerOverlays, setStickerOverlays] = useState<StudioStickerOverlay[]>([]);

  // Audio & Music Mixer state
  const [musicTitle, setMusicTitle] = useState<string>(
    initialChallenge?.soundIdea || STUDIO_MUSIC_LIBRARY[0].title
  );
  const [originalAudioVol, setOriginalAudioVol] = useState<number>(80);
  const [musicTrackVol, setMusicTrackVol] = useState<number>(100);

  // Publish Step metadata state
  const [caption, setCaption] = useState<string>(
    initialChallenge?.hashtag
      ? `Défi relevé ! ${initialChallenge.hashtag} 🎬✨ Monté avec TikVibe Studio #PourToi`
      : 'Nouvelle vidéo montée sur TikVibe Studio 🎬✨ #PourToi #TikVibe'
  );
  const [category, setCategory] = useState<VideoItem['category']>('lifestyle');
  const [hasSafetyWarning, setHasSafetyWarning] = useState<boolean>(false);
  const [safetyWarningText, setSafetyWarningText] = useState<string>(
    '⚠️ Attention : Action risquée. Ne tentez pas ceci chez vous !'
  );
  const [moderationAlert, setModerationAlert] = useState<string | null>(null);
  const [privacyMode, setPrivacyMode] = useState<'public' | 'followers' | 'private'>('public');
  const [allowComments, setAllowComments] = useState<boolean>(true);
  const [allowDuetStitch, setAllowDuetStitch] = useState<boolean>(true);
  const [allowDownload, setAllowDownload] = useState<boolean>(true);
  const [exportHd, setExportHd] = useState<boolean>(true);
  const [draftSavedBanner, setDraftSavedBanner] = useState<boolean>(false);

  // Automatic Draft Saving & Draft Management State
  const [currentDraftId, setCurrentDraftId] = useState<string>(() => 'draft-' + Date.now());
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [showDraftsModal, setShowDraftsModal] = useState<boolean>(false);
  const [savedDraftsList, setSavedDraftsList] = useState<StudioDraft[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('tokvibe_studio_drafts_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Debounced Automatic Draft Saver (Runs on every video edit change)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window === 'undefined') return;

      const draftData: StudioDraft = {
        id: currentDraftId,
        savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        selectedVideoUrl,
        selectedThumbUrl,
        uploadedFileName,
        caption,
        category,
        filter,
        brightness,
        contrast,
        saturation,
        trimStart,
        trimEnd,
        playbackSpeed,
        musicTitle,
        originalAudioVol,
        musicTrackVol,
        textOverlays,
        stickerOverlays,
        hasSafetyWarning,
        safetyWarningText,
      };

      try {
        const existingRaw = localStorage.getItem('tokvibe_studio_drafts_v1');
        const existingDrafts: StudioDraft[] = existingRaw ? JSON.parse(existingRaw) : [];
        const updatedList = [draftData, ...existingDrafts.filter((d) => d.id !== currentDraftId)].slice(0, 15);

        localStorage.setItem('tokvibe_studio_drafts_v1', JSON.stringify(updatedList));
        setSavedDraftsList(updatedList);
        setLastSavedTime(draftData.savedAt);
      } catch {
        // storage quota fallback
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [
    currentDraftId,
    selectedVideoUrl,
    selectedThumbUrl,
    uploadedFileName,
    caption,
    category,
    filter,
    brightness,
    contrast,
    saturation,
    trimStart,
    trimEnd,
    playbackSpeed,
    musicTitle,
    originalAudioVol,
    musicTrackVol,
    textOverlays,
    stickerOverlays,
    hasSafetyWarning,
    safetyWarningText,
  ]);

  const handleRestoreDraft = (draft: StudioDraft) => {
    setCurrentDraftId(draft.id);
    setSelectedVideoUrl(draft.selectedVideoUrl);
    setSelectedThumbUrl(draft.selectedThumbUrl);
    setUploadedFileName(draft.uploadedFileName || null);
    setCaption(draft.caption);
    setCategory(draft.category);
    setFilter(draft.filter);
    setBrightness(draft.brightness);
    setContrast(draft.contrast);
    setSaturation(draft.saturation);
    setTrimStart(draft.trimStart);
    setTrimEnd(draft.trimEnd);
    setPlaybackSpeed(draft.playbackSpeed);
    setMusicTitle(draft.musicTitle);
    setOriginalAudioVol(draft.originalAudioVol);
    setMusicTrackVol(draft.musicTrackVol);
    setTextOverlays(draft.textOverlays || []);
    setStickerOverlays(draft.stickerOverlays || []);
    setHasSafetyWarning(draft.hasSafetyWarning);
    setSafetyWarningText(draft.safetyWarningText || '⚠️ Attention : Action risquée. Ne tentez pas ceci chez vous !');
    setShowDraftsModal(false);
    setStep('studio');
  };

  const handleDeleteDraft = (draftId: string) => {
    try {
      const updatedList = savedDraftsList.filter((d) => d.id !== draftId);
      localStorage.setItem('tokvibe_studio_drafts_v1', JSON.stringify(updatedList));
      setSavedDraftsList(updatedList);
    } catch {
      // ignore
    }
  };

  // Sync playback speed & volume with preview video element
  useEffect(() => {
    const el = previewVideoRef.current;
    if (!el) return;
    el.playbackRate = playbackSpeed;
    el.volume = Math.min(1, Math.max(0, originalAudioVol / 100));
  }, [playbackSpeed, originalAudioVol, step, selectedVideoUrl]);

  // Start camera automatically on mount and stop on unmount
  useEffect(() => {
    startCameraMode();
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Recording timer
  useEffect(() => {
    if (!isRecordingCamera) return;
    const timer = window.setInterval(() => {
      setRecordingSeconds((prev) => {
        if (prev >= 15) {
          setIsRecordingCamera(false);
          stopCameraMode();
          setStep('studio');
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRecordingCamera]);

  const startCameraMode = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });
      cameraStreamRef.current = stream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
    } catch {
      // Camera permission denied or unavailable in iframe: fallback visual simulation
    }
  };

  const stopCameraMode = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraActive(false);
    setIsRecordingCamera(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format
    const formatResult = validateVideoFormat(file);
    if (!formatResult.isValid) {
      alert(formatResult.error);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedVideoUrl(objectUrl);
    setUploadedFileName(file.name);
    setStep('studio');
  };

  const togglePlayPreview = () => {
    const el = previewVideoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const handlePreviewTimeUpdate = () => {
    const el = previewVideoRef.current;
    if (!el || !el.duration) return;
    const dur = el.duration;
    setVideoDuration(dur);
    const minTime = (trimStart / 100) * dur;
    const maxTime = (trimEnd / 100) * dur;

    if (el.currentTime >= maxTime || el.currentTime < minTime) {
      el.currentTime = minTime;
    }
    setCurrentTime(el.currentTime);
  };

  const handleAddTextOverlay = () => {
    if (!newTextInput.trim()) return;
    const item: StudioTextOverlay = {
      id: 'txt-' + Date.now(),
      text: newTextInput.trim(),
      stylePreset: newTextStyle,
      position: newTextPos,
    };
    setTextOverlays((prev) => [...prev, item]);
    setNewTextInput('');
  };

  const handleAddStickerOverlay = (emoji: string, label: string) => {
    const item: StudioStickerOverlay = {
      id: 'stk-' + Date.now(),
      emoji,
      label,
      x: 25 + Math.floor(Math.random() * 50),
      y: 25 + Math.floor(Math.random() * 45),
    };
    setStickerOverlays((prev) => [...prev, item]);
  };

  const getCombinedFilterStyle = () => {
    const baseFilter = getFilterCss(filter);
    const customGrade = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    return baseFilter === 'none' ? customGrade : `${baseFilter} ${customGrade}`;
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;
    setModerationAlert(null);

    // Include studio overlay summary in caption if user added text/stickers
    const studioTextSummary =
      textOverlays.length > 0
        ? ` [${textOverlays.map((t) => t.text).join(' • ')}]`
        : '';
    const studioStickerSummary =
      stickerOverlays.length > 0
        ? ` ${stickerOverlays.map((s) => s.emoji).join('')}`
        : '';

    const finalCaption = `${caption.trim()}${studioTextSummary}${studioStickerSummary}`.trim();

    const tags = finalCaption
      .split(/\s+/)
      .filter((w) => w.startsWith('#'))
      .map((w) => w.replace(/^#/, ''));

    // Content Moderation Safety Check
    const modResult = validateVideoSafety(finalCaption, tags, musicTitle, category);
    if (!modResult.isAllowed) {
      setModerationAlert(modResult.reason || 'Publication refusée par les règles de modération.');
      return;
    }

    const finalHasSafety = hasSafetyWarning || modResult.isDangerousContent;

    confetti({
      particleCount: 55,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#25F4EE', '#FE2C55', '#22c55e', '#ffffff'],
    });

    onPublish({
      authorId: currentUser?.uid || 'guest-author',
      authorName: currentUser?.displayName || 'Créateur TikVibe',
      authorHandle: currentUser?.handle || 'createur_tikvibe',
      authorAvatar:
        currentUser?.photoURL ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      authorVerified: true,
      caption: finalCaption,
      videoUrl: selectedVideoUrl,
      thumbnailUrl: selectedThumbUrl,
      musicTitle: musicTitle.trim() || 'Son Original TikVibe Studio',
      musicAuthor: currentUser?.displayName || 'TikVibe Studio',
      filter: filter,
      tags: tags.length > 0 ? tags : ['PourToi', 'TikVibe', 'StudioEdit'],
      category: category,
      createdAtTimestamp: Date.now(),
      hasSafetyWarning: finalHasSafety,
      safetyWarningText: finalHasSafety ? safetyWarningText : undefined,
      allowDownload: allowDownload,
    });

    // Remove active published draft from local storage
    try {
      const updatedList = savedDraftsList.filter((d) => d.id !== currentDraftId);
      localStorage.setItem('tokvibe_studio_drafts_v1', JSON.stringify(updatedList));
    } catch {
      // ignore
    }

    onClose();
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const tenths = Math.floor((sec % 1) * 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black select-none">
      {/* Hidden native video file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="relative w-full max-w-md h-full bg-black flex flex-col overflow-hidden text-left">
        {/* TOP STUDIO HEADER BAR */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950/95 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            {step !== 'source' ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 'publish') setStep('studio');
                  else if (step === 'studio') setStep('source');
                }}
                className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition flex items-center gap-1 text-xs font-bold px-2.5"
                title="Retour"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Retour</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/5 text-white/70 hover:text-white transition"
                title="Fermer le studio"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide text-white uppercase">
                  TikVibe Studio
                </span>
                <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] text-[9px] font-black text-black uppercase">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-white/45 font-medium">
                {step === 'source' && '1. Caméra & Importation Média'}
                {step === 'studio' && '2. Studio Éditeur Multi-Pistes'}
                {step === 'publish' && '3. Mode Publication Vidéo'}
              </p>
            </div>
          </div>

          {/* Step Switcher Pills */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-full border border-white/10">
            <button
              type="button"
              onClick={() => setStep('source')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition ${
                step === 'source'
                  ? 'bg-white text-black shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Média
            </button>
            <button
              type="button"
              onClick={() => {
                stopCameraMode();
                setStep('studio');
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition ${
                step === 'studio'
                  ? 'bg-[#25F4EE] text-black shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Éditer
            </button>
            <button
              type="button"
              onClick={() => {
                stopCameraMode();
                setStep('publish');
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition ${
                step === 'publish'
                  ? 'bg-[#FE2C55] text-white shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Publier
            </button>
          </div>
        </div>

        {/* Real-time Auto-Save Status Bar */}
        {lastSavedTime && (
          <div className="px-4 py-1.5 bg-emerald-950/40 border-b border-emerald-500/30 text-[#4ade80] text-[10px] font-extrabold flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Brouillon auto-sauvegardé ({lastSavedTime})</span>
            </span>
            {savedDraftsList.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDraftsModal(true)}
                className="text-[#25F4EE] hover:underline font-black flex items-center gap-0.5"
              >
                <span>{savedDraftsList.length} brouillon(s)</span>
                <span>→</span>
              </button>
            )}
          </div>
        )}

        {/* =========================================================
            STEP 1: SOURCE / CAMERA / IMPORT MEDIA
           ========================================================= */}
        {/* =========================================================
            STEP 1: EXACT TIKTOK CAMERA UI INTERFACE
           ========================================================= */}
        {step === 'source' && (
          <div className="relative flex-1 bg-black flex flex-col justify-between overflow-hidden">
            {/* Live Camera Video Feed or Dark Ambient Background */}
            <div className="absolute inset-0 bg-zinc-950">
              <video
                ref={cameraVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Subtle dark gradient overlay for UI contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
            </div>

            {/* TOP BAR: Close, Sound Picker Pill, Right Sidebar Tools */}
            <div className="relative z-20 flex items-center justify-between px-4 pt-4">
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition"
                title="Fermer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Centered Sound Pill */}
              <button
                type="button"
                onClick={() => {
                  const title = prompt('Titre ou nom du son / musique :', musicTitle);
                  if (title) setMusicTitle(title);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-lg hover:bg-black/70 transition"
                title="Ajouter un son"
              >
                <Music2 className="w-3.5 h-3.5 text-[#25F4EE]" />
                <span className="max-w-[150px] truncate">{musicTitle || 'Ajouter un son'}</span>
              </button>

              {/* Right Sidebar Vertical Tool Stack */}
              <div className="flex flex-col items-center gap-4 text-white">
                <button
                  type="button"
                  onClick={() => alert('Caméra inversée (Mode Selfie / Arrière)')}
                  className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-white/90 hover:text-white"
                  title="Retourner la caméra"
                >
                  <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                    <span className="text-lg">🔄</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => alert('Flash activé / désactivé')}
                  className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-white/90 hover:text-white"
                  title="Flash"
                >
                  <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                    <span className="text-lg">⚡</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => alert('Minuteur (Timer 3s / 10s)')}
                  className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-white/90 hover:text-white"
                  title="Minuteur"
                >
                  <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                    <span className="text-lg">⏱️</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTool('filters');
                    setStep('studio');
                  }}
                  className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-white/90 hover:text-white"
                  title="Effets & Filtres Studio"
                >
                  <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                    <Wand2 className="w-4 h-4 text-[#25F4EE]" />
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-white/90 hover:text-white"
                  title="Importer depuis la galerie"
                >
                  <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <Upload className="w-4 h-4 text-[#25F4EE]" />
                  </div>
                </button>
              </div>
            </div>

            {/* BOTTOM CONTROLS OVERLAY (TikTok Style) */}
            <div className="relative z-25 pb-4 space-y-4">
              {/* Effect Avatars Carousel right above record button */}
              <div className="flex items-center justify-center gap-3 overflow-x-auto no-scrollbar px-4">
                {[
                  { id: 'fx-1', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', name: 'Néon' },
                  { id: 'fx-2', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100', name: 'Cyber' },
                  { id: 'fx-3', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', name: 'Glam' },
                  { id: 'fx-4', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', name: 'AI Glow' },
                ].map((fx, idx) => (
                  <button
                    key={fx.id}
                    type="button"
                    onClick={() => {
                      const f = idx === 0 ? 'matrix' : idx === 1 ? 'vhs' : idx === 2 ? 'sunset' : 'noir';
                      setFilter(f);
                      setActiveTool('filters');
                      setStep('studio');
                    }}
                    className="flex flex-col items-center gap-1 group shrink-0"
                  >
                    <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#FE2C55] to-[#25F4EE] shadow-md group-hover:scale-105 transition">
                      <img src={fx.avatar} alt={fx.name} className="w-full h-full rounded-full object-cover" />
                    </div>
                    <span className="text-[10px] font-extrabold text-white drop-shadow">{fx.name}</span>
                  </button>
                ))}
              </div>

              {/* Recording Time Modes: 10 min | 60 s | 15 s | PHOTO | TEXTE */}
              <div className="flex items-center justify-center gap-5 text-xs font-black tracking-wider text-white/60">
                <button type="button" className="hover:text-white transition">10 min</button>
                <button type="button" className="hover:text-white transition">60 s</button>
                <button type="button" className="px-3 py-1 rounded-full bg-white/20 text-white shadow">15 s</button>
                <button type="button" className="hover:text-white transition">PHOTO</button>
                <button type="button" className="hover:text-white transition">TEXTE</button>
              </div>

              {/* Main Circular Red Recording Button & Utiliser Prise */}
              <div className="flex items-center justify-center gap-6 px-6">
                <button
                  type="button"
                  onClick={() => {
                    stopCameraMode();
                    setShowGalleryModal(true);
                  }}
                  className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-black backdrop-blur-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <span>📁</span>
                  <span>Galerie</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsRecordingCamera((prev) => !prev)}
                  className={`relative w-20 h-20 rounded-full p-1.5 border-4 border-white/80 flex items-center justify-center shadow-[0_0_30px_rgba(254,44,85,0.6)] transition active:scale-95 ${
                    isRecordingCamera ? 'bg-red-600 scale-105' : 'bg-transparent'
                  }`}
                  title="Enregistrer"
                >
                  <div
                    className={`w-full h-full rounded-full transition-all ${
                      isRecordingCamera ? 'rounded-xl bg-white scale-75 animate-pulse' : 'bg-[#FE2C55]'
                    }`}
                  />
                  {isRecordingCamera && (
                    <span className="absolute -top-7 px-2 py-0.5 rounded bg-red-600 text-[10px] font-mono font-bold text-white shadow">
                      00:{String(recordingSeconds).padStart(2, '0')} / 15s
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopCameraMode();
                    setStep('studio');
                  }}
                  className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#25F4EE] to-[#15803d] text-black text-xs font-black shadow-lg transition active:scale-95"
                >
                  Studio →
                </button>
              </div>

              {/* Bottom Navigation Tabs: LIVE | CAMÉRA | CRÉER */}
              <div className="flex items-center justify-center gap-8 pt-2 pb-1 text-xs font-black tracking-widest text-white/50 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    stopCameraMode();
                    if (onOpenLive) {
                      onOpenLive();
                    } else {
                      onClose();
                    }
                  }}
                  className="hover:text-white transition"
                >
                  LIVE
                </button>
                <button type="button" className="text-white border-b-2 border-white pb-0.5">CAMÉRA</button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="hover:text-white transition">CRÉER</button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            STEP 2: STUDIO EDITOR (CAPCUT / TokVibe STUDIO STYLE)
           ========================================================= */}
        {step === 'studio' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* LIVE 9:16 VIDEO CANVAS PREVIEW */}
            <div className="relative h-[44%] bg-black flex items-center justify-center overflow-hidden border-b border-white/10 shrink-0">
              <video
                ref={previewVideoRef}
                src={selectedVideoUrl}
                poster={selectedThumbUrl}
                autoPlay
                playsInline
                loop
                onTimeUpdate={handlePreviewTimeUpdate}
                onClick={togglePlayPreview}
                className="h-full w-auto max-w-full object-cover cursor-pointer"
                style={{
                  filter: getCombinedFilterStyle(),
                }}
              />

              {/* Live Text Overlays on Canvas */}
              {textOverlays.map((txt) => (
                <div
                  key={txt.id}
                  className={`absolute inset-x-4 z-20 flex justify-center pointer-events-none ${
                    txt.position === 'top'
                      ? 'top-6'
                      : txt.position === 'center'
                      ? 'top-1/2 -translate-y-1/2'
                      : 'bottom-10'
                  }`}
                >
                  <span
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-black tracking-wide shadow-xl ${
                      txt.stylePreset === 'neon'
                        ? 'bg-black/75 text-[#25F4EE] border border-[#25F4EE] shadow-[0_0_15px_rgba(37,244,238,0.8)]'
                        : txt.stylePreset === 'TokVibe'
                        ? 'bg-[#FE2C55] text-white shadow-[3px_3px_0px_#25F4EE]'
                        : txt.stylePreset === 'gold'
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black'
                        : 'bg-white text-black'
                    }`}
                  >
                    {txt.text}
                  </span>
                </div>
              ))}

              {/* Live Sticker Overlays on Canvas */}
              {stickerOverlays.map((stk) => (
                <div
                  key={stk.id}
                  style={{ left: `${stk.x}%`, top: `${stk.y}%` }}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 text-4xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)] animate-bounce pointer-events-none"
                >
                  {stk.emoji}
                </div>
              ))}

              {/* Top-left Studio Status Badges */}
              <div className="absolute top-2.5 left-2.5 z-30 flex items-center gap-1.5 pointer-events-none">
                <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold text-[#25F4EE]">
                  {formatSeconds(currentTime)} / {formatSeconds((trimEnd / 100) * videoDuration)}
                </span>
                {playbackSpeed !== 1 && (
                  <span className="px-2 py-0.5 rounded-md bg-[#FE2C55] text-[10px] font-black text-white">
                    {playbackSpeed}x
                  </span>
                )}
              </div>

              {/* Top-right Quick Import / Change Clip Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute top-2.5 right-2.5 z-30 px-2.5 py-1 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-[10px] font-extrabold text-white flex items-center gap-1 transition"
              >
                <Upload className="w-3 h-3 text-[#25F4EE]" />
                <span>Importer</span>
              </button>

              {/* Bottom-left Play/Pause button */}
              <button
                type="button"
                onClick={togglePlayPreview}
                className="absolute bottom-2.5 left-2.5 z-30 w-8 h-8 rounded-full bg-black/75 border border-white/20 flex items-center justify-center text-white hover:scale-105 transition"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
            </div>

            {/* MULTI-TRACK TIMELINE (CAPCUT STYLE) */}
            <div className="bg-zinc-900/95 border-b border-white/10 px-3 py-2 space-y-1.5 shrink-0">
              <div className="flex items-center justify-between text-[10px] text-white/60 font-bold">
                <span className="flex items-center gap-1 text-white/85">
                  <Layers className="w-3 h-3 text-[#25F4EE]" />
                  <span>Timeline Multi-Pistes</span>
                </span>
                <span>
                  Découpe : {trimStart}% → {trimEnd}% ({playbackSpeed}x)
                </span>
              </div>

              {/* Track 1: Video Filmstrip with Trim Handles */}
              <div className="relative h-7 rounded-lg bg-zinc-800 overflow-hidden flex items-center border border-white/10">
                {/* Active trimmed region highlight */}
                <div
                  style={{
                    left: `${trimStart}%`,
                    width: `${Math.max(5, trimEnd - trimStart)}%`,
                  }}
                  className="absolute inset-y-0 bg-gradient-to-r from-[#25F4EE]/30 via-[#FE2C55]/25 to-[#25F4EE]/30 border-x-2 border-[#25F4EE] flex items-center justify-between px-1"
                >
                  <span className="text-[9px] font-black text-white truncate">
                    🎬 Piste Vidéo ({filter !== 'none' ? `FX: ${filter}` : 'Original'})
                  </span>
                </div>
                {/* Playhead line */}
                <div
                  style={{
                    left: `${Math.min(100, Math.max(0, (currentTime / (videoDuration || 15)) * 100))}%`,
                  }}
                  className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_6px_#ffffff] z-10 pointer-events-none"
                />
              </div>

              {/* Track 2: Audio Track */}
              <div className="h-5 rounded-md bg-zinc-800/80 border border-emerald-500/30 px-2 flex items-center justify-between text-[9px] font-bold text-emerald-300">
                <span className="truncate flex items-center gap-1">
                  <Music2 className="w-2.5 h-2.5" />
                  <span>{musicTitle}</span>
                </span>
                <span>Vol {musicTrackVol}%</span>
              </div>

              {/* Track 3: Text & Stickers Track */}
              {(textOverlays.length > 0 || stickerOverlays.length > 0) && (
                <div className="h-5 rounded-md bg-zinc-800/80 border border-amber-400/30 px-2 flex items-center justify-between text-[9px] font-bold text-amber-300">
                  <span className="truncate">
                    ✨ Calques : {textOverlays.length} texte(s) • {stickerOverlays.length} sticker(s)
                  </span>
                  <span>Actif</span>
                </div>
              )}
            </div>

            {/* STUDIO TOOL PANEL CONTENT */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 bg-zinc-950">
              {/* TAB 1: TRIM & SPEED */}
              {activeTool === 'trim' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-900 p-2.5 rounded-2xl border border-white/10">
                      <div className="flex justify-between text-[10px] font-bold text-white/70 mb-1">
                        <span>Début (In)</span>
                        <span className="text-[#25F4EE]">{trimStart}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={Math.max(0, trimEnd - 15)}
                        value={trimStart}
                        onChange={(e) => setTrimStart(Number(e.target.value))}
                        className="w-full accent-[#25F4EE]"
                      />
                    </div>
                    <div className="bg-zinc-900 p-2.5 rounded-2xl border border-white/10">
                      <div className="flex justify-between text-[10px] font-bold text-white/70 mb-1">
                        <span>Fin (Out)</span>
                        <span className="text-[#FE2C55]">{trimEnd}%</span>
                      </div>
                      <input
                        type="range"
                        min={Math.min(100, trimStart + 15)}
                        max={100}
                        value={trimEnd}
                        onChange={(e) => setTrimEnd(Number(e.target.value))}
                        className="w-full accent-[#FE2C55]"
                      />
                    </div>
                  </div>

                  {/* Playback Speed Control */}
                  <div className="bg-zinc-900 p-3 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-white flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-[#25F4EE]" />
                        <span>Vitesse de lecture (Speed Ramp)</span>
                      </span>
                      <span className="text-[10px] font-black text-[#25F4EE]">
                        {playbackSpeed}x
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { val: 0.5, label: '0.5x Ralenti' },
                        { val: 1, label: '1x Normal' },
                        { val: 1.5, label: '1.5x Rapide' },
                        { val: 2, label: '2x Turbo' },
                      ].map((sp) => (
                        <button
                          key={sp.val}
                          type="button"
                          onClick={() => setPlaybackSpeed(sp.val)}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-extrabold border transition ${
                            playbackSpeed === sp.val
                              ? 'bg-[#25F4EE] text-black border-[#25F4EE]'
                              : 'bg-zinc-800 text-white/70 border-white/5 hover:text-white'
                          }`}
                        >
                          {sp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FILTERS & COLOR GRADING */}
              {activeTool === 'filters' && (
                <div className="space-y-3 text-xs">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {FILTER_PRESETS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilter(f.id)}
                        className={`px-3 py-2 rounded-2xl border whitespace-nowrap flex items-center gap-1.5 transition ${
                          filter === f.id
                            ? 'bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] text-white border-transparent font-extrabold shadow-md'
                            : 'bg-zinc-900 text-white/70 border-white/10'
                        }`}
                      >
                        <span>{f.icon}</span>
                        <span>{f.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Color Grading Sliders */}
                  <div className="bg-zinc-900 p-3 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-white/75">Luminosité ({brightness}%)</span>
                      <input
                        type="range"
                        min={60}
                        max={140}
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-36 accent-[#25F4EE]"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-white/75">Contraste ({contrast}%)</span>
                      <input
                        type="range"
                        min={60}
                        max={150}
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-36 accent-[#FE2C55]"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-white/75">Saturation ({saturation}%)</span>
                      <input
                        type="range"
                        min={0}
                        max={180}
                        value={saturation}
                        onChange={(e) => setSaturation(Number(e.target.value))}
                        className="w-36 accent-[#22c55e]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TEXT OVERLAYS */}
              {activeTool === 'text' && (
                <div className="space-y-2.5 text-xs">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTextInput}
                      onChange={(e) => setNewTextInput(e.target.value)}
                      placeholder="Tapez un texte à afficher sur la vidéo..."
                      className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-white/15 text-white text-xs focus:outline-none focus:border-[#25F4EE]"
                    />
                    <button
                      type="button"
                      onClick={handleAddTextOverlay}
                      className="px-3.5 py-2 rounded-xl bg-[#25F4EE] text-black font-black text-xs flex items-center gap-1 shrink-0 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {(
                        [
                          { id: 'neon', label: 'Néon' },
                          { id: 'TokVibe', label: 'TikVibe' },
                          { id: 'gold', label: 'Or' },
                          { id: 'classic', label: 'Blanc' },
                        ] as const
                      ).map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setNewTextStyle(st.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border ${
                            newTextStyle === st.id
                              ? 'bg-white text-black border-white'
                              : 'bg-zinc-900 text-white/60 border-white/10'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      {(
                        [
                          { id: 'top', label: 'Haut' },
                          { id: 'center', label: 'Centre' },
                          { id: 'bottom', label: 'Bas' },
                        ] as const
                      ).map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => setNewTextPos(pos.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border ${
                            newTextPos === pos.id
                              ? 'bg-[#FE2C55] text-white border-[#FE2C55]'
                              : 'bg-zinc-900 text-white/60 border-white/10'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {textOverlays.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {textOverlays.map((t) => (
                        <span
                          key={t.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-white/15 text-[10px] font-bold text-white"
                        >
                          <span>"{t.text}"</span>
                          <button
                            type="button"
                            onClick={() =>
                              setTextOverlays((prev) => prev.filter((item) => item.id !== t.id))
                            }
                            className="text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: STICKERS ON VIDEO */}
              {activeTool === 'stickers' && (
                <div className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-4 gap-2">
                    {STUDIO_STICKERS_LIST.map((st) => (
                      <button
                        key={st.label}
                        type="button"
                        onClick={() => handleAddStickerOverlay(st.emoji, st.label)}
                        className="flex flex-col items-center justify-center p-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 transition active:scale-95"
                      >
                        <span className="text-2xl">{st.emoji}</span>
                        <span className="text-[9px] font-bold text-white/75 mt-0.5">
                          {st.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  {stickerOverlays.length > 0 && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-white/60">
                        {stickerOverlays.length} sticker(s) placés sur la vidéo
                      </span>
                      <button
                        type="button"
                        onClick={() => setStickerOverlays([])}
                        className="text-[10px] font-bold text-rose-400 hover:underline"
                      >
                        Retirer tous les stickers
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: AUDIO & SOUND MIXER */}
              {activeTool === 'audio' && (
                <div className="space-y-2.5 text-xs">
                  <div className="space-y-1.5 max-h-24 overflow-y-auto no-scrollbar">
                    {STUDIO_MUSIC_LIBRARY.map((track) => (
                      <button
                        key={track.title}
                        type="button"
                        onClick={() => setMusicTitle(track.title)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl border text-left transition ${
                          musicTitle === track.title
                            ? 'bg-[#25F4EE]/15 border-[#25F4EE] text-white'
                            : 'bg-zinc-900 border-white/10 text-white/70'
                        }`}
                      >
                        <div className="truncate">
                          <span className="text-[11px] font-extrabold block truncate">
                            🎵 {track.title}
                          </span>
                          <span className="text-[9px] text-white/45">
                            {track.artist} • {track.bpm}
                          </span>
                        </div>
                        {musicTitle === track.title && (
                          <Check className="w-3.5 h-3.5 text-[#25F4EE] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Volume Mixer */}
                  <div className="bg-zinc-900 p-2.5 rounded-2xl border border-white/10 grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-white/70 mb-1">
                        <span>Son original</span>
                        <span>{originalAudioVol}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={originalAudioVol}
                        onChange={(e) => setOriginalAudioVol(Number(e.target.value))}
                        className="w-full accent-white"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-white/70 mb-1">
                        <span>Musique ajoutée</span>
                        <span className="text-[#25F4EE]">{musicTrackVol}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={musicTrackVol}
                        onChange={(e) => setMusicTrackVol(Number(e.target.value))}
                        className="w-full accent-[#25F4EE]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BOTTOM STUDIO TOOLBAR + NEXT TO PUBLISH BUTTON */}
            <div className="bg-zinc-950 border-t border-white/10 px-2 py-2 flex items-center justify-between gap-1 shrink-0">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {[
                  { id: 'trim', label: 'Découper', icon: Scissors },
                  { id: 'filters', label: 'Filtres', icon: Sliders },
                  { id: 'text', label: 'Texte', icon: Type },
                  { id: 'stickers', label: 'Stickers', icon: Smile },
                  { id: 'audio', label: 'Audio', icon: Volume2 },
                ].map((tool) => {
                  const IconComp = tool.icon;
                  const active = activeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => setActiveTool(tool.id as EditorToolTab)}
                      className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl transition ${
                        active
                          ? 'bg-white/15 text-[#25F4EE]'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                      <span className="text-[9px] font-extrabold mt-0.5">
                        {tool.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setStep('publish')}
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FE2C55] to-rose-600 text-white text-xs font-black flex items-center gap-1 shadow-lg shadow-[#FE2C55]/30 shrink-0 active:scale-95 transition"
              >
                <span>Suivant</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            STEP 3: VIDEO PUBLISHING MODE ("MODE PUBLICATION VIDÉO")
           ========================================================= */}
        {step === 'publish' && (
          <form
            onSubmit={handlePublishSubmit}
            className="flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar p-4 space-y-4 text-xs"
          >
            <div className="space-y-4">
              {/* Top Preview Card + Description Input */}
              <div className="flex gap-3 bg-zinc-900/90 p-3 rounded-2xl border border-white/10">
                <div className="relative w-20 h-28 rounded-xl overflow-hidden bg-black shrink-0 border border-white/15">
                  <video
                    src={selectedVideoUrl}
                    poster={selectedThumbUrl}
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ filter: getCombinedFilterStyle() }}
                  />
                  <span className="absolute bottom-1 inset-x-1 py-0.5 rounded bg-black/75 text-[8px] font-black text-center text-[#25F4EE]">
                    Couverture
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Décrivez votre publication, ajoutez des #hashtags et mentionnez des @amis..."
                    rows={4}
                    required
                    className="w-full bg-transparent text-white placeholder-white/40 text-xs focus:outline-none resize-none leading-relaxed"
                  />

                  {/* Quick Hashtag Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                    {QUICK_HASHTAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setCaption((prev) =>
                            prev.includes(tag) ? prev : `${prev.trim()} ${tag}`
                          )
                        }
                        className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-extrabold text-[#25F4EE] whitespace-nowrap"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Moderation Alert Banner */}
              {moderationAlert && (
                <div className="p-3 rounded-2xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs flex items-start gap-2.5 animate-shake shadow-xl">
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-white block text-[11px]">
                      🚨 Blocked by TokVibe Moderation:
                    </span>
                    <span className="text-[10px] text-rose-200 leading-tight">{moderationAlert}</span>
                  </div>
                </div>
              )}

              {/* Studio Edit Summary Pill */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-[#25F4EE]/10 via-zinc-900 to-[#FE2C55]/10 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-[#25F4EE]" />
                  <div>
                    <div className="text-[11px] font-extrabold text-white">
                      Montage TikVibe Studio appliqué
                    </div>
                    <div className="text-[10px] text-white/55">
                      Filtre: {filter} • Vitesse: {playbackSpeed}x • {textOverlays.length} texte(s) • {stickerOverlays.length} sticker(s)
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('studio')}
                  className="text-[10px] font-extrabold text-[#25F4EE] hover:underline flex items-center gap-0.5"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>Ré-éditer</span>
                </button>
              </div>

              {/* Category Picker with Sports & Extreme options */}
              <div>
                <label className="text-[11px] font-extrabold text-white/80 block mb-1.5">
                  Catégorie de publication
                </label>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                  {(
                    [
                      { id: 'lifestyle', label: '✨ Lifestyle' },
                      { id: 'sports', label: '🏎️ Sports' },
                      { id: 'extreme_sports', label: '⚠️ Sports Extrêmes' },
                      { id: 'combat', label: '🥊 Arts Martiaux' },
                      { id: 'dance', label: '💃 Danse' },
                      { id: 'tech', label: '🤖 Tech & IA' },
                      { id: 'art', label: '🎨 Art & Création' },
                      { id: 'food', label: '🍔 Cuisine' },
                      { id: 'nature', label: '🌿 Nature & Voyage' },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategory(cat.id);
                        if (cat.id === 'sports' || cat.id === 'extreme_sports' || cat.id === 'combat') {
                          setHasSafetyWarning(true);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold whitespace-nowrap border transition ${
                        category === cat.id
                          ? 'bg-white text-black border-white'
                          : 'bg-zinc-900 text-white/65 border-white/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Safety Warning Toggle for Dangerous Sports & Combat */}
              <div className="p-3 rounded-2xl bg-zinc-900/90 border border-amber-500/30 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-[11px]">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Afficher l'avertissement "Ne tentez pas ceci chez vous"</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasSafetyWarning}
                    onChange={(e) => setHasSafetyWarning(e.target.checked)}
                    className="accent-amber-400 w-4 h-4"
                  />
                </label>
                <p className="text-[10px] text-white/50 leading-tight">
                  Requis pour les vidéos à risque physique, sports extrêmes ou scènes d'action.
                </p>
                {hasSafetyWarning && (
                  <input
                    type="text"
                    value={safetyWarningText}
                    onChange={(e) => setSafetyWarningText(e.target.value)}
                    placeholder="Message d'avertissement..."
                    className="w-full p-2 rounded-xl bg-black border border-amber-500/40 text-amber-200 text-[10px] focus:outline-none"
                  />
                )}
              </div>

              {/* Visibility / Audience Selection */}
              <div>
                <label className="text-[11px] font-extrabold text-white/80 block mb-1.5">
                  Qui peut voir cette vidéo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'public', label: 'Tout le monde', icon: Globe },
                    { id: 'followers', label: 'Abonnés', icon: Users },
                    { id: 'private', label: 'Privé', icon: Lock },
                  ].map((vis) => {
                    const VisIcon = vis.icon;
                    return (
                      <button
                        key={vis.id}
                        type="button"
                        onClick={() => setPrivacyMode(vis.id as any)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-[10px] font-extrabold transition ${
                          privacyMode === vis.id
                            ? 'bg-[#2563eb] text-white border-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.45)]'
                            : 'bg-zinc-900 text-white/65 border-white/10'
                        }`}
                      >
                        <VisIcon className="w-3.5 h-3.5" />
                        <span>{vis.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Publishing Toggles */}
              <div className="bg-zinc-900/90 rounded-2xl border border-white/10 divide-y divide-white/5">
                <label className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer">
                  <span className="text-[11px] font-bold text-white/90">
                    Autoriser les commentaires et Stickers
                  </span>
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    className="accent-[#22c55e] w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer">
                  <span className="text-[11px] font-bold text-white/90">
                    Autoriser les Duos, Collages et Republications
                  </span>
                  <input
                    type="checkbox"
                    checked={allowDuetStitch}
                    onChange={(e) => setAllowDuetStitch(e.target.checked)}
                    className="accent-[#22c55e] w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer">
                  <span className="text-[11px] font-bold text-white/90">
                    Autoriser le téléchargement de la vidéo par les utilisateurs
                  </span>
                  <input
                    type="checkbox"
                    checked={allowDownload}
                    onChange={(e) => setAllowDownload(e.target.checked)}
                    className="accent-[#25F4EE] w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer">
                  <span className="text-[11px] font-bold text-white/90">
                    Téléversement Haute Qualité HD (1080p 60fps)
                  </span>
                  <input
                    type="checkbox"
                    checked={exportHd}
                    onChange={(e) => setExportHd(e.target.checked)}
                    className="accent-[#25F4EE] w-4 h-4"
                  />
                </label>
              </div>

              {draftSavedBanner && (
                <div className="p-2.5 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/50 text-[#4ade80] text-center text-[11px] font-extrabold">
                  ✓ Brouillon sauvegardé dans votre Studio !
                </div>
              )}
            </div>

            {/* Bottom Action Buttons: Drafts + Publish */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowDraftsModal(true)}
                className="flex-1 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs border border-white/10 transition active:scale-95 flex items-center justify-center gap-1"
              >
                <span>Brouillons</span>
                {savedDraftsList.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#25F4EE] text-black text-[9px] font-black">
                    {savedDraftsList.length}
                  </span>
                )}
              </button>
              <button
                type="submit"
                disabled={!caption.trim()}
                className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-[#FE2C55] via-rose-500 to-[#25F4EE] text-white font-black text-xs shadow-lg shadow-[#FE2C55]/30 flex items-center justify-center gap-1.5 active:scale-95 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Publier la vidéo</span>
              </button>
            </div>
          </form>
        )}

        {/* Saved Drafts Manager Modal */}
        {showDraftsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-md max-h-[80vh] bg-zinc-950 border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col overflow-hidden text-left">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-[#25F4EE]" />
                    <span>Vos Brouillons Auto-Sauvegardés ({savedDraftsList.length})</span>
                  </h3>
                  <p className="text-[10px] text-white/50">
                    Reprenez votre montage vidéo à tout moment
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDraftsModal(false)}
                  className="p-1.5 rounded-full bg-white/5 text-white/60 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-2.5">
                {savedDraftsList.length === 0 ? (
                  <div className="py-12 text-center text-white/40 text-xs">
                    Aucun brouillon sauvegardé pour le moment.
                    <br />
                    Toutes vos créations sont enregistrées automatiquement !
                  </div>
                ) : (
                  savedDraftsList.map((draft) => (
                    <div
                      key={draft.id}
                      className="p-3 rounded-2xl bg-zinc-900/90 border border-white/10 hover:border-[#25F4EE]/50 flex items-center justify-between gap-3 transition"
                    >
                      <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-black shrink-0 border border-white/15">
                        <img
                          src={draft.selectedThumbUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600'}
                          alt={draft.caption}
                          className="w-full h-full object-cover"
                        />
                        {draft.id === currentDraftId && (
                          <span className="absolute top-1 left-1 px-1 py-0.2 rounded bg-[#25F4EE] text-black text-[7px] font-black uppercase">
                            Actif
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="text-xs font-bold text-white truncate">
                          {draft.caption || 'Brouillon sans titre'}
                        </h4>
                        <p className="text-[10px] text-white/50 mt-0.5">
                          Sauvegardé à {draft.savedAt} • Filtre: {draft.filter}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-white/10 text-[#25F4EE] text-[9px] font-extrabold">
                            {draft.category}
                          </span>
                          {draft.hasSafetyWarning && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                              ⚠️ Sécurité
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRestoreDraft(draft)}
                          className="px-3 py-1.5 rounded-xl bg-[#25F4EE] hover:bg-cyan-300 text-black text-xs font-black transition active:scale-95"
                        >
                          Reprendre →
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="px-2 py-1 rounded-xl bg-white/5 hover:bg-rose-500 hover:text-white text-rose-400 text-[10px] font-bold transition"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowDraftsModal(false)}
                className="mt-2 w-full py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-xs border border-white/10"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Gallery Media Picker Modal */}
        {showGalleryModal && (
          <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-[#25F4EE]" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Galerie Photos & Vidéos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGalleryModal(false)}
                className="p-1.5 rounded-full bg-white/10 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">
              <div className="grid grid-cols-3 gap-2.5">
                {GALLERY_MEDIA_ITEMS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedVideoUrl(item.url);
                      setSelectedThumbUrl(item.thumb);
                      setUploadedFileName(item.label);
                      setShowGalleryModal(false);
                      setStep('studio');
                    }}
                    className="relative group aspect-[9/16] rounded-2xl overflow-hidden bg-zinc-900 border border-white/15 shadow-md active:scale-95 transition"
                  >
                    <img
                      src={item.thumb}
                      alt={item.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-left">
                      <span className="text-[10px] font-extrabold text-white truncate">
                        {item.label}
                      </span>
                      <span className="text-[8px] font-bold text-[#25F4EE] uppercase">
                        {item.type === 'video' ? '🎬 Vidéo' : '📸 Photo'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/15 flex flex-col items-center text-center space-y-2.5">
                <Upload className="w-7 h-7 text-[#25F4EE]" />
                <div>
                  <h4 className="text-xs font-black text-white">Importer depuis votre appareil</h4>
                  <p className="text-[10px] text-white/60">Sélectionnez une vidéo ou photo personnelle</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowGalleryModal(false);
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] text-black font-black text-xs shadow-lg"
                >
                  Parcourir l'appareil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
