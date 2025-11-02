
import React from 'react';
import { type CommunitySession } from '../types';
import { PlayIcon, PauseIcon, MusicIcon } from './icons';

interface SoundscapePlayerProps {
  session: CommunitySession | null;
  isLoading: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const SoundscapePlayer: React.FC<SoundscapePlayerProps> = ({ session, isLoading, isPlaying, onTogglePlay }) => {
  
  const orbStyle: React.CSSProperties = {
    '--color1': session?.visuals.colors[0] || '#4f46e5',
    '--color2': session?.visuals.colors[1] || '#06b6d4',
    animationName: isPlaying && session?.visuals.pulsate ? 'pulsate' : 'float',
    animationDuration: isPlaying ? '4s' : '8s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  } as React.CSSProperties;

  return (
    <div className="relative w-full aspect-square bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700 flex flex-col items-center justify-center p-6 overflow-hidden">
      <style>{`
        @keyframes pulsate {
          0%, 100% { transform: scale(1); box-shadow: 0 0 40px 0px var(--color1), 0 0 60px 0px var(--color2); }
          50% { transform: scale(1.05); box-shadow: 0 0 60px 10px var(--color1), 0 0 90px 10px var(--color2); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(-5px); }
          50% { transform: translateY(5px); }
        }
      `}</style>
      
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-radial from-gray-900 via-gray-900 to-transparent"></div>

      {isLoading ? (
        <div className="text-center z-10">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-300">Crafting your aura...</p>
        </div>
      ) : session ? (
        <div className="z-10 flex flex-col items-center justify-center h-full w-full text-center">
          <div 
            className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-[var(--color1)] to-[var(--color2)] transition-all duration-1000" 
            style={orbStyle}
          ></div>

          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-800/80 to-transparent">
            <p className="text-lg sm:text-xl font-medium mb-4 text-shadow">{session.affirmation}</p>
            <button
              onClick={onTogglePlay}
              className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center z-10 flex flex-col items-center">
            <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-2 border-dashed border-gray-600">
                <MusicIcon />
            </div>
            <p className="mt-8 text-lg text-gray-400">Your soundscape will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default SoundscapePlayer;
