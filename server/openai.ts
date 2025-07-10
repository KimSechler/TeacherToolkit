import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function generateQuestions(topic: string, grade: string, count: number = 5) {
  try {
    // Check if we have a valid API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "default_key") {
      // Return mock data for development
      console.log("🔧 Using mock AI responses for development");
      return [
        {
          text: `What is the main topic we learned about ${topic}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option A",
          explanation: "This is the correct answer because it directly relates to the topic."
        },
        {
          text: `Which of the following best describes ${topic}?`,
          options: ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
          correctAnswer: "Choice 2",
          explanation: "This choice accurately represents the concept."
        },
        {
          text: `How would you explain ${topic} to a ${grade} student?`,
          options: ["Method A", "Method B", "Method C", "Method D"],
          correctAnswer: "Method B",
          explanation: "This method is most appropriate for the grade level."
        }
      ].slice(0, count);
    }

    const prompt = `Generate ${count} educational questions about ${topic} appropriate for ${grade} students. 
    Return the response in JSON format with the following structure:
    {
      "questions": [
        {
          "text": "Question text",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": "Option 1",
          "explanation": "Brief explanation of why this is correct"
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert educational content creator. Create engaging, age-appropriate questions for elementary students."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.questions || [];
  } catch (error) {
    console.error("Error generating questions:", error);
    
    // Handle quota exceeded gracefully
    if (error instanceof Error && (error.message.includes('insufficient_quota') || error.message.includes('quota'))) {
      throw new Error('OpenAI API quota exceeded. Please check your billing details or try again later.');
    }
    
    throw new Error("Failed to generate questions. Please try again.");
  }
}

export async function generateGameTheme(themeName: string, description: string) {
  try {
    const prompt = `Create a visual theme for an educational game called "${themeName}". 
    Description: ${description}
    
    Return a JSON object with the following structure:
    {
      "theme": {
        "name": "${themeName}",
        "colors": {
          "primary": "#hex",
          "secondary": "#hex", 
          "background": "#hex",
          "text": "#hex"
        },
        "emojis": ["🎯", "🌟", "🎮"],
        "backgroundStyle": "gradient CSS class or description",
        "elements": {
          "button": "visual description",
          "card": "visual description",
          "header": "visual description"
        }
      }
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a UI/UX designer specializing in educational game themes. Create engaging, colorful themes suitable for elementary students."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.theme || {};
  } catch (error) {
    console.error("Error generating theme:", error);
    
    // Handle quota exceeded gracefully
    if (error instanceof Error && (error.message.includes('insufficient_quota') || error.message.includes('quota'))) {
      throw new Error('OpenAI API quota exceeded. Please check your billing details or try again later.');
    }
    
    throw new Error("Failed to generate theme. Please try again.");
  }
}

export async function analyzeImage(base64Image: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and suggest educational content that could be created from it. Focus on age-appropriate questions, activities, or games for elementary students. Return your response in JSON format with suggestions for questions, activities, and potential game ideas."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze image");
  }
}

export async function generateImageForTheme(themeName: string, description: string) {
  try {
    const prompt = `Create a colorful, child-friendly illustration for an educational game theme called "${themeName}". ${description}. The image should be bright, engaging, and suitable for elementary school students. Style: cartoon, educational, colorful.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return { url: response.data?.[0]?.url || '' };
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image");
  }
}

export async function chatWithAI(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) {
  try {
    // Check if we have a valid API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "default_key") {
      // Return mock response for development
      console.log("🔧 Using mock AI chat for development");
      const lastMessage = messages[messages.length - 1]?.content || "";
      
      if (lastMessage.toLowerCase().includes("question")) {
        return "I'd be happy to help you create some questions! Try using the Question Bank feature to generate educational questions for your students.";
      } else if (lastMessage.toLowerCase().includes("game")) {
        return "Creating educational games is a great way to engage students! Check out the Game Creator to build interactive learning experiences.";
      } else if (lastMessage.toLowerCase().includes("attendance")) {
        return "Attendance tracking is important for student engagement. Use the Attendance Tracker to monitor participation and ask daily questions.";
      } else {
        return "I'm here to help with your teaching needs! I can assist with creating questions, games, tracking attendance, and managing your classroom. What would you like to work on today?";
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant for teachers. You specialize in creating educational content, managing classrooms, and suggesting engaging activities for elementary students. Always be encouraging and provide practical, actionable advice."
        },
        ...messages
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error in AI chat:", error);
    throw new Error("Failed to get AI response");
  }
}

export async function generateClassroomActivity(subject: string, grade: string, duration: string) {
  try {
    const prompt = `Generate a fun, engaging classroom activity for ${grade} students about ${subject}. 
    Duration: ${duration}
    
    Return a JSON object with:
    {
      "activity": {
        "title": "Activity title",
        "description": "Brief description",
        "materials": ["material 1", "material 2"],
        "instructions": ["step 1", "step 2", "step 3"],
        "learningObjectives": ["objective 1", "objective 2"],
        "assessmentIdeas": ["assessment idea 1", "assessment idea 2"]
      }
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an experienced elementary school teacher who creates engaging, hands-on activities that promote active learning."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.activity || {};
  } catch (error) {
    console.error("Error generating activity:", error);
    throw new Error("Failed to generate activity");
  }
}
