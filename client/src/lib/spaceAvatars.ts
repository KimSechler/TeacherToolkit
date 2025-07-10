export interface SpaceAvatar {
  id: string;
  name: string;
  svg: string;
  animatedSvg?: string;
  color: string;
}

export const spaceAvatars: SpaceAvatar[] = [
  {
    id: "astronaut-wave",
    name: "Waving Astronaut",
    color: "#4F46E5",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="35" r="15" fill="#FFB6C1"/>
      <circle cx="50" cy="35" r="12" fill="#FFE4E1"/>
      <circle cx="48" cy="33" r="2" fill="#000"/>
      <circle cx="52" cy="33" r="2" fill="#000"/>
      <path d="M46 38 Q50 42 54 38" stroke="#FF69B4" stroke-width="1.5" fill="none"/>
      <rect x="35" y="50" width="30" height="35" rx="15" fill="#4F46E5"/>
      <rect x="37" y="52" width="26" height="31" rx="13" fill="#6366F1"/>
      <circle cx="50" cy="60" r="8" fill="#FFB6C1"/>
      <rect x="25" y="55" width="15" height="8" rx="4" fill="#4F46E5"/>
      <rect x="60" y="55" width="15" height="8" rx="4" fill="#4F46E5"/>
      <rect x="40" y="75" width="8" height="15" rx="4" fill="#4F46E5"/>
      <rect x="52" y="75" width="8" height="15" rx="4" fill="#4F46E5"/>
      <circle cx="50" cy="25" r="8" fill="#FFD700"/>
      <circle cx="50" cy="25" r="6" fill="#FFF"/>
    </svg>`,
    animatedSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="35" r="15" fill="#FFB6C1">
        <animate attributeName="cy" values="35;33;35" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="50" cy="35" r="12" fill="#FFE4E1">
        <animate attributeName="cy" values="35;33;35" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="48" cy="33" r="2" fill="#000">
        <animate attributeName="cy" values="33;31;33" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="52" cy="33" r="2" fill="#000">
        <animate attributeName="cy" values="33;31;33" dur="2s" repeatCount="indefinite"/>
      </circle>
      <path d="M46 38 Q50 42 54 38" stroke="#FF69B4" stroke-width="1.5" fill="none">
        <animate attributeName="d" values="M46 38 Q50 42 54 38;M46 38 Q50 40 54 38;M46 38 Q50 42 54 38" dur="2s" repeatCount="indefinite"/>
      </path>
      <rect x="35" y="50" width="30" height="35" rx="15" fill="#4F46E5"/>
      <rect x="37" y="52" width="26" height="31" rx="13" fill="#6366F1"/>
      <circle cx="50" cy="60" r="8" fill="#FFB6C1"/>
      <rect x="25" y="55" width="15" height="8" rx="4" fill="#4F46E5">
        <animate attributeName="x" values="25;27;25" dur="1s" repeatCount="indefinite"/>
      </rect>
      <rect x="60" y="55" width="15" height="8" rx="4" fill="#4F46E5"/>
      <rect x="40" y="75" width="8" height="15" rx="4" fill="#4F46E5"/>
      <rect x="52" y="75" width="8" height="15" rx="4" fill="#4F46E5"/>
      <circle cx="50" cy="25" r="8" fill="#FFD700">
        <animate attributeName="r" values="8;10;8" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="50" cy="25" r="6" fill="#FFF">
        <animate attributeName="r" values="6;8;6" dur="3s" repeatCount="indefinite"/>
      </circle>
    </svg>`
  },
  {
    id: "alien-green",
    name: "Green Alien",
    color: "#10B981",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="40" rx="20" ry="25" fill="#10B981"/>
      <ellipse cx="50" cy="40" rx="18" ry="23" fill="#34D399"/>
      <circle cx="42" cy="35" r="4" fill="#000"/>
      <circle cx="58" cy="35" r="4" fill="#000"/>
      <circle cx="44" cy="33" r="1.5" fill="#FFF"/>
      <circle cx="60" cy="33" r="1.5" fill="#FFF"/>
      <path d="M45 45 Q50 50 55 45" stroke="#000" stroke-width="2" fill="none"/>
      <rect x="35" y="65" width="30" height="25" rx="12" fill="#10B981"/>
      <rect x="37" y="67" width="26" height="21" rx="10" fill="#34D399"/>
      <rect x="30" y="70" width="8" height="15" rx="4" fill="#10B981"/>
      <rect x="62" y="70" width="8" height="15" rx="4" fill="#10B981"/>
      <rect x="40" y="85" width="6" height="12" rx="3" fill="#10B981"/>
      <rect x="54" y="85" width="6" height="12" rx="3" fill="#10B981"/>
      <circle cx="50" cy="30" r="3" fill="#FFD700"/>
      <circle cx="50" cy="30" r="2" fill="#FFF"/>
    </svg>`
  },
  {
    id: "rocket-ship",
    name: "Rocket Ship",
    color: "#EF4444",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 20 L60 40 L40 40 Z" fill="#EF4444"/>
      <rect x="45" y="40" width="10" height="25" fill="#EF4444"/>
      <rect x="47" y="42" width="6" height="21" fill="#F87171"/>
      <circle cx="50" cy="50" r="3" fill="#FFF"/>
      <circle cx="50" cy="55" r="3" fill="#FFF"/>
      <circle cx="50" cy="60" r="3" fill="#FFF"/>
      <rect x="42" y="65" width="16" height="8" rx="4" fill="#EF4444"/>
      <rect x="44" y="67" width="12" height="4" rx="2" fill="#F87171"/>
      <path d="M35 70 L45 75 L45 65 Z" fill="#EF4444"/>
      <path d="M65 70 L55 75 L55 65 Z" fill="#EF4444"/>
      <circle cx="50" cy="25" r="2" fill="#FFD700"/>
      <circle cx="50" cy="25" r="1" fill="#FFF"/>
    </svg>`,
    animatedSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 20 L60 40 L40 40 Z" fill="#EF4444">
        <animate attributeName="d" values="M50 20 L60 40 L40 40 Z;M50 18 L60 38 L40 38 Z;M50 20 L60 40 L40 40 Z" dur="2s" repeatCount="indefinite"/>
      </path>
      <rect x="45" y="40" width="10" height="25" fill="#EF4444"/>
      <rect x="47" y="42" width="6" height="21" fill="#F87171"/>
      <circle cx="50" cy="50" r="3" fill="#FFF">
        <animate attributeName="r" values="3;4;3" dur="1s" repeatCount="indefinite"/>
      </circle>
      <circle cx="50" cy="55" r="3" fill="#FFF">
        <animate attributeName="r" values="3;4;3" dur="1s" repeatCount="indefinite" begin="0.3s"/>
      </circle>
      <circle cx="50" cy="60" r="3" fill="#FFF">
        <animate attributeName="r" values="3;4;3" dur="1s" repeatCount="indefinite" begin="0.6s"/>
      </circle>
      <rect x="42" y="65" width="16" height="8" rx="4" fill="#EF4444"/>
      <rect x="44" y="67" width="12" height="4" rx="2" fill="#F87171"/>
      <path d="M35 70 L45 75 L45 65 Z" fill="#EF4444">
        <animate attributeName="d" values="M35 70 L45 75 L45 65 Z;M33 70 L43 75 L43 65 Z;M35 70 L45 75 L45 65 Z" dur="2s" repeatCount="indefinite"/>
      </path>
      <path d="M65 70 L55 75 L55 65 Z" fill="#EF4444">
        <animate attributeName="d" values="M65 70 L55 75 L55 65 Z;M67 70 L57 75 L57 65 Z;M65 70 L55 75 L55 65 Z" dur="2s" repeatCount="indefinite"/>
      </path>
      <circle cx="50" cy="25" r="2" fill="#FFD700">
        <animate attributeName="r" values="2;3;2" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="50" cy="25" r="1" fill="#FFF">
        <animate attributeName="r" values="1;2;1" dur="3s" repeatCount="indefinite"/>
      </circle>
    </svg>`
  },
  {
    id: "planet-earth",
    name: "Earth Planet",
    color: "#3B82F6",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="25" fill="#3B82F6"/>
      <circle cx="50" cy="50" r="23" fill="#60A5FA"/>
      <path d="M30 40 Q40 35 50 40 Q60 45 70 40" stroke="#10B981" stroke-width="3" fill="none"/>
      <path d="M35 50 Q45 45 55 50 Q65 55 75 50" stroke="#10B981" stroke-width="3" fill="none"/>
      <path d="M25 60 Q35 55 45 60 Q55 65 65 60" stroke="#10B981" stroke-width="3" fill="none"/>
      <circle cx="40" cy="35" r="2" fill="#F59E0B"/>
      <circle cx="60" cy="45" r="2" fill="#F59E0B"/>
      <circle cx="35" cy="55" r="2" fill="#F59E0B"/>
      <circle cx="50" cy="25" r="3" fill="#FFD700"/>
      <circle cx="50" cy="25" r="2" fill="#FFF"/>
    </svg>`
  },
  {
    id: "dog-astronaut",
    name: "Dog Astronaut",
    color: "#8B5CF6",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="35" r="15" fill="#F59E0B"/>
      <circle cx="50" cy="35" r="13" fill="#FCD34D"/>
      <ellipse cx="45" cy="30" rx="3" ry="4" fill="#000"/>
      <ellipse cx="55" cy="30" rx="3" ry="4" fill="#000"/>
      <circle cx="46" cy="28" r="1" fill="#FFF"/>
      <circle cx="56" cy="28" r="1" fill="#FFF"/>
      <ellipse cx="50" cy="40" rx="2" ry="1" fill="#000"/>
      <ellipse cx="40" cy="25" rx="2" ry="3" fill="#F59E0B"/>
      <ellipse cx="60" cy="25" rx="2" ry="3" fill="#F59E0B"/>
      <rect x="35" y="50" width="30" height="35" rx="15" fill="#8B5CF6"/>
      <rect x="37" y="52" width="26" height="31" rx="13" fill="#A78BFA"/>
      <circle cx="50" cy="60" r="8" fill="#F59E0B"/>
      <rect x="25" y="55" width="15" height="8" rx="4" fill="#8B5CF6"/>
      <rect x="60" y="55" width="15" height="8" rx="4" fill="#8B5CF6"/>
      <rect x="40" y="75" width="8" height="15" rx="4" fill="#8B5CF6"/>
      <rect x="52" y="75" width="8" height="15" rx="4" fill="#8B5CF6"/>
      <circle cx="50" cy="25" r="3" fill="#FFD700"/>
      <circle cx="50" cy="25" r="2" fill="#FFF"/>
    </svg>`
  },
  {
    id: "ufo-ship",
    name: "UFO Ship",
    color: "#06B6D4",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="45" rx="25" ry="8" fill="#06B6D4"/>
      <ellipse cx="50" cy="45" rx="23" ry="6" fill="#22D3EE"/>
      <ellipse cx="50" cy="40" rx="15" ry="5" fill="#06B6D4"/>
      <ellipse cx="50" cy="40" rx="13" ry="3" fill="#22D3EE"/>
      <circle cx="40" cy="38" r="2" fill="#FFF"/>
      <circle cx="50" cy="38" r="2" fill="#FFF"/>
      <circle cx="60" cy="38" r="2" fill="#FFF"/>
      <rect x="35" y="50" width="30" height="8" rx="4" fill="#06B6D4"/>
      <rect x="37" y="52" width="26" height="4" rx="2" fill="#22D3EE"/>
      <circle cx="30" y="55" r="3" fill="#06B6D4"/>
      <circle cx="70" y="55" r="3" fill="#06B6D4"/>
      <circle cx="50" cy="25" r="2" fill="#FFD700"/>
      <circle cx="50" cy="25" r="1" fill="#FFF"/>
    </svg>`
  },
  {
    id: "star-cluster",
    name: "Star Cluster",
    color: "#F59E0B",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 20 L55 35 L70 35 L60 45 L65 60 L50 50 L35 60 L40 45 L30 35 L45 35 Z" fill="#F59E0B"/>
      <path d="M25 40 L27 50 L37 50 L30 55 L32 65 L25 60 L18 65 L20 55 L13 50 L23 50 Z" fill="#FCD34D"/>
      <path d="M75 40 L77 50 L87 50 L80 55 L82 65 L75 60 L68 65 L70 55 L63 50 L73 50 Z" fill="#FCD34D"/>
      <path d="M40 70 L42 80 L52 80 L45 85 L47 95 L40 90 L33 95 L35 85 L28 80 L38 80 Z" fill="#FCD34D"/>
      <path d="M60 70 L62 80 L72 80 L65 85 L67 95 L60 90 L53 95 L55 85 L48 80 L58 80 Z" fill="#FCD34D"/>
      <circle cx="50" cy="25" r="2" fill="#FFD700"/>
      <circle cx="50" cy="25" r="1" fill="#FFF"/>
    </svg>`
  },
  {
    id: "moon-face",
    name: "Moon Face",
    color: "#6B7280",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 20 A30 30 0 0 1 80 50 A30 30 0 0 1 50 80 A30 30 0 0 1 20 50 A30 30 0 0 1 50 20 Z" fill="#6B7280"/>
      <path d="M50 20 A30 30 0 0 1 80 50 A30 30 0 0 1 50 80 A30 30 0 0 1 20 50 A30 30 0 0 1 50 20 Z" fill="#9CA3AF" opacity="0.3"/>
      <circle cx="40" cy="40" r="3" fill="#FFF"/>
      <circle cx="60" cy="40" r="3" fill="#FFF"/>
      <circle cx="42" cy="38" r="1" fill="#000"/>
      <circle cx="62" cy="38" r="1" fill="#000"/>
      <path d="M45 55 Q50 60 55 55" stroke="#FFF" stroke-width="2" fill="none"/>
      <circle cx="50" cy="25" r="2" fill="#FFD700"/>
      <circle cx="50" cy="25" r="1" fill="#FFF"/>
    </svg>`
  },
  {
    id: "alien-purple",
    name: "Purple Alien",
    color: "#8B5CF6",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="40" rx="18" ry="22" fill="#8B5CF6"/>
      <ellipse cx="50" cy="40" rx="16" ry="20" fill="#A78BFA"/>
      <circle cx="44" cy="35" r="3" fill="#000"/>
      <circle cx="56" cy="35" r="3" fill="#000"/>
      <circle cx="46" cy="33" r="1" fill="#FFF"/>
      <circle cx="58" cy="33" r="1" fill="#FFF"/>
      <path d="M47 45 Q50 48 53 45" stroke="#000" stroke-width="1.5" fill="none"/>
      <rect x="35" y="62" width="30" height="28" rx="14" fill="#8B5CF6"/>
      <rect x="37" y="64" width="26" height="24" rx="12" fill="#A78BFA"/>
      <rect x="32" y="68" width="6" height="16" rx="3" fill="#8B5CF6"/>
      <rect x="62" y="68" width="6" height="16" rx="3" fill="#8B5CF6"/>
      <rect x="42" y="85" width="5" height="12" rx="2.5" fill="#8B5CF6"/>
      <rect x="53" y="85" width="5" height="12" rx="2.5" fill="#8B5CF6"/>
      <circle cx="50" cy="30" r="2" fill="#FFD700"/>
      <circle cx="50" cy="30" r="1" fill="#FFF"/>
    </svg>`
  },
  {
    id: "comet",
    name: "Comet",
    color: "#EC4899",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="30" r="8" fill="#EC4899"/>
      <circle cx="70" cy="30" r="6" fill="#F472B6"/>
      <circle cx="72" cy="28" r="2" fill="#FFF"/>
      <path d="M70 30 L20 70 L25 75 L75 35 Z" fill="#EC4899" opacity="0.6"/>
      <path d="M70 30 L15 65 L20 70 L75 35 Z" fill="#F472B6" opacity="0.4"/>
      <path d="M70 30 L10 60 L15 65 L75 35 Z" fill="#F9A8D4" opacity="0.2"/>
      <circle cx="50" cy="25" r="2" fill="#FFD700"/>
      <circle cx="50" cy="25" r="1" fill="#FFF"/>
    </svg>`
  },
  {
    id: "cat-astronaut",
    name: "Cat Astronaut",
    color: "#F97316",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="35" r="15" fill="#F97316"/>
      <circle cx="50" cy="35" r="13" fill="#FB923C"/>
      <ellipse cx="45" cy="30" rx="2.5" ry="3" fill="#000"/>
      <ellipse cx="55" cy="30" rx="2.5" ry="3" fill="#000"/>
      <circle cx="46" cy="28" r="0.8" fill="#FFF"/>
      <circle cx="56" cy="28" r="0.8" fill="#FFF"/>
      <ellipse cx="50" cy="40" rx="1.5" ry="0.8" fill="#000"/>
      <ellipse cx="40" cy="25" rx="1.5" ry="2" fill="#F97316"/>
      <ellipse cx="60" cy="25" rx="1.5" ry="2" fill="#F97316"/>
      <rect x="35" y="50" width="30" height="35" rx="15" fill="#F97316"/>
      <rect x="37" y="52" width="26" height="31" rx="13" fill="#FB923C"/>
      <circle cx="50" cy="60" r="8" fill="#F97316"/>
      <rect x="25" y="55" width="15" height="8" rx="4" fill="#F97316"/>
      <rect x="60" y="55" width="15" height="8" rx="4" fill="#F97316"/>
      <rect x="40" y="75" width="8" height="15" rx="4" fill="#F97316"/>
      <rect x="52" y="75" width="8" height="15" rx="4" fill="#F97316"/>
      <circle cx="50" cy="25" r="2" fill="#FFD700"/>
      <circle cx="50" cy="25" r="1" fill="#FFF"/>
    </svg>`
  },
  {
    id: "satellite",
    name: "Satellite",
    color: "#84CC16",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="30" width="20" height="15" rx="3" fill="#84CC16"/>
      <rect x="42" y="32" width="16" height="11" rx="2" fill="#A3E635"/>
      <rect x="45" y="35" width="10" height="5" fill="#84CC16"/>
      <rect x="25" y="35" width="15" height="5" rx="2.5" fill="#84CC16"/>
      <rect x="60" y="35" width="15" height="5" rx="2.5" fill="#84CC16"/>
      <rect x="35" y="45" width="30" height="8" rx="4" fill="#84CC16"/>
      <rect x="37" y="47" width="26" height="4" rx="2" fill="#A3E635"/>
      <rect x="30" y="50" width="8" height="15" rx="4" fill="#84CC16"/>
      <rect x="62" y="50" width="8" height="15" rx="4" fill="#84CC16"/>
      <circle cx="50" cy="40" r="2" fill="#FFF"/>
      <circle cx="50" cy="25" r="2" fill="#FFD700"/>
      <circle cx="50" cy="25" r="1" fill="#FFF"/>
    </svg>`
  }
];

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