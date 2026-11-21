import React, { useState } from 'react';

interface CanelitaAvatarProps {
  mood?: 'happy' | 'thinking' | 'celebrating' | 'teaching';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  src?: string;
  className?: string;
}

export const CanelitaAvatar: React.FC<CanelitaAvatarProps> = ({
  mood = 'happy',
  size = 'md',
  src,
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36'
  };

  // Map mood to corresponding image asset
  const defaultSrcByMood = {
    celebrating: '/celebra.png',
    teaching: '/instrucciones.png',
    thinking: '/instrucciones.png',
    happy: '/bienvenida.png'
  };

  const imageToUse = src || defaultSrcByMood[mood] || '/bienvenida.png';

  // If image provided or mapped and hasn't failed, show it with smooth fallback
  if (!imgError && imageToUse) {
    return (
      <img
        src={imageToUse}
        alt="Canelita"
        className={`${sizeClasses[size]} object-contain drop-shadow-md transition-transform hover:scale-105 shrink-0 ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  // High-fidelity SVG Puppy Avatar for Canelita
  return (
    <div
      className={`relative ${sizeClasses[size]} shrink-0 flex items-center justify-center rounded-full bg-gradient-to-b from-amber-100 to-amber-200 shadow-md border-2 border-amber-300 ${className}`}
      title="Canelita 🐾"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Puppy Floppy Left Ear */}
        <ellipse cx="24" cy="40" rx="14" ry="24" fill="#c68a4c" transform="rotate(-15 24 40)" />
        <ellipse cx="24" cy="42" rx="9" ry="17" fill="#e5aa70" transform="rotate(-15 24 42)" />

        {/* Puppy Floppy Right Ear */}
        <ellipse cx="76" cy="40" rx="14" ry="24" fill="#c68a4c" transform="rotate(15 76 40)" />
        <ellipse cx="76" cy="42" rx="9" ry="17" fill="#e5aa70" transform="rotate(15 76 42)" />

        {/* Puppy Head */}
        <circle cx="50" cy="52" r="32" fill="#e2a05d" />

        {/* Light Snout Patch */}
        <ellipse cx="50" cy="62" rx="18" ry="15" fill="#fef0d9" />

        {/* Big Sparkling Anime Eyes */}
        <circle cx="38" cy="48" r="5.5" fill="#3a2512" />
        <circle cx="36" cy="46" r="2.2" fill="#ffffff" />
        <circle cx="40" cy="50" r="1.1" fill="#ffffff" />

        <circle cx="62" cy="48" r="5.5" fill="#3a2512" />
        <circle cx="60" cy="46" r="2.2" fill="#ffffff" />
        <circle cx="64" cy="50" r="1.1" fill="#ffffff" />

        {/* Cute Puppy Cheeks */}
        <circle cx="31" cy="57" r="4.5" fill="#ffb4c2" opacity="0.75" />
        <circle cx="69" cy="57" r="4.5" fill="#ffb4c2" opacity="0.75" />

        {/* Heart Nose */}
        <path
          d="M47 58 C47 56, 49 55, 50 56.5 C51 55, 53 56, 53 58 C53 60, 50 62.5, 50 62.5 C50 62.5, 47 60, 47 58 Z"
          fill="#442a17"
        />

        {/* Cheerful Puppy Mouth */}
        {mood === 'celebrating' || mood === 'happy' ? (
          <path
            d="M45 64 Q50 71 55 64"
            stroke="#442a17"
            strokeWidth="2"
            fill="#e55667"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M46 64 Q50 68 54 64"
            stroke="#442a17"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Cute Pink Collar with Golden Star */}
        <path d="M30 80 Q50 87 70 80" stroke="#ff758f" strokeWidth="5" strokeLinecap="round" />
        <polygon points="50,79 52,84 57,84 53,87 55,92 50,89 45,92 47,87 43,84 48,84" fill="#ffd166" />
      </svg>
    </div>
  );
};
