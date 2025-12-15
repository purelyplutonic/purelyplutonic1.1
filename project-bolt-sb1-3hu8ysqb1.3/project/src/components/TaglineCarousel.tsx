import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const taglines = [
  "Your People Are Out There — Go Find Them",
  "New City? New Hobby? New Chapter? Find your people.",
  "Your New Friends Are Just a \"Hello\" Away",
  "Find Friends, Not Followers.",
  "Friendship Is Better In Real Life",
  "One Hello Could Lead To a Lifetime of Memories",
  "Belonging Isn't About Where You Are — It's Who You're With",
  "Life's Better With Friends. Find Yours Today.",
  "You Don't Have to Do Life Alone.",
  "Real People, Real Friendships, Real Life.",
  "Stop Scrolling. Start Living."
];

const TaglineCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % taglines.length);
  }, []);

  const prevSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + taglines.length) % taglines.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  // Handle touch events for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 h-16 overflow-hidden">
      <div 
        className="absolute inset-0 flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className={`text-center transition-opacity duration-500 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
          onTransitionEnd={() => setIsTransitioning(false)}
        >
          <h2 className="text-sm sm:text-base md:text-lg font-medium text-white/90 text-center leading-tight">
            {taglines[currentIndex]}
          </h2>
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white transition-colors"
        aria-label="Previous tagline"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white transition-colors"
        aria-label="Next tagline"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-1">
        {taglines.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setCurrentIndex(index);
            }}
            className={`w-1 h-1 rounded-full transition-all ${
              currentIndex === index 
                ? 'bg-white w-2' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to tagline ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TaglineCarousel;