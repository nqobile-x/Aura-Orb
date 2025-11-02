
export interface MusicDescription {
  mood: string;
  tempo: number;
  key: string;
  instruments: string[];
  description: string;
}

export interface VisualDescription {
  description: string;
  pulsate: boolean;
  colors: string[]; // hex codes
}

export interface SoundscapeData {
  id: string;
  prompt: string;
  affirmation: string;
  music: MusicDescription;
  visuals: VisualDescription;
}

export interface CommunitySession extends SoundscapeData {
  audioBase64: string;
}
