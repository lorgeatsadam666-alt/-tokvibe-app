import React, { useState } from 'react';
import { X, Heart, Send, Smile, Check, Sparkles } from 'lucide-react';
import { VideoItem, CommentItem, UserProfile } from '../types';
import { VIDEO_STICKERS } from './VideoPlayer';

interface CommentsModalProps {
  video: VideoItem;
  comments: CommentItem[];
  currentUser: UserProfile | null;
  onClose: () => void;
  onAddComment: (videoId: string, text: string) => void;
  onLikeComment: (commentId: string) => void;
}

const EMOJI_SHORTCUTS = ['❤️', '🔥', '😂', '👏', '💯', '✨', '😍', '🙌'];

export const CommentsModal: React.FC<CommentsModalProps> = ({
  video,
  comments,
  currentUser,
  onClose,
  onAddComment,
  onLikeComment,
}) => {
  const [inputText, setInputText] = useState('');
  const [showStickersBar, setShowStickersBar] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddComment(video.id, inputText.trim());
    setInputText('');
  };

  const handleAddEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const handleSendQuickSticker = (badgeText: string) => {
    onAddComment(video.id, badgeText);
    setShowStickersBar(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Tap backdrop to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md h-[72vh] bg-zinc-950/95 border-t border-white/10 rounded-t-3xl shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10">
          <button
            type="button"
            onClick={() => setShowStickersBar((prev) => !prev)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 border transition ${
              showStickersBar
                ? 'bg-[#25F4EE] text-black border-[#25F4EE]'
                : 'bg-white/5 text-[#25F4EE] border-[#25F4EE]/40 hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Stickers</span>
          </button>
          <div className="text-center">
            <h3 className="text-sm font-bold text-white tracking-wide">
              {comments.length} commentaires
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/60 hover:text-white bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Scrollable List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/40 text-center py-12">
              <Smile className="w-12 h-12 mb-2 stroke-1" />
              <p className="text-sm">Aucun commentaire pour l'instant.</p>
              <p className="text-xs text-white/30 mt-1">
                Soyez le premier à commenter ou maintenez 💬 2s pour envoyer un sticker !
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isStickerComment = comment.text.startsWith('[STICKER]');
              const cleanStickerText = comment.text.replace('[STICKER]', '').trim();

              return (
                <div key={comment.id} className="flex items-start gap-3 group">
                  <img
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10"
                  />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white/90 flex items-center gap-1">
                        <span>{comment.userName}</span>
                        {comment.userId === video.authorId && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-white/70 font-semibold">
                            Auteur
                          </span>
                        )}
                        {comment.userId === video.authorId && video.authorVerified && (
                          <span
                            className="relative inline-flex items-center justify-center w-3.5 h-3.5 rounded-full shadow-[0_0_8px_#22c55e,inset_0_1.5px_2px_rgba(255,255,255,0.8),inset_0_-1.5px_2px_rgba(0,0,0,0.5)] border border-emerald-300/80 shrink-0"
                            style={{
                              background: 'radial-gradient(circle at 35% 35%, #86efac 0%, #22c55e 50%, #15803d 85%, #052e16 100%)',
                            }}
                            title="Compte certifié (Boule verte)"
                          >
                            <span className="absolute top-0.5 left-0.5 w-0.5 h-0.5 rounded-full bg-white blur-[0.1px] pointer-events-none" />
                            <Check className="w-2 h-2 stroke-[4] text-black drop-shadow-[0_0.5px_0.5px_rgba(255,255,255,0.4)]" />
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-white/40">
                        {comment.createdAt}
                      </span>
                    </div>

                    {isStickerComment ? (
                      <div className="mt-1.5 inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#25F4EE]/20 via-[#FE2C55]/20 to-purple-500/20 border border-[#25F4EE]/50 shadow-[0_0_15px_rgba(37,244,238,0.2)]">
                        <span className="text-base font-black text-white">
                          {cleanStickerText}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#25F4EE] text-black">
                          Sticker
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-white/95 mt-1 leading-relaxed break-words">
                        {comment.text}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-1.5 text-[11px] text-white/50">
                      <button className="hover:text-white">Répondre</button>
                    </div>
                  </div>
                  {/* Comment Like button */}
                  <button
                    onClick={() => onLikeComment(comment.id)}
                    className="flex flex-col items-center gap-0.5 text-white/40 hover:text-[#FE2C55] transition pt-1"
                  >
                    <Heart
                      className={`w-4 h-4 transition ${
                        comment.isLiked ? 'fill-[#FE2C55] text-[#FE2C55]' : ''
                      }`}
                    />
                    <span className="text-[10px]">{comment.likesCount}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Expandable Quick Stickers Drawer inside Comments */}
        {showStickersBar && (
          <div className="px-3 py-2.5 bg-zinc-900/95 border-t border-[#25F4EE]/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold text-[#25F4EE] uppercase tracking-wider">
                Envoyer un Sticker animé
              </span>
              <button
                type="button"
                onClick={() => setShowStickersBar(false)}
                className="text-[10px] text-white/50 hover:text-white"
              >
                Fermer
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {VIDEO_STICKERS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleSendQuickSticker(st.badge)}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-white/10 transition active:scale-95"
                >
                  <span className="text-2xl">{st.emoji}</span>
                  <span className="text-[9px] font-bold text-white/90 truncate w-full text-center">
                    {st.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Emoji Shortcuts row */}
        <div className="flex items-center gap-2 px-4 py-2 border-t border-white/5 overflow-x-auto no-scrollbar">
          {EMOJI_SHORTCUTS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              className="text-base p-1 hover:scale-125 transition active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 p-3 pb-6 bg-zinc-900 border-t border-white/10"
        >
          <img
            src={
              currentUser?.photoURL ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
            }
            alt="My avatar"
            className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/20"
          />
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="w-full bg-zinc-800 text-white placeholder-white/40 text-xs rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-[#FE2C55]"
            />
            <button
              type="button"
              onClick={() => setShowStickersBar((prev) => !prev)}
              title="Stickers"
              className="absolute right-2.5 text-white/50 hover:text-[#25F4EE] transition"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-9 h-9 rounded-full bg-[#FE2C55] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
