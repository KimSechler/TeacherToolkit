export interface EmojiSuggestion {
  emoji: string;
  relevance: number;
  category: string;
}

// Comprehensive emoji database with more categories and emojis
const emojiCategories = {
  emotions: {
    happy: ['😊', '😄', '😃', '😁', '😆', '😍', '🤩', '😎', '🥳', '😋', '😌', '😉', '😇', '🤗', '😘', '🥰'],
    sad: ['😢', '😭', '😔', '😞', '😥', '😪', '😴', '😵', '🥺', '😿', '😰', '😨', '😱', '😓', '😩', '😫'],
    excited: ['🤩', '😍', '🥳', '😎', '🤗', '😊', '😄', '😃', '😁', '😆', '🤪', '😜', '😝', '🤓', '🧐', '🤠'],
    tired: ['😴', '😪', '😵', '🥱', '😴', '😔', '😞', '😥', '😿', '😢', '😰', '😨', '😱', '😓', '😩', '😫'],
    angry: ['😠', '😡', '🤬', '😤', '😾', '💢', '👿', '😈', '🤯', '😤', '😠', '😡', '🤬', '😤', '😾', '💢'],
    surprised: ['😲', '😯', '😳', '😱', '🤯', '😨', '😰', '😓', '😵', '🥴', '😲', '😯', '😳', '😱', '🤯', '😨']
  },
  animals: {
    dog: ['🐕', '🐶', '🦮', '🐕‍🦺', '🐩', '🐕‍🦺', '🐕', '🐶', '🦮', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🐈‍⬛'],
    cat: ['🐱', '🐈', '🐈‍⬛', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🐯', '🐅', '🐆', '🐴'],
    bird: ['🐦', '🦅', '🦆', '🦉', '🦇', '🐧', '🦢', '🦚', '🦜', '🦩', '🦨', '🦡', '🦫', '🦦', '🦥', '🐿️'],
    fish: ['🐠', '🐟', '🐡', '🦈', '🐋', '🐳', '🐊', '🐢', '🦎', '🐍', '🐸', '🐊', '🐢', '🦎', '🐍', '🐸'],
    farm: ['🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆'],
    wild: ['🦁', '🐯', '🐅', '🐆', '🐴', '🦄', '🦓', '🦌', '🐂', '🐃', '🐄', '🐎', '🐖', '🐏', '🐑', '🐐']
  },
  food: {
    pizza: ['🍕', '🍕', '🍕', '🍕', '🍕', '🍕', '🍕', '🍕', '🍕', '🍕', '🍕', '🍕', '🍕', '🍕', '🍕', '🍕'],
    icecream: ['🍦', '🍨', '🍧', '🍩', '🍪', '🍰', '🧁', '🍭', '🍬', '🍫', '🍯', '🍯', '🍯', '🍯', '🍯', '🍯'],
    fruit: ['🍎', '🍌', '🍊', '🍇', '🍓', '🍑', '🍒', '🥝', '🥭', '🍍', '🥥', '🥑', '🍅', '🥝', '🥭', '🍍'],
    vegetables: ['🥕', '🥦', '🥬', '🥒', '🍅', '🌽', '🥑', '🥝', '🍆', '🥔', '🧅', '🧄', '🥜', '🌰', '🥑', '🥝'],
    drinks: ['🥤', '🧃', '🥛', '🍼', '🫖', '☕', '🍵', '🧋', '🥤', '🧃', '🥛', '🍼', '🫖', '☕', '🍵', '🧋'],
    snacks: ['🍿', '🧂', '🥨', '🥯', '🥖', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴']
  },
  activities: {
    play: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🎯', '🎳'],
    draw: ['🎨', '🖌️', '🖼️', '🎭', '🎪', '🎟️', '🎫', '🎬', '🎤', '🎧', '🎼', '🎹', '🎸', '🎺', '🎻', '🥁'],
    music: ['🎵', '🎶', '🎼', '🎹', '🎸', '🎺', '🎻', '🥁', '🪘', '🪕', '🎤', '🎧', '🎼', '🎹', '🎸', '🎺'],
    games: ['🎮', '🕹️', '🎲', '♟️', '🎯', '🎳', '🎰', '🎪', '🎭', '🎨', '🎤', '🎧', '🎼', '🎹', '🎸', '🎺'],
    sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🎯', '🎳'],
    outdoor: ['🏕️', '⛺', '🏖️', '🏝️', '🏔️', '🗻', '🌋', '🏜️', '🏞️', '🏟️', '🏛️', '🏗️', '🏘️', '🏙️', '🏚️', '🏠']
  },
  colors: {
    red: ['🔴', '❤️', '💖', '💝', '💕', '💗', '💓', '💞', '💟', '❣️', '💔', '❤️‍🔥', '❤️‍🩹', '🧡', '💛', '💚'],
    blue: ['🔵', '💙', '💎', '🔷', '🔹', '💠', '🔮', '💎', '🔵', '💙', '💎', '🔷', '🔹', '💠', '🔮', '💎'],
    green: ['🟢', '💚', '🌿', '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌷', '🌸', '💮', '🏵️', '🌹', '🥀', '🌺'],
    yellow: ['🟡', '💛', '⭐', '🌟', '✨', '💫', '🌙', '☀️', '🌞', '⭐', '🌟', '✨', '💫', '🌙', '☀️', '🌞'],
    purple: ['🟣', '💜', '🟪', '💜', '🟪', '💜', '🟪', '💜', '🟪', '💜', '🟪', '💜', '🟪', '💜', '🟪', '💜'],
    pink: ['🩷', '💖', '💝', '💕', '💗', '💓', '💞', '💟', '❣️', '💔', '❤️‍🔥', '❤️‍🩹', '🧡', '💛', '💚', '💙']
  },
  weather: {
    sunny: ['☀️', '🌞', '🌅', '🌄', '☀️', '🌞', '🌅', '🌄', '☀️', '🌞', '🌅', '🌄', '☀️', '🌞', '🌅', '🌄'],
    rainy: ['🌧️', '🌦️', '🌨️', '⛈️', '🌩️', '🌧️', '🌦️', '🌨️', '⛈️', '🌩️', '🌧️', '🌦️', '🌨️', '⛈️', '🌩️', '🌧️'],
    cloudy: ['☁️', '⛅', '🌤️', '🌥️', '☁️', '⛅', '🌤️', '🌥️', '☁️', '⛅', '🌤️', '🌥️', '☁️', '⛅', '🌤️', '🌥️'],
    snowy: ['❄️', '🌨️', '⛄', '☃️', '❄️', '🌨️', '⛄', '☃️', '❄️', '🌨️', '⛄', '☃️', '❄️', '🌨️', '⛄', '☃️'],
    stormy: ['⛈️', '🌩️', '⚡', '⛈️', '🌩️', '⚡', '⛈️', '🌩️', '⚡', '⛈️', '🌩️', '⚡', '⛈️', '🌩️', '⚡', '⛈️'],
    windy: ['💨', '🌪️', '💨', '🌪️', '💨', '🌪️', '💨', '🌪️', '💨', '🌪️', '💨', '🌪️', '💨', '🌪️', '💨', '🌪️']
  },
  objects: {
    school: ['📚', '📖', '📝', '✏️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📐', '📏', '📌', '📍', '✂️', '🖇️', '📎'],
    home: ['🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩'],
    tech: ['💻', '🖥️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '📱', '📲', '📟', '📠', '🔋', '🔌', '💡'],
    transport: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵'],
    nature: ['🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🌺', '🌸', '🌼', '🌻'],
    space: ['🌍', '🌎', '🌏', '🌐', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌙', '🌚', '🌛', '🌜']
  }
};

// Enhanced keywords for smart matching with more comprehensive coverage
const keywordMap: Record<string, string[]> = {
  // Emotions
  'happy': ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'awesome', 'good', 'nice', 'pleased', 'delighted', 'thrilled', 'ecstatic', 'elated', 'jubilant'],
  'sad': ['sad', 'unhappy', 'upset', 'crying', 'tears', 'miserable', 'depressed', 'gloomy', 'melancholy', 'sorrowful', 'heartbroken', 'devastated', 'disappointed', 'frustrated', 'angry', 'mad'],
  'excited': ['excited', 'thrilled', 'pumped', 'energetic', 'enthusiastic', 'eager', 'animated', 'buzzed', 'hyped', 'stoked', 'fired up', 'motivated', 'inspired', 'passionate', 'zealous', 'ardent'],
  'tired': ['tired', 'sleepy', 'exhausted', 'weary', 'fatigued', 'drowsy', 'rest', 'sleep', 'nap', 'drained', 'spent', 'worn out', 'beat', 'pooped', 'bushed', 'knackered'],
  'angry': ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'rage', 'wrath', 'fury', 'outrage', 'indignation', 'resentment', 'bitterness', 'hostility', 'aggression', 'violence'],
  'surprised': ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'bewildered', 'confused', 'perplexed', 'puzzled', 'baffled', 'mystified', 'flabbergasted', 'gobsmacked', 'dumbfounded', 'speechless', 'awestruck'],
  
  // Animals
  'dog': ['dog', 'puppy', 'canine', 'pet', 'woof', 'bark', 'hound', 'mutt', 'pooch', 'doggie', 'pup', 'k9', 'fido', 'spot', 'rover', 'max'],
  'cat': ['cat', 'kitten', 'feline', 'meow', 'purr', 'kitty', 'pussycat', 'tomcat', 'tabby', 'siamese', 'persian', 'maine coon', 'ragdoll', 'british shorthair', 'sphynx', 'bengal'],
  'bird': ['bird', 'fly', 'wing', 'feather', 'tweet', 'chirp', 'sparrow', 'robin', 'cardinal', 'bluejay', 'finch', 'canary', 'parrot', 'macaw', 'cockatiel', 'budgie'],
  'fish': ['fish', 'swim', 'ocean', 'sea', 'water', 'aquatic', 'goldfish', 'tropical', 'clownfish', 'angelfish', 'tetra', 'guppy', 'molly', 'platy', 'swordtail', 'betta'],
  'farm': ['farm', 'cow', 'pig', 'chicken', 'horse', 'sheep', 'goat', 'duck', 'turkey', 'rooster', 'hen', 'calf', 'piglet', 'foal', 'lamb', 'kid'],
  'wild': ['wild', 'lion', 'tiger', 'bear', 'wolf', 'fox', 'deer', 'elephant', 'giraffe', 'zebra', 'monkey', 'gorilla', 'chimpanzee', 'orangutan', 'lemur', 'sloth'],
  
  // Food
  'pizza': ['pizza', 'cheese', 'tomato', 'slice', 'pie', 'pepperoni', 'margherita', 'hawaiian', 'supreme', 'deluxe', 'veggie', 'meat lovers', 'bbq chicken', 'buffalo chicken', 'white pizza', 'calzone'],
  'icecream': ['ice cream', 'icecream', 'cold', 'sweet', 'dessert', 'cone', 'sundae', 'milkshake', 'sorbet', 'gelato', 'frozen yogurt', 'soft serve', 'hard serve', 'vanilla', 'chocolate', 'strawberry'],
  'fruit': ['fruit', 'apple', 'banana', 'orange', 'grape', 'berry', 'strawberry', 'blueberry', 'raspberry', 'blackberry', 'cherry', 'peach', 'pear', 'plum', 'apricot', 'nectarine'],
  'vegetables': ['vegetable', 'veggie', 'carrot', 'broccoli', 'healthy', 'green', 'spinach', 'kale', 'lettuce', 'cucumber', 'tomato', 'pepper', 'onion', 'garlic', 'potato', 'sweet potato'],
  'drinks': ['drink', 'beverage', 'juice', 'soda', 'pop', 'cola', 'water', 'milk', 'tea', 'coffee', 'hot chocolate', 'lemonade', 'smoothie', 'milkshake', 'slushie', 'energy drink'],
  'snacks': ['snack', 'chips', 'crackers', 'popcorn', 'nuts', 'pretzels', 'cookies', 'candy', 'chocolate', 'gum', 'mints', 'jerky', 'trail mix', 'granola bar', 'protein bar', 'fruit snacks'],
  
  // Activities
  'play': ['play', 'game', 'fun', 'sport', 'run', 'jump', 'move', 'exercise', 'workout', 'dance', 'swim', 'bike', 'skate', 'skateboard', 'rollerblade', 'trampoline'],
  'draw': ['draw', 'paint', 'art', 'color', 'create', 'design', 'sketch', 'illustrate', 'doodle', 'scribble', 'trace', 'shade', 'blend', 'mix', 'palette', 'canvas'],
  'music': ['music', 'sing', 'song', 'dance', 'rhythm', 'melody', 'sound', 'beat', 'tune', 'harmony', 'chord', 'note', 'scale', 'pitch', 'tempo', 'volume'],
  'games': ['game', 'play', 'fun', 'entertainment', 'video', 'board', 'card', 'puzzle', 'trivia', 'quiz', 'riddle', 'word game', 'number game', 'strategy', 'adventure', 'action'],
  'sports': ['sport', 'athletic', 'competition', 'team', 'individual', 'soccer', 'football', 'basketball', 'baseball', 'tennis', 'golf', 'swimming', 'track', 'field', 'gymnastics', 'martial arts'],
  'outdoor': ['outdoor', 'outside', 'nature', 'camping', 'hiking', 'fishing', 'hunting', 'gardening', 'picnic', 'barbecue', 'bonfire', 'stargazing', 'bird watching', 'rock climbing', 'zip lining', 'rafting'],
  
  // Colors
  'red': ['red', 'crimson', 'scarlet', 'ruby', 'cherry', 'burgundy', 'maroon', 'rose', 'pink', 'magenta', 'fuchsia', 'coral', 'salmon', 'tomato', 'fire', 'blood'],
  'blue': ['blue', 'azure', 'navy', 'cobalt', 'sapphire', 'indigo', 'turquoise', 'teal', 'cyan', 'sky', 'ocean', 'sea', 'water', 'ice', 'cold', 'cool'],
  'green': ['green', 'emerald', 'forest', 'lime', 'mint', 'sage', 'olive', 'jade', 'moss', 'grass', 'leaf', 'nature', 'environment', 'eco', 'organic', 'fresh'],
  'yellow': ['yellow', 'gold', 'amber', 'lemon', 'sunshine', 'bright', 'cheerful', 'happy', 'warm', 'sunny', 'light', 'pale', 'cream', 'ivory', 'beige', 'tan'],
  'purple': ['purple', 'violet', 'lavender', 'plum', 'grape', 'orchid', 'magenta', 'fuchsia', 'mauve', 'lilac', 'amethyst', 'royal', 'noble', 'mystical', 'spiritual', 'creative'],
  'pink': ['pink', 'rose', 'blush', 'salmon', 'coral', 'peach', 'fuchsia', 'magenta', 'hot pink', 'light pink', 'dark pink', 'baby pink', 'dusty rose', 'rose gold', 'cherry blossom', 'cotton candy'],
  
  // Weather
  'sunny': ['sun', 'sunny', 'bright', 'warm', 'hot', 'summer', 'clear', 'cloudless', 'beautiful', 'perfect', 'gorgeous', 'stunning', 'amazing', 'wonderful', 'fantastic', 'excellent'],
  'rainy': ['rain', 'rainy', 'wet', 'storm', 'thunder', 'lightning', 'drizzle', 'shower', 'downpour', 'sprinkle', 'mist', 'fog', 'haze', 'damp', 'moist', 'humid'],
  'cloudy': ['cloud', 'cloudy', 'gray', 'overcast', 'dull', 'gloomy', 'dreary', 'dark', 'shadowy', 'dim', 'foggy', 'misty', 'hazy', 'smoggy', 'murky', 'obscure'],
  'snowy': ['snow', 'snowy', 'cold', 'winter', 'frost', 'ice', 'blizzard', 'flurry', 'sleet', 'hail', 'freezing', 'chilly', 'frigid', 'arctic', 'polar', 'frozen'],
  'stormy': ['storm', 'stormy', 'thunder', 'lightning', 'tornado', 'hurricane', 'typhoon', 'cyclone', 'tempest', 'gale', 'wind', 'breeze', 'gust', 'blast', 'squall', 'whirlwind'],
  'windy': ['wind', 'windy', 'breeze', 'gust', 'blast', 'squall', 'whirlwind', 'tornado', 'hurricane', 'typhoon', 'cyclone', 'tempest', 'gale', 'draft', 'air', 'atmosphere'],
  
  // Objects
  'school': ['school', 'learn', 'study', 'education', 'teacher', 'student', 'class', 'lesson', 'homework', 'test', 'exam', 'quiz', 'assignment', 'project', 'research', 'knowledge'],
  'home': ['home', 'house', 'family', 'living', 'bedroom', 'kitchen', 'bathroom', 'living room', 'dining room', 'garage', 'yard', 'garden', 'backyard', 'front yard', 'patio', 'deck'],
  'tech': ['technology', 'computer', 'phone', 'tablet', 'laptop', 'desktop', 'smartphone', 'mobile', 'digital', 'electronic', 'device', 'gadget', 'app', 'software', 'hardware', 'internet'],
  'transport': ['transport', 'vehicle', 'car', 'bus', 'train', 'plane', 'bike', 'motorcycle', 'scooter', 'skateboard', 'rollerblade', 'walk', 'run', 'jog', 'hike', 'travel'],
  'nature': ['nature', 'natural', 'environment', 'earth', 'planet', 'world', 'universe', 'cosmos', 'galaxy', 'star', 'planet', 'moon', 'sun', 'sky', 'cloud', 'tree'],
  'space': ['space', 'outer space', 'universe', 'cosmos', 'galaxy', 'star', 'planet', 'moon', 'sun', 'earth', 'mars', 'jupiter', 'saturn', 'neptune', 'uranus', 'pluto']
};

export function getSmartEmojiSuggestions(answerText: string, count: number = 5): EmojiSuggestion[] {
  const suggestions: EmojiSuggestion[] = [];
  const lowerText = answerText.toLowerCase();
  
  // Find matching categories based on keywords
  const matchedCategories: string[] = [];
  
  for (const [category, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      matchedCategories.push(category);
    }
  }
  
  // Get emojis from matched categories
  for (const category of matchedCategories) {
    const categoryEmojis = getCategoryEmojis(category);
    if (categoryEmojis) {
      categoryEmojis.forEach((emoji, index) => {
        suggestions.push({
          emoji,
          relevance: 1 - (index * 0.05), // Higher relevance for first emojis
          category
        });
      });
    }
  }
  
  // Add fallback emojis if not enough suggestions
  if (suggestions.length < count) {
    const fallbackEmojis = ['😊', '⭐', '🎉', '💫', '✨', '🌟', '💎', '🎨', '🎵', '🎮', '🎯', '🎪', '🎭', '🎨', '🎤', '🎧'];
    const remaining = count - suggestions.length;
    
    for (let i = 0; i < remaining; i++) {
      suggestions.push({
        emoji: fallbackEmojis[i % fallbackEmojis.length],
        relevance: 0.5,
        category: 'general'
      });
    }
  }
  
  // Sort by relevance and return top suggestions
  return suggestions
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, count);
}

function getCategoryEmojis(category: string): string[] | null {
  // Navigate through the nested structure
  for (const [mainCategory, subCategories] of Object.entries(emojiCategories)) {
    if (subCategories[category as keyof typeof subCategories]) {
      return subCategories[category as keyof typeof subCategories];
    }
  }
  return null;
}

export function getEmojiCategories(): string[] {
  return Object.keys(emojiCategories);
}

export function getEmojisByCategory(category: string): string[] {
  const categoryEmojis = emojiCategories[category as keyof typeof emojiCategories];
  if (!categoryEmojis) return [];
  
  // Flatten all emojis from subcategories
  const allEmojis: string[] = [];
  for (const subCategory of Object.values(categoryEmojis)) {
    allEmojis.push(...subCategory);
  }
  
  return allEmojis;
}

// Get all emojis for the full picker
export function getAllEmojis(): string[] {
  const allEmojis: string[] = [];
  for (const category of Object.values(emojiCategories)) {
    for (const subCategory of Object.values(category)) {
      allEmojis.push(...subCategory);
    }
  }
  return Array.from(new Set(allEmojis)); // Remove duplicates
} 