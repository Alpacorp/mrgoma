import { useState, useEffect } from 'react';

interface UseMenuAnimationProps {
  isOpen: boolean;
  animationDuration?: number;
  staggerDelay?: number;
  itemCount?: number;
}

interface UseMenuAnimationReturn {
  isVisible: boolean;
  isAnimating: boolean;
  animationStage: number;
  pointerEvents: 'auto' | 'none';
}

/**
 * Custom hook to handle menu animation states
 */
export const useMenuAnimation = ({
  isOpen,
  animationDuration = 500,
  staggerDelay = 100,
  itemCount = 4,
}: UseMenuAnimationProps): UseMenuAnimationReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Show the menu immediately
      setIsVisible(true);
      setIsAnimating(true);

      // Reset animation stage
      setAnimationStage(0);

      // Create staggered animation sequence
      const stageTimers = Array.from({ length: itemCount + 1 }, (_, i) =>
        setTimeout(() => setAnimationStage(i + 1), staggerDelay * (i + 1))
      );

      return () => stageTimers.forEach(timer => clearTimeout(timer));
    } else {
      // Hide with animation
      setAnimationStage(0);
      setIsAnimating(false);

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, animationDuration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, animationDuration, staggerDelay, itemCount]);

  return {
    isVisible,
    isAnimating,
    animationStage,
    pointerEvents: isAnimating ? 'auto' : 'none',
  };
};
