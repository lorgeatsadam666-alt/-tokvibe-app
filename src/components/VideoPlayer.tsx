import React, { useRef, useState, useEffect } from 'react';
import {
  Heart,
  Music2,
  Play,
  Check,
  Plus,
  Repeat2,
  Maximize2,
  Minimize2,
  Smile,
  X,
  Sparkles,
  AlertTriangle,
  Edit3,
  Clock,
  Download,
  Volume2,
  VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VideoItem } from '../types';
import { getFilterCss } from './VideoFilterOverlay';
import { get24HourWindowStatus } from '../lib/moderation';

export interface VideoStickerOption {
  id: string;
  emoji: string;
  label: string;
  badge: string;
  gradient: string;
}

export const VIDEO_STICKERS: VideoStickerOption[] = [
  { id: 'fire', emoji: '🔥', label: 'Feu Viral', badge: '[STICKER] 🔥 Feu Viral !', gradient: 'from-orange-500 to-red-600' },
  { id: 'laugh', emoji: '😂', label: 'Trop Drôle', badge: '[STICKER] 😂 Trop Drôle !', gradient: 'from-amber-400 to-yellow-500' },
  { id: 'vibe', emoji: '💚', label: 'Vibe Validée', badge: '[STICKER] 💚 Vibe Validée !', gradient: 'from-emerald-400 to-green-600' },
  { id: 'crown', emoji: '👑', label: 'Légende', badge: '[STICKER] 👑 Légende !', gradient: 'from-yellow-400 to-amber-600' },
  { id: 'rocket', emoji: '🚀', label: 'Masterclass', badge: '[STICKER] 🚀 Masterclass !', gradient: 'from-cyan-400 to-blue-600' },
  { id: 'clap', emoji: '🎉', label: 'Bravo !', badge: '[STICKER] 🎉 Bravo !', gradient: 'from-pink-500 to-rose-600' },
  { id: 'gem', emoji: '💎', label: 'Pépite', badge: '[STICKER] 💎 Pépite Rare !', gradient: 'from-indigo-400 to-purple-600' },
  { id: 'star', emoji: '🤩', label: 'Incroyable', badge: '[STICKER] 🤩 Incroyable !', gradient: 'from-fuchsia-500 to-pink-600' },
];

