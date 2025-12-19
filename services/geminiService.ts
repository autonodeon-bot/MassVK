
import { GoogleGenAI } from "@google/genai";

export const generateVKComment = async (postContent: string, keywords: string[], template: string): Promise<string> => {
  try {
    // Инициализация экземпляра GoogleGenAI непосредственно перед вызовом API для использования актуального ключа из process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Ты — активный пользователь ВКонтакте. Напиши короткий, живой и релевантный комментарий к следующему посту: "${postContent}".
      Используй следующие ключевые слова, если это уместно: ${keywords.join(", ")}.
      Придерживайся стиля: "${template}".
      Комментарий должен быть не более 150 символов, без явного спама, выглядеть как от реального человека.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // response.text — это свойство, возвращающее строку, а не метод.
    return response.text || "Крутой пост! 👍";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Интересно, спасибо за инфу!";
  }
};
