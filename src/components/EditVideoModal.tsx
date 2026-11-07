import React, { useState } from 'react';
import {
  X,
  Edit3,
  Trash2,
  AlertTriangle,
  Clock,
  Check,
  ShieldAlert,
  Sparkles,
  Sliders,
  Tag,
  Music,
} from 'lucide-react';
import { VideoItem, FilterPreset } from '../types';
import { FILTER_PRESETS } from './VideoFilterOverlay';
import { validateVideoSafety, get24HourWindowStatus } from '../lib/moderation';

interface EditVideoModalProps {
  video: VideoItem;
  onClose: () => void;
  onSaveEdit: (updatedVideo: Partial<VideoItem> & { id: string }) => void;
  onDeleteVideo: (videoId: string) => void;
}

export const EditVideoModal: React.FC<EditVideoModalProps> = ({
  video,
  onClose,
  onSaveEdit,
  onDeleteVideo,
}) => {
  const [caption, setCaption] = useState(video.caption);
  const [musicTitle, setMusicTitle] = useState(video.musicTitle);
  const [category, setCategory] = useState<VideoItem['category']>(video.category);
  const [filter, setFilter] = useState<FilterPreset>(video.filter);
  const [hasSafetyWarning, setHasSafetyWarning] = useState<boolean>(
    video.hasSafetyWarning ?? (video.category === 'sports' || video.category === 'extreme_sports' || video.category === 'combat')
  );
  const [safetyWarningText, setSafetyWarningText] = useState<string>(
    video.safetyWarningText || '⚠️ Attention : Action risquée. Ne tentez pas ceci chez vous !'
  );

  const [moderationError, setModerationError] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // 24-hour window status calculation
  const windowStatus = get24HourWindowStatus(video.createdAtTimestamp);

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModerationError(null);

    if (!windowStatus.isWithin24Hours) {
      setModerationError('Délai dépassé : Les vidéos ne peuvent plus être modifiées après 24 heures.');
      return;
    }

    const tags = caption
      .split(/\s+/)
      .filter((w) => w.startsWith('#'))
      .map((w) => w.replace(/^#/, ''));

    // Moderation check
    const modResult = validateVideoSafety(caption, tags, musicTitle, category);
    if (!modResult.isAllowed) {
      setModerationError(modResult.reason || 'Contenu non conforme aux règles de communauté.');
      return;
    }

    // Auto safety warning logic
    const finalHasSafety = hasSafetyWarning || modResult.isDangerousContent;

    onSaveEdit({
      id: video.id,
      caption: caption.trim(),
      musicTitle: musicTitle.trim() || video.musicTitle,
      category,
      filter,
      tags: tags.length > 0 ? tags : video.tags,
      hasSafetyWarning: finalHasSafety,
      safetyWarningText: finalHasSafety ? safetyWarningText : undefined,
    });

    onClose();
  };

  const handleDeleteSubmit = () => {
    if (!windowStatus.isWithin24Hours) {
      setModerationError('Délai dépassé : Les vidéos ne peuvent plus être supprimées après 24 heures.');
      return;
    }
    onDeleteVideo(video.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="w-full max-w-md max-h-[90vh] bg-zinc-950 border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col overflow-y-auto no-scrollbar text-left relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#25F4EE] to-[#FE2C55] flex items-center justify-center text-black shadow-md">
              <Edit3 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Éditer / Supprimer ma vidéo</h3>
              <p className="text-[10px] text-white/50">Gestion autorisée pendant 24 heures</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 text-white/60 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 24-Hour Timer Status Badge */}
        <div
          className={`p-3 rounded-2xl border mb-4 flex items-center justify-between text-xs font-bold ${
            windowStatus.isWithin24Hours
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="block font-black text-white text-[11px]">Fenêtre d'édition 24h :</span>
              <span className="text-[10px]">{windowStatus.label}</span>
            </div>
          </div>
          {windowStatus.isWithin24Hours && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px] font-black uppercase">
              Actif
            </span>
          )}
        </div>

        {/* Moderation Error Alert Banner */}
        {moderationError && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-start gap-2 animate-shake">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-rose-100 block">Modération TokVibe :</span>
              <span className="text-[11px] leading-relaxed">{moderationError}</span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
          {/* Caption / Description */}
          <div>
            <label className="text-white font-extrabold block mb-1">
              Description & #Hashtags
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              required
              disabled={!windowStatus.isWithin24Hours}
              className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#25F4EE]"
            />
          </div>

          {/* Music Title */}
          <div>
            <label className="text-white/80 font-bold flex items-center gap-1 mb-1">
              <Music className="w-3.5 h-3.5 text-[#25F4EE]" />
              <span>Titre de la musique / Son</span>
            </label>
            <input
              type="text"
              value={musicTitle}
              onChange={(e) => setMusicTitle(e.target.value)}
              disabled={!windowStatus.isWithin24Hours}
              className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#25F4EE]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-white/80 font-bold block mb-1">Catégorie</label>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'lifestyle', label: '✨ Lifestyle' },
                { id: 'sports', label: '🏎️ Sports' },
                { id: 'extreme_sports', label: '⚠️ Sports Extrêmes' },
                { id: 'combat', label: '🥊 Arts Martiaux / Combat' },
                { id: 'dance', label: '💃 Danse' },
                { id: 'tech', label: '🤖 Tech' },
                { id: 'art', label: '🎨 Art' },
                { id: 'food', label: '🍔 Cuisine' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as any)}
                  disabled={!windowStatus.isWithin24Hours}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold whitespace-nowrap border transition ${
                    category === cat.id
                      ? 'bg-white text-black border-white'
                      : 'bg-zinc-900 text-white/60 border-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Preset */}
          <div>
            <label className="text-white/80 font-bold flex items-center gap-1 mb-1">
              <Sliders className="w-3.5 h-3.5 text-[#25F4EE]" />
              <span>Filtre visuel FX</span>
            </label>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {FILTER_PRESETS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  disabled={!windowStatus.isWithin24Hours}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold whitespace-nowrap border transition ${
                    filter === f.id
                      ? 'bg-[#25F4EE] text-black border-[#25F4EE]'
                      : 'bg-zinc-900 text-white/60 border-white/10'
                  }`}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Safety Warning Toggle for Dangerous Sports & Combat */}
          <div className="p-3 rounded-2xl bg-zinc-900/90 border border-amber-500/30 space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-[11px]">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Avertissement de sécurité "Ne tentez pas ceci chez vous"</span>
              </div>
              <input
                type="checkbox"
                checked={hasSafetyWarning}
                onChange={(e) => setHasSafetyWarning(e.target.checked)}
                disabled={!windowStatus.isWithin24Hours}
                className="accent-amber-400 w-4 h-4"
              />
            </label>
            <p className="text-[10px] text-white/50 leading-tight">
              Obligatoire pour les vidéos de sports extrêmes, cascades, combats ou actions physiques risquées.
            </p>
            {hasSafetyWarning && (
              <input
                type="text"
                value={safetyWarningText}
                onChange={(e) => setSafetyWarningText(e.target.value)}
                disabled={!windowStatus.isWithin24Hours}
                placeholder="Ex: ⚠️ Attention : Action risquée. Ne tentez pas ceci chez vous !"
                className="w-full p-2 rounded-xl bg-black border border-amber-500/40 text-amber-200 text-[10px] focus:outline-none"
              />
            )}
          </div>

          {/* Action Buttons */}
          {showConfirmDelete ? (
            <div className="p-3 rounded-2xl bg-rose-950/90 border border-rose-500 text-center space-y-2">
              <p className="text-xs font-black text-rose-200">
                Confirmer la suppression définitive de cette vidéo ?
              </p>
              <p className="text-[10px] text-rose-300/80">
                Cette action est irréversible (autorisée dans votre fenêtre de 24h).
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 text-white font-bold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-black text-xs shadow-lg"
                >
                  Oui, Supprimer
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              {windowStatus.isWithin24Hours && (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="py-2.5 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-extrabold text-xs flex items-center justify-center gap-1 transition active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-xs border border-white/10"
              >
                Fermer
              </button>
              {windowStatus.isWithin24Hours && (
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#25F4EE] to-cyan-400 text-black font-black text-xs shadow-lg active:scale-95 transition"
                >
                  Enregistrer (24h)
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
