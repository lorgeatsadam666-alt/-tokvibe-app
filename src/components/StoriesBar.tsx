import React from 'react';
import { Plus } from 'lucide-react';
import { StoryItem, UserProfile } from '../types';
import { LiveChannel } from './LiveStreamModal';

interface StoriesBarProps {
  stories: StoryItem[];
  currentUser: UserProfile | null;
  liveChannels?: LiveChannel[];
  onOpenLive?: (hostId?: string) => void;
  onSelectStory: (story: StoryItem) => void;
  onCreateStory: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  currentUser,
  liveChannels = [],
  onOpenLive,
  onSelectStory,
  onCreateStory,
}) => {
  return (
    <div className="w-full bg-transparent overflow-x-auto no-scrollbar flex items-center gap-4 px-4 py-3 z-30 relative pointer-events-auto">
      {/* Create Story Button */}
      <button
        onClick={onCreateStory}
        className="flex flex-col items-center gap-1.5 shrink-0 group"
      >
        <div className="relative w-16 h-16 rounded-full p-0.5 border-2 border-dashed border-white/30 group-active:scale-95 transition-transform">
          <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="moi" className="w-full h-full object-cover opacity-60" />
            ) : (
              <div className="w-full h-full bg-zinc-700" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-[#FE2C55] flex items-center justify-center border-2 border-black">
                <Plus className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
        <span className="text-[10px] font-bold text-white/70">Ton status</span>
      </button>

      {/* Public LIVE Users List (Always listed first like TikTok) */}
      {liveChannels.map((ch) => (
        <button
          key={`live-bar-${ch.id}`}
          type="button"
          onClick={() => onOpenLive?.(ch.hostId)}
          className="flex flex-col items-center gap-1.5 shrink-0 group"
        >
          <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#FE2C55] via-rose-500 to-amber-500 shadow-[0_0_14px_rgba(254,44,85,0.85)] group-active:scale-95 transition-transform">
            <span className="absolute -inset-0.5 rounded-full border-2 border-[#FE2C55] animate-ping opacity-70 pointer-events-none" />
            <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800 border-2 border-black">
              <img
                src={ch.hostAvatar}
                alt={ch.hostName}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-[#FE2C55] text-[8px] font-black uppercase text-white ring-1 ring-black shadow">
              LIVE
            </span>
          </div>
          <span className="text-[10px] font-extrabold text-[#FE2C55] truncate max-w-[68px]">
            @{ch.hostHandle}
          </span>
        </button>
      ))}

      {/* Stories List */}
      {stories.map((story) => (
        <button
          key={story.id}
          onClick={() => onSelectStory(story)}
          className="flex flex-col items-center gap-1.5 shrink-0 group"
        >
          <div className={`relative w-16 h-16 rounded-full p-0.5 border-2 ${story.isViewed ? 'border-zinc-700' : 'border-[#FE2C55]'} group-active:scale-95 transition-transform`}>
            <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800 border-2 border-black">
              <img
                src={story.authorAvatar}
                alt={story.authorHandle}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <span className="text-[10px] font-bold text-white/90 truncate max-w-[64px]">
            {story.authorHandle}
          </span>
        </button>
      ))}
    </div>
  );
};
