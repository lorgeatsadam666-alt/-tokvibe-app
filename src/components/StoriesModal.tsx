import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { StoryItem } from '../types';

interface StoriesModalProps {
  stories: StoryItem[];
  initialStoryId: string;
  onClose: () => void;
}

export const StoriesModal: React.FC<StoriesModalProps> = ({
  stories,
  initialStoryId,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(() => 
    stories.findIndex(s => s.id === initialStoryId)
  );
  const [progress, setProgress] = useState(0);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds per story

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Background Blur */}
      <div 
        className="absolute inset-0 opacity-40 blur-3xl"
        style={{ backgroundImage: `url(${currentStory.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      <div className="relative w-full max-w-md h-full flex flex-col">
        {/* Progress Bars */}
        <div className="absolute top-4 inset-x-4 flex gap-1 z-30">
          {stories.map((s, idx) => (
            <div key={s.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ 
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-10 inset-x-4 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <img src={currentStory.authorAvatar} alt="avatar" className="w-10 h-10 rounded-full border border-white/20" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white shadow-sm">{currentStory.authorHandle}</span>
              <span className="text-[10px] text-white/70">Il y a quelques heures</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-black/20 text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          <img src={currentStory.imageUrl} alt="story" className="w-full h-full object-cover" />
          
          {/* Navigation Overlay */}
          <div className="absolute inset-0 flex">
            <div className="w-1/3 h-full" onClick={handlePrev} />
            <div className="w-1/3 h-full" onClick={handleNext} />
            <div className="w-1/3 h-full" onClick={handleNext} />
          </div>
        </div>

        {/* Navigation Buttons (Desktop) */}
        <div className="absolute inset-y-0 -left-16 hidden md:flex items-center">
          <button onClick={handlePrev} className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20">
            <ChevronLeft className="w-8 h-8" />
          </button>
        </div>
        <div className="absolute inset-y-0 -right-16 hidden md:flex items-center">
          <button onClick={handleNext} className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20">
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};
