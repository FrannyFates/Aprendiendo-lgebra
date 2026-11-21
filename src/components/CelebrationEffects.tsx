import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Star, PartyPopper, Heart } from 'lucide-react';

interface SparkleItem {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
  icon: 'sparkle' | 'star' | 'heart';
}

const CELEBRATION_COLORS = ['#ec4899', '#a855f7', '#fbbf24', '#38bdf8', '#34d399', '#f43f5e', '#8b5cf6'];

export const getCheerPhrases = (name: string = 'Rachel') => [
  `¡Excelente, ${name}! ✨`,
  `¡Lo lograste, ${name}! 🎉`,
  '¡Brillante! ⭐',
  '¡Súper bien hecho! 💖',
  `¡Genial trabajo, ${name}! 🌟`,
  '¡Así se hace! 🚀'
];

/**
 * Global function to fire the celebratory confetti cannon and visual sparkles.
 * Can be called from any component when an exercise is solved correctly.
 */
export function triggerCelebration(phrase?: string) {
  // 1. Fire canvas-confetti cannons from both sides
  try {
    // Left burst
    confetti({
      particleCount: 35,
      angle: 60,
      spread: 60,
      origin: { x: 0.05, y: 0.75 },
      colors: CELEBRATION_COLORS,
      ticks: 200,
      gravity: 1.1,
      scalar: 1.05,
      disableForReducedMotion: true
    });

    // Right burst
    confetti({
      particleCount: 35,
      angle: 120,
      spread: 60,
      origin: { x: 0.95, y: 0.75 },
      colors: CELEBRATION_COLORS,
      ticks: 200,
      gravity: 1.1,
      scalar: 1.05,
      disableForReducedMotion: true
    });

    // Center star spray
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 100,
        origin: { x: 0.5, y: 0.55 },
        colors: ['#fbbf24', '#f59e0b', '#ec4899', '#a855f7'],
        shapes: ['star', 'circle'],
        scalar: 1.2,
        ticks: 180,
        gravity: 0.9,
        disableForReducedMotion: true
      });
    }, 150);
  } catch (err) {
    console.error('Error launching confetti:', err);
  }

  // 2. Dispatch custom event for the motion/react sparkles overlay
  if (typeof window !== 'undefined') {
    const customEvent = new CustomEvent('rachel-celebration', {
      detail: { phrase }
    });
    window.dispatchEvent(customEvent);
  }
}

export const CelebrationOverlay: React.FC = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentPhrase, setCurrentPhrase] = useState<string>(() => {
    const student = (typeof localStorage !== 'undefined' && localStorage.getItem('student_name')) || 'Rachel';
    return `¡Excelente, ${student}! ✨`;
  });
  const [sparkles, setSparkles] = useState<SparkleItem[]>([]);

  const generateSparkles = useCallback((): SparkleItem[] => {
    const items: SparkleItem[] = [];
    const icons: ('sparkle' | 'star' | 'heart')[] = ['sparkle', 'star', 'sparkle', 'heart', 'star'];

    for (let i = 0; i < 16; i++) {
      items.push({
        id: i,
        // Position across screen with higher concentration in center/top
        x: Math.random() * 88 + 6, // 6% to 94%
        y: Math.random() * 70 + 15, // 15% to 85%
        size: Math.floor(Math.random() * 16) + 20, // 20px to 36px
        color: CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)],
        delay: Math.random() * 0.4,
        duration: 1.2 + Math.random() * 0.8,
        rotation: Math.floor(Math.random() * 360),
        icon: icons[i % icons.length]
      });
    }
    return items;
  }, []);

  useEffect(() => {
    const handleTrigger = (event: Event) => {
      const customEvent = event as CustomEvent<{ phrase?: string }>;
      const student = (typeof localStorage !== 'undefined' && localStorage.getItem('student_name')) || 'Rachel';
      const phrases = getCheerPhrases(student);
      const phrase =
        customEvent.detail?.phrase ||
        phrases[Math.floor(Math.random() * phrases.length)];

      setCurrentPhrase(phrase);
      setSparkles(generateSparkles());
      setIsActive(true);

      // Auto-hide after 2.6 seconds
      const timer = setTimeout(() => {
        setIsActive(false);
      }, 2600);

      return () => clearTimeout(timer);
    };

    window.addEventListener('rachel-celebration', handleTrigger);
    return () => window.removeEventListener('rachel-celebration', handleTrigger);
  }, [generateSparkles]);

  return (
    <div
      id="celebration-overlay-container"
      className="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <AnimatePresence>
        {isActive && (
          <>
            {/* Ambient soft glow aura */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-gradient-to-t from-pink-400/20 via-purple-300/10 to-amber-300/20 pointer-events-none"
            />

            {/* Floating Sparkles and Stars */}
            {sparkles.map(s => (
              <motion.div
                key={`sparkle-${s.id}`}
                initial={{
                  scale: 0,
                  opacity: 0,
                  rotate: s.rotation - 45,
                  x: `${s.x}vw`,
                  y: `${s.y}vh`
                }}
                animate={{
                  scale: [0, 1.25, 1, 0],
                  opacity: [0, 1, 0.9, 0],
                  rotate: [s.rotation - 45, s.rotation, s.rotation + 90],
                  y: [`${s.y}vh`, `${s.y - 4}vh`]
                }}
                transition={{
                  duration: s.duration,
                  delay: s.delay,
                  ease: 'easeOut'
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 drop-shadow-md"
                style={{ color: s.color }}
              >
                {s.icon === 'star' ? (
                  <Star
                    style={{ width: s.size, height: s.size }}
                    className="fill-current stroke-white/80 stroke-1"
                  />
                ) : s.icon === 'heart' ? (
                  <Heart
                    style={{ width: s.size * 0.9, height: s.size * 0.9 }}
                    className="fill-current stroke-white/80 stroke-1"
                  />
                ) : (
                  <Sparkles
                    style={{ width: s.size * 1.1, height: s.size * 1.1 }}
                    className="fill-current stroke-white/80 stroke-1"
                  />
                )}
              </motion.div>
            ))}

            {/* Gratifying Cheer Toast Pill */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 30 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0
              }}
              exit={{
                scale: 0.9,
                opacity: 0,
                y: -20,
                transition: { duration: 0.3 }
              }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 22
              }}
              className="relative z-10 px-6 py-3 rounded-full bg-white/95 backdrop-blur-md border-3 border-pink-400 shadow-2xl flex items-center gap-3 text-purple-950 font-black text-base sm:text-lg select-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <PartyPopper className="w-4 h-4" />
              </div>

              <span className="tracking-wide bg-gradient-to-r from-purple-900 via-pink-700 to-purple-900 bg-clip-text text-transparent">
                {currentPhrase}
              </span>

              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
