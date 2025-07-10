import React from 'react';

export interface SpaceAvatar {
  id: string;
  name: string;
  color: string;
}

export const spaceAvatars: SpaceAvatar[] = [
  {
    id: "astronaut-wave",
    name: "Waving Astronaut",
    color: "#4F46E5",
  },
  {
    id: "alien-green",
    name: "Green Alien",
    color: "#10B981",
  },
  {
    id: "rocket-ship",
    name: "Rocket Ship",
    color: "#EF4444",
  },
  {
    id: "planet-earth",
    name: "Earth Planet",
    color: "#3B82F6",
  },
  {
    id: "dog-astronaut",
    name: "Dog Astronaut",
    color: "#8B5CF6",
  },
  {
    id: "ufo-ship",
    name: "UFO Ship",
    color: "#06B6D4",
  },
  {
    id: "star-cluster",
    name: "Star Cluster",
    color: "#F59E0B",
  },
  {
    id: "moon-face",
    name: "Moon Face",
    color: "#6B7280",
  },
  {
    id: "alien-purple",
    name: "Purple Alien",
    color: "#8B5CF6",
  },
  {
    id: "comet",
    name: "Comet",
    color: "#EC4899",
  },
  {
    id: "cat-astronaut",
    name: "Cat Astronaut",
    color: "#F97316",
  },
  {
    id: "satellite",
    name: "Satellite",
    color: "#84CC16",
  }
];