interface VideoPlayerProps {
  video: VideoItem;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  isLiked: boolean;
  onToggleLike: (videoId: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: (videoId: string) => void;
  isFollowing: boolean;
  onToggleFollow: (authorId: string) => void;
  isReposted?: boolean;
  onRepostVideo?: (video: VideoItem) => void;
  onOpenComments: (video: VideoItem) => void;
  onSendSticker?: (videoId: string, stickerText: string) => void;
  onOpenShare: (video: VideoItem) => void;
  onOpenFilters?: (video: VideoItem) => void;
  onSelectTag?: (tag: string) => void;
  onSelectCreator?: (authorId: string) => void;
  onOpenLive?: () => void;
  isCreatorLive?: boolean;
  onOpenCreatorLive?: (authorId: string) => void;
  activeHashtagFilter?: string | null;
  autoplay?: boolean;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  currentUserId?: string | null;
  onOpenEditVideo?: (video: VideoItem) => void;
  onUseSound?: (video: VideoItem) => void;
  onVideoComplete?: (video: VideoItem) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  isActive,
  isMuted,
  onToggleMute,
  isLiked,
  onToggleLike,
  isBookmarked,
  onToggleBookmark,
  isFollowing,
  onToggleFollow,
  isReposted = false,
  onRepostVideo,
  onOpenComments,
  onSendSticker,
  onOpenShare,
  onSelectTag,
  onSelectCreator,
  onOpenLive,
  isCreatorLive = false,
  onOpenCreatorLive,
  activeHashtagFilter,
  autoplay = true,
  isFullScreen = false,
  onToggleFullScreen,
  currentUserId,
  onOpenEditVideo,
  onUseSound,
}) => {
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const RELIABLE_CDN_STREAM = 'https://media.w3.org/2010/05/sintel/trailer.mp4';
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSrc, setVideoSrc] = useState(video.videoUrl || RELIABLE_CDN_STREAM);
  const [hasError, setHasError] = useState(false);

  // Check if current user owns this video strictly
  const isOwnVideo =
    Boolean(currentUserId) &&
    (video.authorId === currentUserId ||
      video.authorHandle === 'mon_tikflow' ||
      video.authorId === 'creator-me');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [doubleTapHearts, setDoubleTapHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const lastTapRef = useRef<number>(0);

  // 3-Second Long-Press on Like Button to Repost ("Republier") State
  const [holdProgress, setHoldProgress] = useState<number>(0); // 0 to 100 over 3000ms
  const [isHoldingLike, setIsHoldingLike] = useState<boolean>(false);
  const [showRepostBanner, setShowRepostBanner] = useState<boolean>(false);
  const holdIntervalRef = useRef<number | null>(null);
  const holdCompletedRef = useRef<boolean>(false);

  // 2-Second Long-Press on Comment Button to Send Sticker State
  const [commentHoldProgress, setCommentHoldProgress] = useState<number>(0); // 0 to 100 over 2000ms
  const [isHoldingComment, setIsHoldingComment] = useState<boolean>(false);
  const [showStickerPicker, setShowStickerPicker] = useState<boolean>(false);
  const [sentStickerBanner, setSentStickerBanner] = useState<VideoStickerOption | null>(null);
  const commentHoldIntervalRef = useRef<number | null>(null);
  const commentHoldCompletedRef = useRef<boolean>(false);

  // 2-Second 2-Finger Hold Gesture for Full Screen Toggle
  const [twoFingerHoldProgress, setTwoFingerHoldProgress] = useState<number>(0);
  const [isHoldingTwoFingers, setIsHoldingTwoFingers] = useState<boolean>(false);
  const [showFullScreenGestureBanner, setShowFullScreenGestureBanner] = useState<boolean>(false);

  // Video Download State
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const handleDownloadVideo = () => {
    if (video.allowDownload === false) {
      alert("Le téléchargement de cette vidéo a été désactivé par l'auteur.");
      return;
    }

    setDownloadProgress(10);
    let p = 10;
    const interval = window.setInterval(() => {
      p += 25;
      if (p >= 100) {
        window.clearInterval(interval);
        setDownloadProgress(100);

        // Initiate browser MP4 download
        try {
          const a = document.createElement('a');
          a.href = videoSrc;
          a.download = `TokVibe_${video.authorHandle}_${video.id}.mp4`;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch {
          // fallback
        }

        setTimeout(() => setDownloadProgress(null), 2200);
      } else {
        setDownloadProgress(p);
      }
    }, 200);
  };
  const twoFingerTimerRef = useRef<number | null>(null);

  // Sync video source when video changes
  useEffect(() => {
    setVideoSrc(video.videoUrl || RELIABLE_CDN_STREAM);
    setHasError(false);
    setShowStickerPicker(false);
  }, [video.id, video.videoUrl]);

  // Synchronize playback with active state, mute state, and autoplay preference
  useEffect(() => {
    const el = videoRef.current;
    if (!el || hasError) return;

    if (isActive) {
      try {
        el.currentTime = 0;
      } catch {
        // ignore if metadata not loaded yet
      }

      el.volume = 1.0;
      el.muted = isMuted;

      if (autoplay) {
        const playPromise = el.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(() => {
              if (videoRef.current && !hasError) {
                videoRef.current.muted = true;
                videoRef.current
                  .play()
                  .then(() => setIsPlaying(true))
                  .catch(() => setIsPlaying(false));
              }
            });
        }
      } else {
        el.pause();
        setIsPlaying(false);
      }
    } else {
      el.muted = true;
      el.pause();
      try {
        el.currentTime = 0;
      } catch {
        // ignore
      }
      setIsPlaying(false);
    }
  }, [isActive, autoplay, videoSrc, hasError]);

  // Sync muted & volume state strictly for the active video
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (!isActive) {
      el.muted = true;
      return;
    }
    el.volume = 1.0;
    el.muted = isMuted;
  }, [isMuted, isActive]);

  // Unlock native video audio on first user interaction if browser initially muted autoplay
  useEffect(() => {
    if (!isActive || isMuted) return;
    const handleFirstInteraction = () => {
      const el = videoRef.current;
      if (el && isActive && !isMuted) {
        el.volume = 1.0;
        el.muted = false;
        if (el.paused && autoplay && !hasError) {
          el.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    };
    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    return () => window.removeEventListener('pointerdown', handleFirstInteraction);
  }, [isActive, isMuted, autoplay, hasError]);

  // Handle visibility change to auto-pause/resume
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        videoRef.current?.pause();
      } else if (isActive) {
        videoRef.current?.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive]);

  // Clean up hold timers on unmount
  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) {
        window.clearInterval(holdIntervalRef.current);
      }
      if (commentHoldIntervalRef.current) {
        window.clearInterval(commentHoldIntervalRef.current);
      }
      if (twoFingerTimerRef.current) {
        window.clearInterval(twoFingerTimerRef.current);
      }
    };
  }, []);

  const handleTouchStartContainer = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      if (twoFingerTimerRef.current) {
        window.clearInterval(twoFingerTimerRef.current);
      }

      setIsHoldingTwoFingers(true);
      setTwoFingerHoldProgress(0);
      const startTime = Date.now();
      const TWO_FINGER_DURATION = 2000; // 2 seconds

      twoFingerTimerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, (elapsed / TWO_FINGER_DURATION) * 100);
        setTwoFingerHoldProgress(pct);

        if (elapsed >= TWO_FINGER_DURATION) {
          if (twoFingerTimerRef.current) {
            window.clearInterval(twoFingerTimerRef.current);
            twoFingerTimerRef.current = null;
          }
          setIsHoldingTwoFingers(false);
          setTwoFingerHoldProgress(0);

          // Toggle Full Screen mode
          onToggleFullScreen?.();
          setShowFullScreenGestureBanner(true);
          setTimeout(() => setShowFullScreenGestureBanner(false), 2600);
        }
      }, 40);
    } else if (e.touches.length !== 2) {
      if (twoFingerTimerRef.current) {
        window.clearInterval(twoFingerTimerRef.current);
        twoFingerTimerRef.current = null;
      }
      setIsHoldingTwoFingers(false);
      setTwoFingerHoldProgress(0);
    }
  };

  const handleTouchEndContainer = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      if (twoFingerTimerRef.current) {
        window.clearInterval(twoFingerTimerRef.current);
        twoFingerTimerRef.current = null;
      }
      setIsHoldingTwoFingers(false);
      setTwoFingerHoldProgress(0);
    }
  };

  const unlockAudioAndUnmute = () => {
    if (videoRef.current && isActive) {
      videoRef.current.volume = 1.0;
      videoRef.current.muted = false;
    }
  };

  // Start 3-second hold on Like button to Repost ("Republier")
  const handleLikePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (holdIntervalRef.current) {
      window.clearInterval(holdIntervalRef.current);
    }

    holdCompletedRef.current = false;
    setIsHoldingLike(true);
    setHoldProgress(0);

    const startTime = Date.now();
    const HOLD_DURATION_MS = 3000; // 3 seconds

    holdIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setHoldProgress(pct);

      if (elapsed >= HOLD_DURATION_MS) {
        if (holdIntervalRef.current) {
          window.clearInterval(holdIntervalRef.current);
          holdIntervalRef.current = null;
        }
        holdCompletedRef.current = true;
        setIsHoldingLike(false);
        setHoldProgress(0);

        // Like the video if not already liked
        if (!isLiked) {
          onToggleLike(video.id);
        }

        // Trigger Repost ("Republier")
        onRepostVideo?.(video);
        setShowRepostBanner(true);
        setTimeout(() => setShowRepostBanner(false), 3200);

        // Celebratory confetti burst
        confetti({
          particleCount: 45,
          spread: 80,
          origin: { x: 0.85, y: 0.55 },
          colors: ['#22c55e', '#4ade80', '#25F4EE', '#ffffff'],
        });
      }
    }, 30);
  };

  const handleLikePointerUpOrLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (holdIntervalRef.current) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }

    if (isHoldingLike && !holdCompletedRef.current) {
      // Short press (< 3s): regular Like toggle
      onToggleLike(video.id);
    }

    setIsHoldingLike(false);
    setHoldProgress(0);
  };

  // Start 2-second hold on Comment button to open Sticker Picker ("Envoyer un sticker")
  const handleCommentPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (commentHoldIntervalRef.current) {
      window.clearInterval(commentHoldIntervalRef.current);
    }

    commentHoldCompletedRef.current = false;
    setIsHoldingComment(true);
    setCommentHoldProgress(0);

    const startTime = Date.now();
    const COMMENT_HOLD_DURATION_MS = 2000; // 2 seconds

    commentHoldIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / COMMENT_HOLD_DURATION_MS) * 100);
      setCommentHoldProgress(pct);

      if (elapsed >= COMMENT_HOLD_DURATION_MS) {
        if (commentHoldIntervalRef.current) {
          window.clearInterval(commentHoldIntervalRef.current);
          commentHoldIntervalRef.current = null;
        }
        commentHoldCompletedRef.current = true;
        setIsHoldingComment(false);
        setCommentHoldProgress(0);

        // Open Sticker Picker after 2 seconds hold
        setShowStickerPicker(true);
      }
    }, 25);
  };

  const handleCommentPointerUpOrLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (commentHoldIntervalRef.current) {
      window.clearInterval(commentHoldIntervalRef.current);
      commentHoldIntervalRef.current = null;
    }

    if (isHoldingComment && !commentHoldCompletedRef.current) {
      // Short press (< 2s): open regular Comments modal
      onOpenComments(video);
    }

    setIsHoldingComment(false);
    setCommentHoldProgress(0);
  };

  const handleSelectSticker = (sticker: VideoStickerOption) => {
    onSendSticker?.(video.id, sticker.badge);
    setShowStickerPicker(false);
    setSentStickerBanner(sticker);
    setTimeout(() => {
      setSentStickerBanner((prev) => (prev?.id === sticker.id ? null : prev));
    }, 3000);

    confetti({
      particleCount: 40,
      spread: 75,
      origin: { x: 0.5, y: 0.55 },
      colors: ['#25F4EE', '#FE2C55', '#22c55e', '#facc15', '#ffffff'],
    });
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handleVideoTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isMuted) {
      unlockAudioAndUnmute();
    }

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!isLiked) {
        onToggleLike(video.id);
      }
      confetti({
        particleCount: 28,
        spread: 65,
        origin: { x: clientX / window.innerWidth, y: clientY / window.innerHeight },
        colors: ['#22c55e', '#10b981', '#4ade80', '#25F4EE', '#ffffff'],
      });

      const newHeart = { id: Date.now(), x: clientX, y: clientY };
      setDoubleTapHearts((prev) => [...prev, newHeart]);
      setTimeout(() => {
        setDoubleTapHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
      }, 1000);

      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      setTimeout(() => {
        if (lastTapRef.current === now) {
          if (videoRef.current && !hasError) {
            if (videoRef.current.paused) {
              if (!isMuted) unlockAudioAndUnmute();
              videoRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
            } else {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          } else {
            setIsPlaying((prev) => !prev);
          }
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    e.stopPropagation();
    if (videoSrc !== RELIABLE_CDN_STREAM) {
      setVideoSrc(RELIABLE_CDN_STREAM);
    } else {
      setHasError(true);
    }
  };

  const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const remainingSeconds = Math.max(1, Math.ceil(((100 - holdProgress) / 100) * 3));
  const remainingCommentSeconds = Math.max(1, Math.ceil(((100 - commentHoldProgress) / 100) * 2));

  return (
    <div
      onTouchStart={handleTouchStartContainer}
      onTouchMove={handleTouchStartContainer}
      onTouchEnd={handleTouchEndContainer}
      onTouchCancel={handleTouchEndContainer}
      className={`relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none transition-all duration-500 ease-out ${
        isActive ? 'opacity-100 scale-100' : 'opacity-40 scale-95'
      }`}
    >
      {/* 2-Finger 2-Second Hold Progress Overlay for Full Screen */}
      {isHoldingTwoFingers && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-black/90 backdrop-blur-md border border-[#25F4EE]/60 text-white text-xs font-black shadow-2xl flex items-center gap-2 pointer-events-none animate-pulse">
          <Sparkles className="w-4 h-4 text-[#25F4EE] animate-spin" />
          <span>Maintien 2 doigts (2s) — Plein écran {Math.round(twoFingerHoldProgress)}%</span>
        </div>
      )}

      {/* Full Screen Gesture Success Banner */}
      {showFullScreenGestureBanner && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#25F4EE] to-blue-500 text-black text-xs font-black shadow-2xl flex items-center gap-2 pointer-events-none animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{isFullScreen ? 'Mode Plein écran actif !' : 'Mode Plein écran quitté !'}</span>
        </div>
      )}

      {/* Video Download Progress Banner */}
      {downloadProgress !== null && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-black/90 backdrop-blur-xl border border-[#25F4EE]/70 shadow-[0_0_30px_rgba(37,244,238,0.4)] flex items-center gap-3 pointer-events-none animate-bounce">
          <Download className="w-5 h-5 text-[#25F4EE] animate-pulse" />
          <div className="text-left">
            <div className="text-xs font-black text-white">
              {downloadProgress < 100
                ? `Téléchargement MP4 en cours... ${downloadProgress}%`
                : '✓ Vidéo enregistrée dans vos téléchargements !'}
            </div>
            <div className="text-[10px] text-[#25F4EE]">
              {downloadProgress < 100 ? 'Extraction HD TokVibe' : 'Fichier MP4 disponible'}
            </div>
          </div>
        </div>
      )}
      {/* Video element or Graceful Poster Fallback */}
      {!hasError ? (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={video.thumbnailUrl}
          playsInline
          loop
          muted={isMuted || !isActive}
          preload={isActive ? 'auto' : 'metadata'}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={handleVideoError}
          onTimeUpdate={handleTimeUpdate}
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            isActive ? 'scale-100 opacity-100' : 'scale-105 opacity-60'
          }`}
          style={{
            filter: getFilterCss(video.filter),
          }}
        />
      ) : (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-zinc-950">
          <img
            src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600'}
            alt={video.caption}
            className="w-full h-full object-cover opacity-85 filter brightness-95"
            style={{ filter: getFilterCss(video.filter) }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        </div>
      )}

      {/* Tap layer */}
      <div
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={handleVideoTap}
      />

      {/* Floating double-tap hearts */}
      {doubleTapHearts.map((heart) => (
        <div
          key={heart.id}
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 animate-bounce"
          style={{ left: heart.x, top: heart.y }}
        >
          <div className="text-[#22c55e] drop-shadow-[0_0_16px_rgba(34,197,94,0.9)] scale-150 animate-ping">
            <Heart className="w-16 h-16 fill-current" />
          </div>
        </div>
      ))}

      {/* Repost confirmation banner removed */}

      {/* Sent Sticker Celebration Banner when user sends a Sticker */}
      {sentStickerBanner && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none px-6">
          <div className="px-6 py-4 rounded-3xl bg-black/85 backdrop-blur-xl border-2 border-[#25F4EE]/70 shadow-[0_0_35px_rgba(37,244,238,0.55)] flex flex-col items-center gap-2 animate-bounce">
            <div className="text-5xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              {sentStickerBanner.emoji}
            </div>
            <div
              className={`px-3 py-1 rounded-full bg-gradient-to-r ${sentStickerBanner.gradient} text-white text-xs font-black uppercase tracking-wider shadow-lg`}
            >
              {sentStickerBanner.label} !
            </div>
            <span className="text-[10px] font-bold text-[#25F4EE]">
              Sticker envoyé dans les commentaires @{video.authorHandle}
            </span>
          </div>
        </div>
      )}

      {/* Quick Sticker Picker Overlay (Opens when Comment button is held for 2 seconds) */}
      {showStickerPicker && (
        <div
          className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center p-3 animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setShowStickerPicker(false);
          }}
        >
          <div
            className="w-full max-w-sm bg-zinc-950/95 border border-[#25F4EE]/40 rounded-3xl p-4 shadow-[0_0_40px_rgba(37,244,238,0.25)] space-y-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#25F4EE] to-[#FE2C55] flex items-center justify-center text-black shadow-md">
                  <Smile className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black text-white flex items-center gap-1">
                    <span>Envoyer un Sticker</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#25F4EE]" />
                  </h4>
                  <p className="text-[10px] text-white/55">
                    Choisissez un sticker animé pour @{video.authorHandle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStickerPicker(false)}
                className="p-1.5 rounded-full bg-white/10 text-white/70 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {VIDEO_STICKERS.map((sticker) => (
                <button
                  key={sticker.id}
                  type="button"
                  onClick={() => handleSelectSticker(sticker)}
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 hover:border-[#25F4EE]/60 transition-all hover:scale-105 active:scale-95 group"
                >
                  <span className="text-3xl group-hover:scale-125 transition-transform">
                    {sticker.emoji}
                  </span>
                  <span className="text-[10px] font-extrabold text-white/90 truncate w-full text-center">
                    {sticker.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-white/45 font-medium">
                Appui 2s sur 💬 = Stickers rapides
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowStickerPicker(false);
                  onOpenComments(video);
                }}
                className="text-[11px] font-extrabold text-[#25F4EE] hover:underline"
              >
                Ouvrir les commentaires →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Play Pause indicator when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/90 shadow-2xl border border-white/20 animate-scale-in">
            <Play className="w-10 h-10 fill-current ml-1" />
          </div>
        </div>
      )}



      {/* Right Side TikTok-Style Social Actions Bar (Compact & tightly arranged "plus fermé") */}
      {!isFullScreen && (
      <div className="absolute right-2 bottom-20 z-30 flex flex-col items-center gap-2.5">
        {/* Creator Avatar (44px TokVibe size) with LIVE Signal Ring & Follow '+' / '✓' Badge */}
        <div className="relative mb-1">
          {/* Animated LIVE Signal Ring without icon/badge */}
          {isCreatorLive && (
            <>
              <span className="absolute -inset-1 rounded-full border-2 border-[#FE2C55] animate-ping opacity-75 pointer-events-none" />
              <span className="absolute -inset-0.5 rounded-full border-2 border-[#FE2C55] shadow-[0_0_12px_rgba(254,44,85,0.9)] animate-pulse pointer-events-none" />
            </>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isCreatorLive) {
                if (onOpenCreatorLive) {
                  onOpenCreatorLive(video.authorId);
                } else {
                  onOpenLive?.();
                }
              } else {
                onSelectCreator?.(video.authorId);
              }
            }}
            title={isCreatorLive ? `En direct LIVE • Cliquer pour regarder le direct` : `Voir le profil de @${video.authorHandle}`}
            className={`relative w-11 h-11 rounded-full overflow-hidden hover:scale-105 transition p-[1.5px] flex items-center justify-center ${
              isCreatorLive
                ? 'bg-gradient-to-tr from-[#FE2C55] via-rose-500 to-red-600 shadow-[0_0_15px_rgba(254,44,85,0.9)] ring-2 ring-[#FE2C55]'
                : 'bg-white shadow-[0_2px_10px_rgba(0,0,0,0.6)]'
            }`}
          >
            <img
              src={video.authorAvatar}
              alt={video.authorName}
              className="w-full h-full object-cover rounded-full"
            />
          </button>

          {/* Follow '+' / 'Abonné' Check Badge (Blue when Abonné) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFollow(video.authorId);
            }}
            title={isFollowing ? 'Abonné (Cliquer pour se désabonner)' : `Suivre @${video.authorHandle}`}
            className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
              isFollowing
                ? 'bg-[#2563eb] text-white ring-2 ring-black shadow-[0_0_10px_rgba(37,99,235,0.95)] hover:scale-110 active:scale-95'
                : 'bg-[#FE2C55] text-white ring-2 ring-black shadow-[0_2px_6px_rgba(254,44,85,0.8)] hover:scale-110 active:scale-95'
            }`}
          >
            {isFollowing ? <Check className="w-3 h-3 stroke-[3.5]" /> : <Plus className="w-3.5 h-3.5 stroke-[3.2]" />}
          </button>
        </div>

        {/* 1. TikTok Like Heart Button */}
        <div className="relative flex flex-col items-center">
          <button
            type="button"
            onPointerDown={handleLikePointerDown}
            onPointerUp={handleLikePointerUpOrLeave}
            onPointerLeave={handleLikePointerUpOrLeave}
            onPointerCancel={handleLikePointerUpOrLeave}
            onContextMenu={(e) => e.preventDefault()}
            title="Appuyer pour aimer • Maintenir 3 secondes pour republier"
            className="flex flex-col items-center group transition active:scale-90 touch-none py-0.5"
          >
            <div className="relative w-9 h-8 flex items-center justify-center">
              {/* Circular 3-Second Progress Ring around the Like icon while holding */}
              {isHoldingLike && (
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                  viewBox="0 0 36 36"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#FE2C55"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 16}
                    strokeDashoffset={2 * Math.PI * 16 * (1 - holdProgress / 100)}
                  />
                </svg>
              )}

              {/* TikTok Filled Heart Shape */}
              <svg
                className={`w-7 h-7 transition-transform duration-200 ${
                  isLiked || isHoldingLike
                    ? 'text-[#FE2C55] scale-110 drop-shadow-[0_2px_8px_rgba(254,44,85,0.85)]'
                    : 'text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)] group-hover:scale-110'
                }`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <span
              className={`text-xs font-bold leading-none tracking-tight drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.95)] mt-1 ${
                isLiked ? 'text-[#FE2C55]' : 'text-white'
              }`}
            >
              {formatCount(video.likesCount + (isLiked ? 1 : 0))}
            </span>
          </button>
        </div>

        {/* 2. TikTok Comments Button */}
        <div className="relative flex flex-col items-center">
          {isHoldingComment && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1 rounded-xl bg-black/90 border border-[#25F4EE]/60 text-white text-[11px] font-extrabold shadow-xl flex items-center gap-1.5 pointer-events-none">
              <Smile className="w-3.5 h-3.5 text-[#25F4EE] animate-bounce" />
              <span>Stickers dans {remainingCommentSeconds}s...</span>
            </div>
          )}

          <button
            type="button"
            onPointerDown={handleCommentPointerDown}
            onPointerUp={handleCommentPointerUpOrLeave}
            onPointerLeave={handleCommentPointerUpOrLeave}
            onPointerCancel={handleCommentPointerUpOrLeave}
            onContextMenu={(e) => e.preventDefault()}
            title="Appuyer pour commenter • Maintenir 2 secondes pour envoyer un sticker"
            className="flex flex-col items-center group transition active:scale-90 touch-none py-0.5"
          >
            <div className="relative w-9 h-8 flex items-center justify-center">
              {/* Circular 2-Second Progress Ring around the Comment icon while holding */}
              {isHoldingComment && (
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                  viewBox="0 0 36 36"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#25F4EE"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 16}
                    strokeDashoffset={2 * Math.PI * 16 * (1 - commentHoldProgress / 100)}
                  />
                </svg>
              )}

              <svg
                className={`w-7 h-7 transition-transform duration-200 ${
                  isHoldingComment || showStickerPicker
                    ? 'text-[#25F4EE] scale-110 drop-shadow-[0_2px_8px_rgba(37,244,238,0.8)]'
                    : 'text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)] group-hover:scale-110'
                }`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.13 1.05 4.07 2.75 5.5-.15 1.15-.68 2.38-1.47 3.22-.24.25-.06.67.28.65 1.79-.12 3.55-.81 4.76-1.69.85.21 1.75.32 2.68.32 5.52 0 10-3.58 10-8s-4.48-8-10-8zm-3.5 9.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm3.5 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm3.5 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
              </svg>
            </div>
            <span className="text-xs font-bold leading-none text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.95)] mt-1 tracking-tight">
              {formatCount(video.commentsCount)}
            </span>
          </button>
        </div>

        {/* 3. TikTok Bookmark / Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(video.id);
          }}
          className="flex flex-col items-center group transition active:scale-90 py-0.5"
        >
          <div className="w-9 h-8 flex items-center justify-center">
            <svg
              className={`w-7 h-7 transition-transform duration-200 ${
                isBookmarked
                  ? 'text-amber-400 scale-110 drop-shadow-[0_2px_8px_rgba(251,191,36,0.75)]'
                  : 'text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)] group-hover:scale-110'
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6 3h12a2 2 0 0 1 2 2v16l-8-3.8L4 21V5a2 2 0 0 1 2-2z" />
            </svg>
          </div>
          <span
            className={`text-xs font-bold leading-none drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.95)] mt-1 tracking-tight ${
              isBookmarked ? 'text-amber-400' : 'text-white'
            }`}
          >
            {formatCount(video.bookmarksCount + (isBookmarked ? 1 : 0))}
          </span>
        </button>

        {/* 4. TikTok Share Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenShare(video);
          }}
          className="flex flex-col items-center group transition active:scale-90 py-0.5"
        >
          <div className="w-9 h-8 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M14 4.5V9C7.5 10 4 14.5 3 19.5c2.5-3.2 6-4.7 11-4.7v4.7l8-7.5-8-7.5z" />
            </svg>
          </div>
          <span className="text-xs font-bold leading-none text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.95)] mt-1 tracking-tight">
            {formatCount(video.sharesCount + (isReposted ? 1 : 0))}
          </span>
        </button>

        {/* 5. Spinning Vinyl Record Music Disc */}
        <div className="relative mt-1">
          <button
            type="button"
            onClick={() => onUseSound?.(video)}
            className={`w-11 h-11 rounded-full bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 p-1.5 border-2 border-zinc-800 ring-2 ring-black/70 shadow-2xl flex items-center justify-center transition active:scale-95 ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '4s' }}
            title={`Son : ${video.musicTitle}`}
          >
            <div className="w-full h-full rounded-full overflow-hidden border border-black/80 ring-1 ring-zinc-700">
              <img
                src={video.authorAvatar}
                alt="music disc"
                className="w-full h-full object-cover"
              />
            </div>
          </button>
          {isPlaying && !isMuted && (
            <div className="absolute -top-1 -left-1 text-[#25F4EE] animate-ping pointer-events-none">
              <Music2 className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
      )}

      {/* Bottom Info Overlay (Hidden in Full Screen immersive mode) */}
      {!isFullScreen && (
      <div className="absolute left-3 right-20 bottom-5 z-20 pointer-events-auto flex flex-col gap-1.5 drop-shadow-lg text-left">
        {/* Safety Warning Pill (Ne tentez pas ceci chez vous) for dangerous sports / stunts / combat */}
        {(video.hasSafetyWarning ||
          video.category === 'sports' ||
          video.category === 'extreme_sports' ||
          video.category === 'combat' ||
          /(danger|combat|cascade|extreme|fight|parkour|escalade|chute|risk|stunt)/i.test(video.caption)) && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-amber-500/60 text-amber-300 text-[10px] font-extrabold max-w-fit shadow-lg mb-1 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{video.safetyWarningText || "⚠️ Attention : Action risquée. Ne tentez pas ceci chez vous !"}</span>
          </div>
        )}

        {/* Reposted status pill if user reposted this video */}
        {isReposted && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/50 text-[#4ade80] text-[11px] font-extrabold max-w-fit shadow-md">
            <Repeat2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Vous avez republié cette vidéo</span>
          </div>
        )}

        {/* Creator Proper Name & Verified Badge (Clean name without @ symbol) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onSelectCreator?.(video.authorId)}
            className="text-[15px] font-extrabold text-white hover:underline flex items-center gap-1"
          >
            {video.authorName}
          </button>
          {video.authorVerified && (
            <span
              className="relative inline-flex items-center justify-center w-4 h-4 rounded-full shadow-[0_0_10px_#22c55e,inset_0_2px_3px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.5)] border border-emerald-300/80 shrink-0"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #86efac 0%, #22c55e 50%, #15803d 85%, #052e16 100%)',
              }}
              title="Compte certifié (Boule verte officielle)"
            >
              <span className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white/90 blur-[0.2px] pointer-events-none" />
              <Check className="w-2.5 h-2.5 stroke-[4] text-black" />
            </span>
          )}
          {video.musicTitle && (
            <button
              type="button"
              onClick={() => onUseSound?.(video)}
              className="flex items-center gap-1.5 text-[11px] text-white/80 hover:text-[#25F4EE] transition"
            >
              <span className="text-white/40 mx-0.5">•</span>
              <Music2 className="w-3.5 h-3.5" />
              <span className="truncate max-w-[150px]">{video.musicTitle}</span>
            </button>
          )}

          {/* Edit/Delete button removed per request */}

          {/* FX Badge removed per request */}
        </div>

        {/* Caption & Hashtags */}
        <p className={`text-sm text-white/95 leading-relaxed cursor-pointer ${isCaptionExpanded ? '' : 'line-clamp-1'}`} onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}>
          {video.caption.split(/(#[a-zA-Z0-9_\u00C0-\u017F]+)/g).map((part, index) => {
            if (part.startsWith('#')) {
              const cleanTag = part.replace(/^#/, '');
              const isCurrent =
                activeHashtagFilter &&
                cleanTag.toLowerCase() === activeHashtagFilter.toLowerCase();

              return (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTag?.(cleanTag);
                  }}
                  className={`inline-block font-extrabold mr-1 transition-all rounded px-1.5 py-0.5 z-30 cursor-pointer active:scale-90 ${
                    isCurrent
                      ? 'bg-[#25F4EE] text-black shadow-md shadow-[#25F4EE]/40 ring-1 ring-white'
                      : 'text-[#25F4EE] hover:text-[#FE2C55] hover:bg-white/10'
                  }`}
                  title={`Filtrer par #${cleanTag}`}
                >
                  {part}
                </button>
              );
            }
            return <span key={index}>{part}</span>;
          })}
        </p>
      </div>
      )}

      {/* Sleek Fine Progress Bar at the bottom of the video */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-white/15 z-40 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#FE2C55] via-[#22c55e] to-[#25F4EE] shadow-[0_0_8px_rgba(37,244,238,0.85)] transition-all duration-150 ease-linear rounded-r-full"
          style={{ width: `${isActive ? progress : 0}%` }}
        />
      </div>
    </div>
  );
};
