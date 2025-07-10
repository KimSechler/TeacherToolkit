export interface QuestionOfDay {
  id: number;
  text: string;
  category: string;
  answers: string[];
  visualType: 'yesNo' | 'colors' | 'animals' | 'food' | 'activities' | 'emotions' | 'weather' | 'custom';
  lastUsed?: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const questionLibrary: QuestionOfDay[] = [
  // FOOD CATEGORY
  {
    id: 1,
    text: "Do you like pizza?",
    category: "food",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 2,
    text: "What's your favorite ice cream flavor?",
    category: "food",
    answers: ["Chocolate", "Vanilla", "Strawberry", "Other"],
    visualType: "food",
    difficulty: "easy"
  },
  {
    id: 3,
    text: "Do you like vegetables?",
    category: "food",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 4,
    text: "What's your favorite fruit?",
    category: "food",
    answers: ["Apple", "Banana", "Orange", "Grapes"],
    visualType: "food",
    difficulty: "easy"
  },
  {
    id: 5,
    text: "Do you like hot dogs?",
    category: "food",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // ANIMALS CATEGORY
  {
    id: 6,
    text: "What's your favorite animal?",
    category: "animals",
    answers: ["Dog", "Cat", "Elephant", "Lion"],
    visualType: "animals",
    difficulty: "easy"
  },
  {
    id: 7,
    text: "Do you like dinosaurs?",
    category: "animals",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 8,
    text: "What animal would you like to be?",
    category: "animals",
    answers: ["Bird", "Fish", "Horse", "Butterfly"],
    visualType: "animals",
    difficulty: "medium"
  },
  {
    id: 9,
    text: "Do you have a pet?",
    category: "animals",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 10,
    text: "What's your favorite farm animal?",
    category: "animals",
    answers: ["Cow", "Pig", "Chicken", "Sheep"],
    visualType: "animals",
    difficulty: "easy"
  },

  // COLORS CATEGORY
  {
    id: 11,
    text: "What's your favorite color?",
    category: "colors",
    answers: ["Red", "Blue", "Green", "Yellow"],
    visualType: "colors",
    difficulty: "easy"
  },
  {
    id: 12,
    text: "What color is your favorite shirt?",
    category: "colors",
    answers: ["Red", "Blue", "Green", "Purple"],
    visualType: "colors",
    difficulty: "easy"
  },
  {
    id: 13,
    text: "Do you like pink?",
    category: "colors",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 14,
    text: "What color is the sky?",
    category: "colors",
    answers: ["Blue", "Gray", "White", "Other"],
    visualType: "colors",
    difficulty: "easy"
  },

  // ACTIVITIES CATEGORY
  {
    id: 15,
    text: "What do you like to do outside?",
    category: "activities",
    answers: ["Play", "Run", "Swim", "Ride Bike"],
    visualType: "activities",
    difficulty: "easy"
  },
  {
    id: 16,
    text: "Do you like to draw?",
    category: "activities",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 17,
    text: "What's your favorite game?",
    category: "activities",
    answers: ["Hide & Seek", "Tag", "Board Game", "Video Game"],
    visualType: "activities",
    difficulty: "medium"
  },
  {
    id: 18,
    text: "Do you like to sing?",
    category: "activities",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 19,
    text: "What do you like to do with friends?",
    category: "activities",
    answers: ["Play", "Talk", "Share Toys", "Laugh"],
    visualType: "activities",
    difficulty: "medium"
  },

  // EMOTIONS CATEGORY
  {
    id: 20,
    text: "How do you feel today?",
    category: "emotions",
    answers: ["Happy", "Sad", "Excited", "Tired"],
    visualType: "emotions",
    difficulty: "easy"
  },
  {
    id: 21,
    text: "Do you like surprises?",
    category: "emotions",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 22,
    text: "What makes you laugh?",
    category: "emotions",
    answers: ["Jokes", "Funny Faces", "Silly Sounds", "Stories"],
    visualType: "emotions",
    difficulty: "medium"
  },

  // WEATHER CATEGORY
  {
    id: 23,
    text: "What's your favorite weather?",
    category: "weather",
    answers: ["Sunny", "Rainy", "Snowy", "Cloudy"],
    visualType: "weather",
    difficulty: "easy"
  },
  {
    id: 24,
    text: "Do you like when it rains?",
    category: "weather",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 25,
    text: "Do you like snow?",
    category: "weather",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // TRANSPORTATION CATEGORY
  {
    id: 26,
    text: "How do you get to school?",
    category: "transportation",
    answers: ["Car", "Bus", "Walk", "Bike"],
    visualType: "activities",
    difficulty: "easy"
  },
  {
    id: 27,
    text: "What's your favorite way to travel?",
    category: "transportation",
    answers: ["Car", "Airplane", "Train", "Boat"],
    visualType: "activities",
    difficulty: "medium"
  },

  // SCHOOL CATEGORY
  {
    id: 28,
    text: "What's your favorite subject?",
    category: "school",
    answers: ["Reading", "Math", "Art", "Science"],
    visualType: "activities",
    difficulty: "medium"
  },
  {
    id: 29,
    text: "Do you like recess?",
    category: "school",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 30,
    text: "What do you like to do at recess?",
    category: "school",
    answers: ["Playground", "Soccer", "Jump Rope", "Chat"],
    visualType: "activities",
    difficulty: "medium"
  },

  // FAMILY CATEGORY
  {
    id: 31,
    text: "How many people are in your family?",
    category: "family",
    answers: ["2-3", "4-5", "6+", "I don't know"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 32,
    text: "Do you have brothers or sisters?",
    category: "family",
    answers: ["Brother", "Sister", "Both", "Neither"],
    visualType: "custom",
    difficulty: "easy"
  },

  // HOLIDAYS CATEGORY
  {
    id: 33,
    text: "What's your favorite holiday?",
    category: "holidays",
    answers: ["Christmas", "Halloween", "Birthday", "Easter"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 34,
    text: "Do you like getting presents?",
    category: "holidays",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // SEASONS CATEGORY
  {
    id: 35,
    text: "What's your favorite season?",
    category: "seasons",
    answers: ["Spring", "Summer", "Fall", "Winter"],
    visualType: "weather",
    difficulty: "medium"
  },
  {
    id: 36,
    text: "Do you like summer?",
    category: "seasons",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // BEDTIME CATEGORY
  {
    id: 37,
    text: "What do you sleep with?",
    category: "bedtime",
    answers: ["Teddy Bear", "Blanket", "Nothing", "Other"],
    visualType: "custom",
    difficulty: "easy"
  },
  {
    id: 38,
    text: "Do you like bedtime stories?",
    category: "bedtime",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // TECHNOLOGY CATEGORY
  {
    id: 39,
    text: "Do you like watching TV?",
    category: "technology",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 40,
    text: "What do you like to watch?",
    category: "technology",
    answers: ["Cartoons", "Movies", "Shows", "Nothing"],
    visualType: "custom",
    difficulty: "medium"
  },

  // MORE FOOD QUESTIONS
  {
    id: 41,
    text: "Do you like mac and cheese?",
    category: "food",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 42,
    text: "What's your favorite snack?",
    category: "food",
    answers: ["Crackers", "Fruit", "Chips", "Cookies"],
    visualType: "food",
    difficulty: "easy"
  },
  {
    id: 43,
    text: "Do you like broccoli?",
    category: "food",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // MORE ANIMAL QUESTIONS
  {
    id: 44,
    text: "What sound does a cow make?",
    category: "animals",
    answers: ["Moo", "Oink", "Baa", "Meow"],
    visualType: "animals",
    difficulty: "easy"
  },
  {
    id: 45,
    text: "Do you like bugs?",
    category: "animals",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // MORE COLOR QUESTIONS
  {
    id: 46,
    text: "What color are bananas?",
    category: "colors",
    answers: ["Yellow", "Green", "Brown", "White"],
    visualType: "colors",
    difficulty: "easy"
  },
  {
    id: 47,
    text: "Do you like rainbow colors?",
    category: "colors",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // MORE ACTIVITY QUESTIONS
  {
    id: 48,
    text: "Do you like to dance?",
    category: "activities",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 49,
    text: "What do you like to build?",
    category: "activities",
    answers: ["Blocks", "Legos", "Sandcastles", "Nothing"],
    visualType: "activities",
    difficulty: "medium"
  },
  {
    id: 50,
    text: "Do you like to help others?",
    category: "activities",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // EXPANDED FOOD QUESTIONS (51-80)
  {
    id: 51,
    text: "Do you like chicken nuggets?",
    category: "food",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 52,
    text: "What's your favorite breakfast food?",
    category: "food",
    answers: ["Cereal", "Pancakes", "Eggs", "Toast"],
    visualType: "food",
    difficulty: "easy"
  },
  {
    id: 53,
    text: "Do you like carrots?",
    category: "food",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 54,
    text: "What's your favorite drink?",
    category: "food",
    answers: ["Milk", "Juice", "Water", "Soda"],
    visualType: "food",
    difficulty: "easy"
  },
  {
    id: 55,
    text: "Do you like cheese?",
    category: "food",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 56,
    text: "What's your favorite sandwich?",
    category: "food",
    answers: ["PB&J", "Ham", "Turkey", "Grilled Cheese"],
    visualType: "food",
    difficulty: "medium"
  },
  {
    id: 57,
    text: "Do you like fish?",
    category: "food",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 58,
    text: "What's your favorite dessert?",
    category: "food",
    answers: ["Cake", "Cookies", "Ice Cream", "Candy"],
    visualType: "food",
    difficulty: "easy"
  },
  {
    id: 59,
    text: "Do you like tomatoes?",
    category: "food",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 60,
    text: "What's your favorite pasta?",
    category: "food",
    answers: ["Spaghetti", "Mac & Cheese", "Lasagna", "Ravioli"],
    visualType: "food",
    difficulty: "medium"
  },

  // EXPANDED ANIMAL QUESTIONS (61-90)
  {
    id: 61,
    text: "What's your favorite bird?",
    category: "animals",
    answers: ["Eagle", "Owl", "Parrot", "Penguin"],
    visualType: "animals",
    difficulty: "medium"
  },
  {
    id: 62,
    text: "Do you like horses?",
    category: "animals",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 63,
    text: "What's your favorite sea animal?",
    category: "animals",
    answers: ["Dolphin", "Shark", "Whale", "Fish"],
    visualType: "animals",
    difficulty: "medium"
  },
  {
    id: 64,
    text: "Do you like rabbits?",
    category: "animals",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 65,
    text: "What's your favorite wild animal?",
    category: "animals",
    answers: ["Tiger", "Bear", "Wolf", "Fox"],
    visualType: "animals",
    difficulty: "medium"
  },
  {
    id: 66,
    text: "Do you like snakes?",
    category: "animals",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 67,
    text: "What's your favorite pet?",
    category: "animals",
    answers: ["Dog", "Cat", "Fish", "Bird"],
    visualType: "animals",
    difficulty: "easy"
  },
  {
    id: 68,
    text: "Do you like spiders?",
    category: "animals",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 69,
    text: "What's your favorite zoo animal?",
    category: "animals",
    answers: ["Elephant", "Giraffe", "Monkey", "Zebra"],
    visualType: "animals",
    difficulty: "medium"
  },
  {
    id: 70,
    text: "Do you like frogs?",
    category: "animals",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // EXPANDED COLOR QUESTIONS (71-100)
  {
    id: 71,
    text: "What color is your favorite toy?",
    category: "colors",
    answers: ["Red", "Blue", "Green", "Yellow"],
    visualType: "colors",
    difficulty: "easy"
  },
  {
    id: 72,
    text: "Do you like purple?",
    category: "colors",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 73,
    text: "What color is your room?",
    category: "colors",
    answers: ["Blue", "Pink", "Green", "White"],
    visualType: "colors",
    difficulty: "medium"
  },
  {
    id: 74,
    text: "Do you like orange?",
    category: "colors",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 75,
    text: "What color is your backpack?",
    category: "colors",
    answers: ["Red", "Blue", "Black", "Other"],
    visualType: "colors",
    difficulty: "easy"
  },
  {
    id: 76,
    text: "Do you like brown?",
    category: "colors",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 77,
    text: "What color is your favorite book?",
    category: "colors",
    answers: ["Blue", "Red", "Green", "Yellow"],
    visualType: "colors",
    difficulty: "medium"
  },
  {
    id: 78,
    text: "Do you like gray?",
    category: "colors",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 79,
    text: "What color is your lunchbox?",
    category: "colors",
    answers: ["Red", "Blue", "Green", "Other"],
    visualType: "colors",
    difficulty: "easy"
  },
  {
    id: 80,
    text: "Do you like black?",
    category: "colors",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // EXPANDED ACTIVITY QUESTIONS (81-110)
  {
    id: 81,
    text: "What do you like to do in the morning?",
    category: "activities",
    answers: ["Eat", "Play", "Watch TV", "Sleep"],
    visualType: "activities",
    difficulty: "easy"
  },
  {
    id: 82,
    text: "Do you like to read books?",
    category: "activities",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 83,
    text: "What do you like to do at night?",
    category: "activities",
    answers: ["Sleep", "Read", "Play", "Watch TV"],
    visualType: "activities",
    difficulty: "easy"
  },
  {
    id: 84,
    text: "Do you like to paint?",
    category: "activities",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 85,
    text: "What do you like to do on weekends?",
    category: "activities",
    answers: ["Play", "Rest", "Go Places", "Watch TV"],
    visualType: "activities",
    difficulty: "medium"
  },
  {
    id: 86,
    text: "Do you like to cook?",
    category: "activities",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 87,
    text: "What do you like to do with family?",
    category: "activities",
    answers: ["Eat", "Play", "Talk", "Watch TV"],
    visualType: "activities",
    difficulty: "medium"
  },
  {
    id: 88,
    text: "Do you like to write?",
    category: "activities",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 89,
    text: "What do you like to do when it rains?",
    category: "activities",
    answers: ["Play Inside", "Read", "Watch TV", "Sleep"],
    visualType: "activities",
    difficulty: "medium"
  },
  {
    id: 90,
    text: "Do you like to exercise?",
    category: "activities",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // EXPANDED EMOTION QUESTIONS (91-120)
  {
    id: 91,
    text: "What makes you happy?",
    category: "emotions",
    answers: ["Friends", "Toys", "Food", "Family"],
    visualType: "emotions",
    difficulty: "medium"
  },
  {
    id: 92,
    text: "Do you get scared easily?",
    category: "emotions",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 93,
    text: "What makes you excited?",
    category: "emotions",
    answers: ["Birthdays", "Toys", "Trips", "Friends"],
    visualType: "emotions",
    difficulty: "medium"
  },
  {
    id: 94,
    text: "Do you like to be hugged?",
    category: "emotions",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 95,
    text: "What makes you proud?",
    category: "emotions",
    answers: ["Drawing", "Reading", "Helping", "Learning"],
    visualType: "emotions",
    difficulty: "medium"
  },
  {
    id: 96,
    text: "Do you like to be the center of attention?",
    category: "emotions",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "medium"
  },
  {
    id: 97,
    text: "What makes you feel safe?",
    category: "emotions",
    answers: ["Family", "Home", "Friends", "Toys"],
    visualType: "emotions",
    difficulty: "medium"
  },
  {
    id: 98,
    text: "Do you like to be alone sometimes?",
    category: "emotions",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "medium"
  },
  {
    id: 99,
    text: "What makes you feel loved?",
    category: "emotions",
    answers: ["Hugs", "Kind Words", "Gifts", "Time Together"],
    visualType: "emotions",
    difficulty: "medium"
  },
  {
    id: 100,
    text: "Do you like to be praised?",
    category: "emotions",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // EXPANDED WEATHER QUESTIONS (101-130)
  {
    id: 101,
    text: "What's your favorite season?",
    category: "weather",
    answers: ["Spring", "Summer", "Fall", "Winter"],
    visualType: "weather",
    difficulty: "medium"
  },
  {
    id: 102,
    text: "Do you like thunderstorms?",
    category: "weather",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 103,
    text: "What do you like to do on sunny days?",
    category: "weather",
    answers: ["Play Outside", "Go to Park", "Swim", "Walk"],
    visualType: "weather",
    difficulty: "medium"
  },
  {
    id: 104,
    text: "Do you like fog?",
    category: "weather",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 105,
    text: "What do you like to do on cold days?",
    category: "weather",
    answers: ["Stay Inside", "Play in Snow", "Drink Hot Chocolate", "Read"],
    visualType: "weather",
    difficulty: "medium"
  },
  {
    id: 106,
    text: "Do you like wind?",
    category: "weather",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 107,
    text: "What do you like to do when it's hot?",
    category: "weather",
    answers: ["Swim", "Stay Inside", "Eat Ice Cream", "Play in Shade"],
    visualType: "weather",
    difficulty: "medium"
  },
  {
    id: 108,
    text: "Do you like hail?",
    category: "weather",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 109,
    text: "What do you like to do on cloudy days?",
    category: "weather",
    answers: ["Stay Inside", "Go Outside", "Read", "Play Games"],
    visualType: "weather",
    difficulty: "medium"
  },
  {
    id: 110,
    text: "Do you like rainbows?",
    category: "weather",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // EXPANDED TRANSPORTATION QUESTIONS (111-140)
  {
    id: 111,
    text: "What's your favorite vehicle?",
    category: "transportation",
    answers: ["Car", "Truck", "Motorcycle", "Bicycle"],
    visualType: "activities",
    difficulty: "easy"
  },
  {
    id: 112,
    text: "Do you like riding in cars?",
    category: "transportation",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 113,
    text: "What's your favorite way to travel?",
    category: "transportation",
    answers: ["Car", "Airplane", "Train", "Boat"],
    visualType: "activities",
    difficulty: "medium"
  },
  {
    id: 114,
    text: "Do you like riding bikes?",
    category: "transportation",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 115,
    text: "What's your favorite emergency vehicle?",
    category: "transportation",
    answers: ["Fire Truck", "Police Car", "Ambulance", "Helicopter"],
    visualType: "activities",
    difficulty: "medium"
  },
  {
    id: 116,
    text: "Do you like riding buses?",
    category: "transportation",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 117,
    text: "What's your favorite construction vehicle?",
    category: "transportation",
    answers: ["Bulldozer", "Crane", "Excavator", "Dump Truck"],
    visualType: "activities",
    difficulty: "medium"
  },
  {
    id: 118,
    text: "Do you like riding scooters?",
    category: "transportation",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 119,
    text: "What's your favorite flying vehicle?",
    category: "transportation",
    answers: ["Airplane", "Helicopter", "Hot Air Balloon", "Rocket"],
    visualType: "activities",
    difficulty: "medium"
  },
  {
    id: 120,
    text: "Do you like riding skateboards?",
    category: "transportation",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // EXPANDED SCHOOL QUESTIONS (121-150)
  {
    id: 121,
    text: "What's your favorite school activity?",
    category: "school",
    answers: ["Recess", "Art", "Reading", "Math"],
    visualType: "activities",
    difficulty: "easy"
  },
  {
    id: 122,
    text: "Do you like homework?",
    category: "school",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 123,
    text: "What's your favorite school supply?",
    category: "school",
    answers: ["Crayons", "Markers", "Pencils", "Paper"],
    visualType: "activities",
    difficulty: "easy"
  },
  {
    id: 124,
    text: "Do you like school lunch?",
    category: "school",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 125,
    text: "What's your favorite school subject?",
    category: "school",
    answers: ["Reading", "Math", "Science", "Art"],
    visualType: "activities",
    difficulty: "medium"
  },
  {
    id: 126,
    text: "Do you like school assemblies?",
    category: "school",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 127,
    text: "What's your favorite school event?",
    category: "school",
    answers: ["Field Day", "Book Fair", "Art Show", "Concert"],
    visualType: "activities",
    difficulty: "medium"
  },
  {
    id: 128,
    text: "Do you like school field trips?",
    category: "school",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 129,
    text: "What's your favorite school game?",
    category: "school",
    answers: ["Tag", "Hide & Seek", "Duck Duck Goose", "Red Light Green Light"],
    visualType: "activities",
    difficulty: "medium"
  },
  {
    id: 130,
    text: "Do you like school pictures?",
    category: "school",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // EXPANDED FAMILY QUESTIONS (131-160)
  {
    id: 131,
    text: "What's your favorite family activity?",
    category: "family",
    answers: ["Eating Together", "Playing Games", "Watching Movies", "Going Places"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 132,
    text: "Do you like family dinners?",
    category: "family",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 133,
    text: "What's your favorite family tradition?",
    category: "family",
    answers: ["Holidays", "Birthdays", "Vacations", "Weekend Activities"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 134,
    text: "Do you like family game nights?",
    category: "family",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 135,
    text: "What's your favorite family meal?",
    category: "family",
    answers: ["Breakfast", "Lunch", "Dinner", "Snacks"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 136,
    text: "Do you like family movie nights?",
    category: "family",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 137,
    text: "What's your favorite family outing?",
    category: "family",
    answers: ["Park", "Restaurant", "Movie Theater", "Shopping"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 138,
    text: "Do you like family vacations?",
    category: "family",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 139,
    text: "What's your favorite family holiday?",
    category: "family",
    answers: ["Christmas", "Thanksgiving", "Easter", "Halloween"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 140,
    text: "Do you like family photos?",
    category: "family",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // EXPANDED HOLIDAY QUESTIONS (141-170)
  {
    id: 141,
    text: "What's your favorite holiday food?",
    category: "holidays",
    answers: ["Turkey", "Ham", "Cake", "Candy"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 142,
    text: "Do you like decorating for holidays?",
    category: "holidays",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 143,
    text: "What's your favorite holiday activity?",
    category: "holidays",
    answers: ["Opening Presents", "Decorating", "Eating", "Playing Games"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 144,
    text: "Do you like holiday music?",
    category: "holidays",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 145,
    text: "What's your favorite holiday decoration?",
    category: "holidays",
    answers: ["Christmas Tree", "Lights", "Ornaments", "Wreath"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 146,
    text: "Do you like holiday parades?",
    category: "holidays",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 147,
    text: "What's your favorite holiday movie?",
    category: "holidays",
    answers: ["Christmas Movie", "Halloween Movie", "Easter Movie", "Other"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 148,
    text: "Do you like holiday crafts?",
    category: "holidays",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 149,
    text: "What's your favorite holiday color?",
    category: "holidays",
    answers: ["Red", "Green", "Orange", "Purple"],
    visualType: "colors",
    difficulty: "medium"
  },
  {
    id: 150,
    text: "Do you like holiday parties?",
    category: "holidays",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // EXPANDED SEASON QUESTIONS (151-180)
  {
    id: 151,
    text: "What's your favorite spring activity?",
    category: "seasons",
    answers: ["Planting Flowers", "Flying Kites", "Easter Egg Hunt", "Playing Outside"],
    visualType: "weather",
    difficulty: "medium"
  },
  {
    id: 152,
    text: "Do you like spring rain?",
    category: "seasons",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 153,
    text: "What's your favorite summer activity?",
    category: "seasons",
    answers: ["Swimming", "Going to Beach", "Playing Outside", "Ice Cream"],
    visualType: "weather",
    difficulty: "medium"
  },
  {
    id: 154,
    text: "Do you like summer heat?",
    category: "seasons",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 155,
    text: "What's your favorite fall activity?",
    category: "seasons",
    answers: ["Jumping in Leaves", "Pumpkin Picking", "Apple Picking", "Halloween"],
    visualType: "weather",
    difficulty: "medium"
  },
  {
    id: 156,
    text: "Do you like fall colors?",
    category: "seasons",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 157,
    text: "What's your favorite winter activity?",
    category: "seasons",
    answers: ["Building Snowmen", "Sledding", "Ice Skating", "Snowball Fights"],
    visualType: "weather",
    difficulty: "medium"
  },
  {
    id: 158,
    text: "Do you like winter cold?",
    category: "seasons",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 159,
    text: "What's your favorite seasonal food?",
    category: "seasons",
    answers: ["Spring: Strawberries", "Summer: Ice Cream", "Fall: Apples", "Winter: Hot Chocolate"],
    visualType: "weather",
    difficulty: "medium"
  },
  {
    id: 160,
    text: "Do you like seasonal changes?",
    category: "seasons",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // EXPANDED BEDTIME QUESTIONS (161-190)
  {
    id: 161,
    text: "What's your favorite bedtime story?",
    category: "bedtime",
    answers: ["Fairy Tales", "Animal Stories", "Adventure Stories", "Funny Stories"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 162,
    text: "Do you like bedtime songs?",
    category: "bedtime",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 163,
    text: "What's your favorite bedtime routine?",
    category: "bedtime",
    answers: ["Bath", "Reading", "Prayers", "Hugs"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 164,
    text: "Do you like bedtime snacks?",
    category: "bedtime",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 165,
    text: "What's your favorite bedtime drink?",
    category: "bedtime",
    answers: ["Milk", "Water", "Hot Chocolate", "Juice"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 166,
    text: "Do you like bedtime prayers?",
    category: "bedtime",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 167,
    text: "What's your favorite bedtime toy?",
    category: "bedtime",
    answers: ["Teddy Bear", "Doll", "Action Figure", "Blanket"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 168,
    text: "Do you like bedtime hugs?",
    category: "bedtime",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 169,
    text: "What's your favorite bedtime song?",
    category: "bedtime",
    answers: ["Lullabies", "Nursery Rhymes", "Pop Songs", "No Songs"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 170,
    text: "Do you like bedtime kisses?",
    category: "bedtime",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // EXPANDED TECHNOLOGY QUESTIONS (171-200)
  {
    id: 171,
    text: "What's your favorite type of screen?",
    category: "technology",
    answers: ["TV", "Tablet", "Phone", "Computer"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 172,
    text: "Do you like video games?",
    category: "technology",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 173,
    text: "What's your favorite app?",
    category: "technology",
    answers: ["Games", "Drawing", "Music", "Learning"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 174,
    text: "Do you like taking photos?",
    category: "technology",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 175,
    text: "What's your favorite device?",
    category: "technology",
    answers: ["Phone", "Tablet", "Computer", "TV"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 176,
    text: "Do you like using computers?",
    category: "technology",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 177,
    text: "What's your favorite online activity?",
    category: "technology",
    answers: ["Games", "Videos", "Learning", "Drawing"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 178,
    text: "Do you like using tablets?",
    category: "technology",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 179,
    text: "What's your favorite type of video?",
    category: "technology",
    answers: ["Cartoons", "Educational", "Music Videos", "Funny Videos"],
    visualType: "custom",
    difficulty: "medium"
  },
  {
    id: 180,
    text: "Do you like using phones?",
    category: "technology",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },

  // FINAL QUESTIONS (181-200)
  {
    id: 181,
    text: "What's your favorite way to learn?",
    category: "school",
    answers: ["Reading", "Watching", "Doing", "Listening"],
    visualType: "activities",
    difficulty: "medium"
  },
  {
    id: 182,
    text: "Do you like to ask questions?",
    category: "school",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 183,
    text: "What's your favorite way to help?",
    category: "activities",
    answers: ["Cleaning", "Sharing", "Teaching", "Giving"],
    visualType: "activities",
    difficulty: "medium"
  },
  {
    id: 184,
    text: "Do you like to be a leader?",
    category: "activities",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "medium"
  },
  {
    id: 185,
    text: "What's your favorite way to celebrate?",
    category: "activities",
    answers: ["Party", "Cake", "Presents", "Games"],
    visualType: "activities",
    difficulty: "medium"
  },
  {
    id: 186,
    text: "Do you like to make friends?",
    category: "activities",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  },
  {
    id: 187,
    text: "What's your favorite way to relax?",
    category: "activities",
    answers: ["Reading", "Drawing", "Listening to Music", "Resting"],
    visualType: "activities",
    difficulty: "medium"
  },
  {
    id: 188,
    text: "Do you like to try new things?",
    category: "activities",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "medium"
  },
  {
    id: 189,
    text: "What's your favorite way to be creative?",
    category: "activities",
    answers: ["Drawing", "Building", "Singing", "Dancing"],
    visualType: "activities",
    difficulty: "medium"
  },
  {
    id: 200,
    text: "Do you like to learn new things?",
    category: "activities",
    answers: ["Yes", "No"],
    visualType: "yesNo",
    difficulty: "easy"
  }
];

// Helper function to get visual elements for different question types
export const getVisualElements = (visualType: string) => {
  // Return theme-agnostic visual elements that work with any theme
  switch (visualType) {
    case 'yesNo':
      return {
        emojis: ['✅', '❌'],
        colors: ['green', 'red']
      };
    case 'colors':
      return {
        emojis: ['🔴', '🔵', '🟢', '🟡'],
        colors: ['red', 'blue', 'green', 'yellow']
      };
    case 'animals':
      return {
        emojis: ['🐶', '🐱', '🐰', '🐼'],
        colors: ['brown', 'orange', 'gray', 'black']
      };
    case 'food':
      return {
        emojis: ['🍕', '🍦', '🍎', '🥕'],
        colors: ['orange', 'pink', 'red', 'green']
      };
    case 'activities':
      return {
        emojis: ['⚽', '🎨', '🎵', '🎮'],
        colors: ['black', 'purple', 'blue', 'green']
      };
    case 'emotions':
      return {
        emojis: ['😊', '😢', '🤩', '😴'],
        colors: ['yellow', 'blue', 'yellow', 'gray']
      };
    case 'weather':
      return {
        emojis: ['☀️', '🌧️', '⛄', '🌈'],
        colors: ['yellow', 'blue', 'white', 'multicolor']
      };
    case 'custom':
    default:
      return {
        emojis: ['😊', '⭐', '🎉', '💫'],
        colors: ['blue', 'yellow', 'pink', 'purple']
      };
  }
};

// Helper function to get questions by category
export const getQuestionsByCategory = (category: string) => {
  return questionLibrary.filter(q => q.category === category);
};

// Helper function to get unused questions (not used in last 7 days)
export const getUnusedQuestions = (usedQuestions: string[] = []) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return questionLibrary.filter(q => {
    if (!q.lastUsed) return true;
    const lastUsed = new Date(q.lastUsed);
    return lastUsed < sevenDaysAgo;
  });
};

// Helper function to get random question
export const getRandomQuestion = (category?: string, usedQuestions: string[] = []) => {
  let availableQuestions = category 
    ? getQuestionsByCategory(category)
    : questionLibrary;
  
  // Filter out recently used questions
  availableQuestions = getUnusedQuestions(usedQuestions);
  
  if (availableQuestions.length === 0) {
    // If all questions have been used recently, return any question
    availableQuestions = category ? getQuestionsByCategory(category) : questionLibrary;
  }
  
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
};

// Helper function to get question by ID
export const getQuestionById = (id: number): QuestionOfDay | null => {
  return questionLibrary.find(q => q.id === id) || null;
};

// Get all available categories
export const getCategories = () => {
  const categories = Array.from(new Set(questionLibrary.map(q => q.category)));
  return categories.sort();
};

// Function to add custom questions to the library
export const addCustomQuestion = (question: QuestionOfDay) => {
  // Ensure the question has a unique ID
  const maxId = Math.max(...questionLibrary.map(q => q.id));
  question.id = maxId + 1;
  
  // Add to the beginning of the library
  questionLibrary.unshift(question);
  
  // Save to localStorage for persistence
  try {
    const customQuestions = JSON.parse(localStorage.getItem('customQuestions') || '[]');
    customQuestions.push(question);
    localStorage.setItem('customQuestions', JSON.stringify(customQuestions));
  } catch (error) {
    console.error('Error saving custom question:', error);
  }
  
  return question;
};

// Function to load custom questions from localStorage
export const loadCustomQuestions = () => {
  try {
    const customQuestions = JSON.parse(localStorage.getItem('customQuestions') || '[]');
    // Add custom questions to the library if they're not already there
    customQuestions.forEach((customQ: QuestionOfDay) => {
      if (!questionLibrary.find(q => q.id === customQ.id)) {
        questionLibrary.unshift(customQ);
      }
    });
  } catch (error) {
    console.error('Error loading custom questions:', error);
  }
}; 