interface SpaceAvatarProps {
  avatar: SpaceAvatar;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SpaceAvatarComponent({ avatar, size = 'md', className = '' }: SpaceAvatarProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  // Generate random delay for floating animation to avoid synchronous movement
  const randomDelay = Math.random() * 2; // 0-2 seconds
  const animationStyle = {
    animationDelay: `${randomDelay}s`
  };

  const renderAvatar = () => {
    switch (avatar.id) {
      case "astronaut-wave":
        return (
          <div className="relative w-full h-full">
            {/* Helmet */}
            <div className="absolute inset-0 rounded-full" style={{ backgroundColor: avatar.color }}></div>
            <div className="absolute inset-1 rounded-full" style={{ backgroundColor: '#6366F1' }}></div>
            {/* Visor */}
            <div className="absolute top-2 left-2 right-2 h-3 rounded-full bg-white/80"></div>
            {/* Face */}
            <div className="absolute top-4 left-3 right-3 h-2 flex justify-between">
              <div className="w-1 h-1 bg-black rounded-full"></div>
              <div className="w-1 h-1 bg-black rounded-full"></div>
            </div>
            {/* Smile */}
            <div className="absolute top-6 left-3 right-3 h-1">
              <div className="w-full h-full border-b-2 border-pink-400 rounded-full"></div>
            </div>
            {/* Body */}
            <div className="absolute bottom-0 left-2 right-2 h-3 rounded-b-full" style={{ backgroundColor: avatar.color }}></div>
            {/* Arms */}
            <div className="absolute bottom-1 left-0 w-1 h-2 rounded-full" style={{ backgroundColor: avatar.color }}></div>
            <div className="absolute bottom-1 right-0 w-1 h-2 rounded-full" style={{ backgroundColor: avatar.color }}></div>
          </div>
        );

      case "alien-green":
        return (
          <div className="relative w-full h-full">
            {/* Head */}
            <div className="absolute inset-0 rounded-full" style={{ backgroundColor: avatar.color }}></div>
            <div className="absolute inset-1 rounded-full" style={{ backgroundColor: '#34D399' }}></div>
            {/* Eyes */}
            <div className="absolute top-3 left-2 right-2 h-2 flex justify-between">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
            <div className="absolute top-3.5 left-2.5 right-2.5 h-1 flex justify-between">
              <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
            </div>
            {/* Mouth */}
            <div className="absolute top-5 left-3 right-3 h-1">
              <div className="w-full h-full border-b-2 border-black rounded-full"></div>
            </div>
            {/* Body */}
            <div className="absolute bottom-0 left-2 right-2 h-2 rounded-b-full" style={{ backgroundColor: avatar.color }}></div>
          </div>
        );

      case "rocket-ship":
        return (
          <div className="relative w-full h-full">
            {/* Rocket body */}
            <div className="absolute inset-0 rounded-full" style={{ backgroundColor: avatar.color }}></div>
            <div className="absolute inset-1 rounded-full" style={{ backgroundColor: '#F87171' }}></div>
            {/* Windows */}
            <div className="absolute top-2 left-2 right-2 h-1 flex justify-center space-x-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            {/* Fins */}
            <div className="absolute bottom-0 left-0 w-2 h-1 rounded-l-full" style={{ backgroundColor: avatar.color }}></div>
            <div className="absolute bottom-0 right-0 w-2 h-1 rounded-r-full" style={{ backgroundColor: avatar.color }}></div>
            {/* Nose */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent" style={{ borderBottomColor: avatar.color }}></div>
          </div>
        );

      case "planet-earth":
        return (
          <div className="relative w-full h-full">
            {/* Planet */}
            <div className="absolute inset-0 rounded-full" style={{ backgroundColor: avatar.color }}></div>
            <div className="absolute inset-1 rounded-full" style={{ backgroundColor: '#60A5FA' }}></div>
            {/* Continents */}
            <div className="absolute top-2 left-1 right-1 h-1 bg-green-500 rounded-full"></div>
            <div className="absolute top-4 left-2 right-2 h-1 bg-green-500 rounded-full"></div>
            <div className="absolute bottom-3 left-1 right-1 h-1 bg-green-500 rounded-full"></div>
            {/* Stars */}
            <div className="absolute top-1 left-2 w-0.5 h-0.5 bg-yellow-400 rounded-full"></div>
            <div className="absolute top-3 right-2 w-0.5 h-0.5 bg-yellow-400 rounded-full"></div>
            <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-yellow-400 rounded-full"></div>
          </div>
        );

      case "dog-astronaut":
        return (
          <div className="relative w-full h-full">
            {/* Helmet */}
            <div className="absolute inset-0 rounded-full" style={{ backgroundColor: avatar.color }}></div>
            <div className="absolute inset-1 rounded-full" style={{ backgroundColor: '#A78BFA' }}></div>
            {/* Ears */}
            <div className="absolute top-0 left-1 w-1 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
            <div className="absolute top-0 right-1 w-1 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
            {/* Face */}
            <div className="absolute top-2 left-2 right-2 h-2 flex justify-between">
              <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
            </div>
            <div className="absolute top-2.5 left-2.5 right-2.5 h-1 flex justify-between">
              <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
            </div>
            {/* Nose */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-black rounded-full"></div>
            {/* Body */}
            <div className="absolute bottom-0 left-2 right-2 h-2 rounded-b-full" style={{ backgroundColor: avatar.color }}></div>
          </div>
        );

      case "ufo-ship":
        return (
          <div className="relative w-full h-full">
            {/* UFO body */}
            <div className="absolute inset-0 rounded-full" style={{ backgroundColor: avatar.color }}></div>
            <div className="absolute inset-1 rounded-full" style={{ backgroundColor: '#22D3EE' }}></div>
            {/* Windows */}
            <div className="absolute top-2 left-2 right-2 h-1 flex justify-center space-x-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            {/* Landing gear */}
            <div className="absolute bottom-0 left-1 w-1 h-1 rounded-full" style={{ backgroundColor: avatar.color }}></div>
            <div className="absolute bottom-0 right-1 w-1 h-1 rounded-full" style={{ backgroundColor: avatar.color }}></div>
          </div>
        );

      case "star-cluster":
        return (
          <div className="relative w-full h-full">
            {/* Main star */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
            {/* Smaller stars */}
            <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-300 rounded-full"></div>
            <div className="absolute top-2 right-2 w-1 h-1 bg-yellow-300 rounded-full"></div>
            <div className="absolute bottom-2 left-2 w-1 h-1 bg-yellow-300 rounded-full"></div>
            <div className="absolute bottom-2 right-2 w-1 h-1 bg-yellow-300 rounded-full"></div>
            <div className="absolute top-1/2 left-1 transform -translate-y-1/2 w-0.5 h-0.5 bg-yellow-300 rounded-full"></div>
            <div className="absolute top-1/2 right-1 transform -translate-y-1/2 w-0.5 h-0.5 bg-yellow-300 rounded-full"></div>
          </div>
        );

      case "moon-face":
        return (
          <div className="relative w-full h-full">
            {/* Moon */}
            <div className="absolute inset-0 rounded-full" style={{ backgroundColor: avatar.color }}></div>
            <div className="absolute inset-1 rounded-full bg-gray-300 opacity-30"></div>
            {/* Eyes */}
            <div className="absolute top-3 left-2 right-2 h-2 flex justify-between">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <div className="absolute top-3.5 left-2.5 right-2.5 h-1 flex justify-between">
              <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
            </div>
            {/* Smile */}
            <div className="absolute top-5 left-2 right-2 h-1">
              <div className="w-full h-full border-b-2 border-white rounded-full"></div>
            </div>
          </div>
        );

      case "alien-purple":
        return (
          <div className="relative w-full h-full">
            {/* Head */}
            <div className="absolute inset-0 rounded-full" style={{ backgroundColor: avatar.color }}></div>
            <div className="absolute inset-1 rounded-full" style={{ backgroundColor: '#A78BFA' }}></div>
            {/* Eyes */}
            <div className="absolute top-3 left-2 right-2 h-2 flex justify-between">
              <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
            </div>
            <div className="absolute top-3.5 left-2.5 right-2.5 h-1 flex justify-between">
              <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
            </div>
            {/* Mouth */}
            <div className="absolute top-5 left-3 right-3 h-1">
              <div className="w-full h-full border-b border-black rounded-full"></div>
            </div>
            {/* Body */}
            <div className="absolute bottom-0 left-2 right-2 h-2 rounded-b-full" style={{ backgroundColor: avatar.color }}></div>
          </div>
        );

      case "comet":
        return (
          <div className="relative w-full h-full">
            {/* Comet head */}
            <div className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full"></div>
            <div className="absolute top-2.5 right-2.5 w-1 h-1 bg-pink-300 rounded-full"></div>
            {/* Tail */}
            <div className="absolute top-3 right-4 w-3 h-0.5 bg-pink-500 opacity-60 transform rotate-12"></div>
            <div className="absolute top-3.5 right-5 w-2 h-0.5 bg-pink-300 opacity-40 transform rotate-12"></div>
            <div className="absolute top-4 right-6 w-1 h-0.5 bg-pink-200 opacity-20 transform rotate-12"></div>
          </div>
        );

      case "cat-astronaut":
        return (
          <div className="relative w-full h-full">
            {/* Helmet */}
            <div className="absolute inset-0 rounded-full" style={{ backgroundColor: avatar.color }}></div>
            <div className="absolute inset-1 rounded-full" style={{ backgroundColor: '#FB923C' }}></div>
            {/* Ears */}
            <div className="absolute top-0 left-1 w-1 h-1.5 rounded-full" style={{ backgroundColor: '#F97316' }}></div>
            <div className="absolute top-0 right-1 w-1 h-1.5 rounded-full" style={{ backgroundColor: '#F97316' }}></div>
            {/* Face */}
            <div className="absolute top-2 left-2 right-2 h-2 flex justify-between">
              <div className="w-1 h-1 bg-black rounded-full"></div>
              <div className="w-1 h-1 bg-black rounded-full"></div>
            </div>
            <div className="absolute top-2.5 left-2.5 right-2.5 h-1 flex justify-between">
              <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
            </div>
            {/* Nose */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-black rounded-full"></div>
            {/* Body */}
            <div className="absolute bottom-0 left-2 right-2 h-2 rounded-b-full" style={{ backgroundColor: avatar.color }}></div>
          </div>
        );

      case "satellite":
        return (
          <div className="relative w-full h-full">
            {/* Satellite body */}
            <div className="absolute inset-0 rounded-full" style={{ backgroundColor: avatar.color }}></div>
            <div className="absolute inset-1 rounded-full" style={{ backgroundColor: '#A3E635' }}></div>
            {/* Solar panels */}
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-1 h-2 rounded-l-full" style={{ backgroundColor: avatar.color }}></div>
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-1 h-2 rounded-r-full" style={{ backgroundColor: avatar.color }}></div>
            {/* Antenna */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-1 rounded-t-full" style={{ backgroundColor: avatar.color }}></div>
            {/* Window */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: avatar.color }}>
            🚀
          </div>
        );
    }
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${className} animate-float flex items-center justify-center`}
      style={animationStyle}
    >
      {renderAvatar()}
    </div>
  );
}

export function getSpaceAvatarById(id: string): SpaceAvatar | undefined {
  return spaceAvatars.find(avatar => avatar.id === id);
}

export function getRandomSpaceAvatar(): SpaceAvatar {
  return spaceAvatars[Math.floor(Math.random() * spaceAvatars.length)];
}

export function getNextSpaceAvatar(currentId: string): SpaceAvatar {
  const currentIndex = spaceAvatars.findIndex(avatar => avatar.id === currentId);
  const nextIndex = (currentIndex + 1) % spaceAvatars.length;
  return spaceAvatars[nextIndex];
} 