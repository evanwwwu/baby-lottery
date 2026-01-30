import { GoogleGenAI } from "@google/genai";
import { Gender } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePrediction = async (name: string, choice: Gender): Promise<string> => {
  const genderText = choice === Gender.BOY ? '男寶' : '女寶';
  try {
    // 這裡就是 Prompt (提示詞) 的定義位置
    const prompt = `
      請以「肚子裡的寶寶」的角度，給這位參加性別揭曉派對的客人寫一句簡短、幽默且充滿喜氣的「悄悄話」。
      客人的名字是 ${name}，他/她猜測是 ${genderText}。
      請使用繁體中文。
      使用表情符號。語氣要調皮可愛，像是在跟朋友說秘密。
      範例："嘿 ${name}，你猜我是${genderText}嗎？別急，等我出來就知道囉！👶"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 1.2, // High creativity
      }
    });

    return response.text?.trim() || `感謝您支持${genderText}隊！🎉`;
  } catch (error) {
    console.error("Gemini Error:", error);
    return `您投給了${genderText}！祝好運！🤞`;
  }
};