
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { type SoundscapeData } from '../types';

const soundscapeSchema = {
  type: Type.OBJECT,
  properties: {
    affirmation: {
      type: Type.STRING,
      description: 'A short, comforting affirmation (20 words max) based on the user\'s mood.',
    },
    music: {
      type: Type.OBJECT,
      properties: {
        mood: { type: Type.STRING, description: 'The overall mood of the music (e.g., Calm, Reflective).' },
        tempo: { type: Type.NUMBER, description: 'The tempo in BPM (e.g., 60).' },
        key: { type: Type.STRING, description: 'The musical key (e.g., C Major).' },
        instruments: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of primary instruments.' },
        description: { type: Type.STRING, description: 'A brief description of the musical piece.' },
      },
      required: ['mood', 'tempo', 'key', 'instruments', 'description'],
    },
    visuals: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING, description: 'A description of a calming visual scene.' },
        pulsate: { type: Type.BOOLEAN, description: 'Whether the visual should pulsate gently.' },
        colors: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Two hex color codes for a gradient.' },
      },
      required: ['description', 'pulsate', 'colors'],
    },
  },
  required: ['affirmation', 'music', 'visuals'],
};


export const generateSoundscapeData = async (ai: GoogleGenAI, prompt: string): Promise<Omit<SoundscapeData, 'id' | 'prompt'>> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Analyze the user's mood from the following prompt and generate a personalized soundscape prescription: "${prompt}"`,
      config: {
        systemInstruction: "You are a compassionate audio-therapist and sound designer. Your goal is to create a personalized soundscape prescription based on a user's stated mood. Respond ONLY with the JSON object matching the provided schema.",
        responseMimeType: 'application/json',
        responseSchema: soundscapeSchema,
      },
    });

    const text = response.text.trim();
    // Although we expect JSON, Gemini might wrap it in markdown backticks.
    const cleanJsonString = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(cleanJsonString);

  } catch (error) {
    console.error("Error generating soundscape data:", error);
    throw new Error("Failed to get soundscape data from Gemini.");
  }
};


export const generateSpeech = async (ai: GoogleGenAI, text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Speak in a calm, soothing, and gentle voice: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' }, // A calming voice
          },
        },
      },
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.[0];
    if (audioPart && audioPart.inlineData?.data) {
      return audioPart.inlineData.data;
    }
    
    throw new Error("No audio data received from Gemini TTS.");
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error("Failed to generate speech from Gemini.");
  }
};
