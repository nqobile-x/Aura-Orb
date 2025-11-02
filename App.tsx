
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { generateSoundscapeData, generateSpeech } from './services/geminiService';
import { type CommunitySession } from './types';
import { decode, decodeAudioData } from './utils/audioUtils';
import MoodInputForm from './components/MoodInputForm';
import SoundscapePlayer from './components/SoundscapePlayer';
import CommunityGallery from './components/CommunityGallery';
import { ShareIcon } from './components/icons';

const LOCAL_STORAGE_KEY = 'aura-orb-session';

// Mock initial community sessions
const initialSessions: CommunitySession[] = [
    {
        id: 'mock-1',
        prompt: "I'm feeling anxious about a presentation",
        affirmation: "Your voice is steady, your thoughts are clear. You are prepared and capable.",
        music: {
            mood: "Calm, focused",
            tempo: 60,
            key: "C Major",
            instruments: ["Soft Piano", "Gentle Strings"],
            description: "A slow, minimalist piano melody provides a sense of stability, while soft, underlying strings add a layer of warmth and comfort."
        },
        visuals: {
            description: "A soft, slowly pulsating light, transitioning between a calming sky blue and a gentle lavender.",
            pulsate: true,
            colors: ["#87CEEB", "#E6E6FA"]
        },
        audioBase64: '' // In a real app, this might be a pre-generated URL or base64 data
    }
];


export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<CommunitySession | null>(null);
  const [communitySessions, setCommunitySessions] = useState<CommunitySession[]>(initialSessions);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    // Initialize AudioContext on user interaction (or page load)
    const initAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        document.removeEventListener('click', initAudioContext);
    };
    document.addEventListener('click', initAudioContext);
    
    // Load session from local storage on initial mount
    try {
        const savedSessionJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedSessionJSON) {
            const savedSession: CommunitySession = JSON.parse(savedSessionJSON);
            setCurrentSession(savedSession);
        }
    } catch (e) {
        console.error("Failed to load session from local storage", e);
        localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
    }

    return () => {
        audioSourceRef.current?.stop();
        audioContextRef.current?.close();
        document.removeEventListener('click', initAudioContext);
    };
  }, []);

  const handleGenerate = useCallback(async (prompt: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    setCurrentSession(null);
    audioBufferRef.current = null; // Clear previous audio buffer
    setIsPlaying(false);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const soundscapeData = await generateSoundscapeData(ai, prompt);
      const audioBase64 = await generateSpeech(ai, soundscapeData.affirmation);

      if (!audioContextRef.current) {
        throw new Error("Audio context not available. Please interact with the page first.");
      }
      
      const newSession: CommunitySession = {
        ...soundscapeData,
        id: new Date().toISOString(),
        prompt,
        audioBase64,
      };

      setCurrentSession(newSession);
      
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSession));
      } catch (e) {
          console.error("Failed to save session to local storage", e);
      }
      
      // Decode audio immediately for faster playback start
      const decodedBytes = decode(audioBase64);
      const audioBuffer = await decodeAudioData(decodedBytes, audioContextRef.current, 24000, 1);
      audioBufferRef.current = audioBuffer;

    } catch (e: any) {
      console.error(e);
      setError(`Failed to generate soundscape: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleTogglePlay = useCallback(async () => {
    if (!audioContextRef.current || !currentSession) return;

    if (isPlaying) {
      audioSourceRef.current?.stop();
      setIsPlaying(false);
    } else {
      let bufferToPlay = audioBufferRef.current;

      // If buffer isn't loaded (e.g., from a saved session), decode it now.
      if (!bufferToPlay && currentSession.audioBase64) {
          try {
              const decodedBytes = decode(currentSession.audioBase64);
              const audioBuffer = await decodeAudioData(decodedBytes, audioContextRef.current, 24000, 1);
              audioBufferRef.current = audioBuffer;
              bufferToPlay = audioBuffer;
          } catch (e) {
              console.error("Failed to decode audio from session", e);
              setError("Could not play audio for this session.");
              return;
          }
      }

      if (!bufferToPlay) {
          setError("No audio available for this session.");
          return;
      }

      audioContextRef.current.resume(); // Ensure context is running
      const source = audioContextRef.current.createBufferSource();
      source.buffer = bufferToPlay;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        setIsPlaying(false);
      };
      source.start();
      audioSourceRef.current = source;
      setIsPlaying(true);
    }
  }, [isPlaying, currentSession]);

  const handleShare = useCallback(() => {
    if (currentSession && !communitySessions.some(s => s.id === currentSession.id)) {
      setCommunitySessions(prev => [currentSession, ...prev]);
    }
  }, [currentSession, communitySessions]);
  
  const handleSelectSession = (session: CommunitySession) => {
      alert("Loading community sessions is a demo feature. Generate a new session to listen.");
      setCurrentSession(session);
      setIsPlaying(false);
      audioBufferRef.current = null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <header className="w-full max-w-5xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          Aura Orb
        </h1>
        <p className="mt-2 text-lg text-gray-400">Your personal AI-powered soundscape for mental clarity.</p>
      </header>

      <main className="w-full max-w-5xl flex-grow flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2 flex flex-col gap-8">
          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">How are you feeling?</h2>
            <MoodInputForm onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
          
          {error && <div className="bg-red-900/50 text-red-300 p-4 rounded-lg border border-red-700">{error}</div>}
          
          {currentSession && (
             <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex-grow">
                 <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Your Aura</h3>
                        <p className="text-gray-400 italic mb-4">Based on: "{currentSession.prompt}"</p>
                    </div>
                    <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 text-sm bg-purple-600/50 hover:bg-purple-500/50 transition-colors px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={communitySessions.some(s => s.id === currentSession.id)}
                        title={communitySessions.some(s => s.id === currentSession.id) ? "Already Shared" : "Share to Community"}
                    >
                        <ShareIcon />
                        <span>Share</span>
                    </button>
                </div>
                 <p className="text-gray-300 mb-2"><span className="font-semibold text-purple-300">Music:</span> {currentSession.music.description}</p>
                 <p className="text-gray-300"><span className="font-semibold text-cyan-300">Visuals:</span> {currentSession.visuals.description}</p>
             </div>
          )}
        </div>

        <div className="lg:w-1/2">
          <SoundscapePlayer 
            session={currentSession} 
            isLoading={isLoading}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
          />
        </div>
      </main>

       <div className="w-full max-w-5xl mt-12">
           <CommunityGallery sessions={communitySessions} onSelectSession={handleSelectSession} />
       </div>
    </div>
  );
}
