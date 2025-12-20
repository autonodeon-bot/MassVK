
import { GoogleGenAI } from "@google/genai";

// Функция для генерации живых комментариев к постам ВКонтакте
export const generateVKComment = async (postContent: string, keywords: string[], template: string): Promise<string> => {
  // Ключ API берется исключительно из переменной окружения
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing. Using fallback comment.");
    return getRandomDefaultComment();
  }

  try {
    // Инициализация клиента Gemini с прямой передачей ключа
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Напиши короткий живой комментарий к посту ВК: "${postContent}". 
                 Ключевые слова: ${keywords.join(', ')}. 
                 Стиль: ${template}. 
                 Без хэштегов, не более 140 символов.`,
      config: {
        systemInstruction: "Ты — активный пользователь ВКонтакте. Твои комментарии живые, человечные и короткие. Используй смайлики в тему.",
        temperature: 1,
      }
    });

    // Извлечение текста напрямую из свойства .text
    return response.text || getRandomDefaultComment();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return getRandomDefaultComment();
  }
};

// Резервные комментарии на случай ошибки API
function getRandomDefaultComment() {
  const defaults = [
    "Классный пост, спасибо за инфу! 👍",
    "Полностью согласен с автором. Ждем продолжения!",
    "Интересный взгляд на вещи, есть над чем подумать. 🤔",
    "Ого, не знал об этом. Очень полезно! 🔥",
    "Спасибо, как раз искал информацию по этой теме! ✅"
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}
