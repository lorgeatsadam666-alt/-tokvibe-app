import React, { useState } from 'react';
import { X, Copy, Check, Share2, Repeat2, BarChart3, Download } from 'lucide-react';
import { VideoItem } from '../types';

interface ShareModalProps {
  video: VideoItem;
  isReposted?: boolean;
  onRepostVideo?: (video: VideoItem) => void;
  onOpenVideoAnalytics?: (video: VideoItem) => void;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  video,
  isReposted = false,
  onRepostVideo,
  onOpenVideoAnalytics,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = window.location.href;
  const shareTitle = `Regardez la vidéo de @${video.authorHandle} sur TikFlow: "${video.caption}"`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TikFlow',
          text: shareTitle,
          url: shareUrl,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const platforms = [
    {
      name: 'WhatsApp',
      icon: '💬',
      bgColor: 'bg-emerald-600',
      action: () => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`, '_blank');
      },
    },
    {
      name: 'X (Twitter)',
      icon: '🐦',
      bgColor: 'bg-sky-500',
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
      },
    },
    {
      name: 'Telegram',
      icon: '✈️',
      bgColor: 'bg-blue-500',
      action: () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
      },
    },
    {
      name: 'Facebook',
      icon: '👥',
      bgColor: 'bg-blue-600',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
      },
    },
    {
      name: 'Instagram',
      icon: '📸',
      bgColor: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600',
      action: () => {
        handleCopyLink();
      },
    },
    {
      name: 'Snapchat',
      icon: '👻',
      bgColor: 'bg-yellow-400 text-black',
      action: () => {
        window.open(`https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(shareUrl)}`, '_blank');
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-zinc-950/95 border-t border-white/10 rounded-t-3xl p-5 pb-8 shadow-2xl flex flex-col z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white tracking-wide">
            Partager avec des amis
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/60 hover:text-white bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video preview mini banner + Quick Republier & Statistiques CTA */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10 mb-3">
          <img
            src={video.thumbnailUrl || video.authorAvatar}
            alt="thumbnail"
            className="w-12 h-14 rounded-xl object-cover shrink-0"
          />
          <div className="flex-1 min-w-0 text-left">
            <span className="text-xs font-bold text-white truncate block">
              @{video.authorHandle}
            </span>
            <p className="text-[11px] text-white/60 line-clamp-1 mt-0.5">
              {video.caption}
            </p>
          </div>
          {onRepostVideo && (
            <button
              type="button"
              onClick={() => {
                onRepostVideo(video);
                onClose();
              }}
              className={`px-3.5 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition active:scale-95 ${
                isReposted
                  ? 'bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/50'
                  : 'bg-[#22c55e] text-black shadow-[0_0_12px_rgba(34,197,94,0.5)] hover:bg-[#16a34a]'
              }`}
            >
              <Repeat2 className="w-4 h-4 stroke-[2.8]" />
              <span>{isReposted ? 'Republié' : 'Republier'}</span>
            </button>
          )}
        </div>

        {/* TokVibe Video Analytics Action Button (Localisation & Vues complètes) */}
        {onOpenVideoAnalytics && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenVideoAnalytics(video);
            }}
            className="w-full mb-4 p-3 rounded-2xl bg-gradient-to-r from-[#25F4EE]/15 via-zinc-900 to-[#FE2C55]/15 border border-[#25F4EE]/40 flex items-center justify-between hover:border-[#25F4EE] transition active:scale-98"
          >
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-xl bg-[#25F4EE]/20 text-[#25F4EE] flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white">
                  Statistiques TokVibe de cette vidéo
                </div>
                <div className="text-[10px] text-white/55">
                  Localisation (Pays/Villes), Vues complètes (100%) & Rétention
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#25F4EE] text-black text-[10px] font-black">
              Voir →
            </span>
          </button>
        )}

        {/* Direct Download Video MP4 Action Button */}
        <button
          type="button"
          onClick={() => {
            if (video.allowDownload === false) {
              alert("Le téléchargement de cette vidéo a été désactivé par l'auteur.");
              return;
            }
            try {
              const a = document.createElement('a');
              a.href = video.videoUrl;
              a.download = `TokVibe_${video.authorHandle}_${video.id}.mp4`;
              a.target = '_blank';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            } catch {
              // fallback
            }
            onClose();
          }}
          className="w-full mb-4 p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-white/10 hover:border-[#22c55e] flex items-center justify-between transition active:scale-98"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-[#22c55e]/20 text-[#4ade80] flex items-center justify-center">
              <Download className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-black text-white">
                Télécharger la vidéo (Fichier MP4 HD)
              </div>
              <div className="text-[10px] text-white/55">
                {video.allowDownload === false
                  ? "Désactivé par le créateur"
                  : "Enregistrer directement sur votre appareil"}
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-[#22c55e] text-black text-[10px] font-black">
            Télécharger ↓
          </span>
        </button>

        {/* Social Platforms Row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {platforms.map((p) => (
            <button
              key={p.name}
              onClick={p.action}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-white/5 transition active:scale-95"
            >
              <div
                className={`w-12 h-12 rounded-full ${p.bgColor} flex items-center justify-center text-xl shadow-lg`}
              >
                {p.icon}
              </div>
              <span className="text-[11px] text-white/80 font-medium truncate w-full text-center">
                {p.name}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Copy Link Bar */}
        <div className="flex items-center gap-2 p-2 pl-3.5 bg-zinc-900 rounded-full border border-white/10">
          <span className="text-xs text-white/60 truncate flex-1 font-mono text-left">
            {shareUrl}
          </span>
          <button
            onClick={handleCopyLink}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
              copied
                ? 'bg-emerald-500 text-black'
                : 'bg-[#FE2C55] text-white hover:bg-[#FE2C55]/90'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Copié !
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copier
              </>
            )}
          </button>
        </div>

        {/* Native Mobile Share Button */}
        <button
          onClick={handleNativeShare}
          className="mt-3 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <Share2 className="w-4 h-4" /> Options de partage système
        </button>
      </div>
    </div>
  );
};
