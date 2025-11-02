
import React from 'react';
import { type CommunitySession } from '../types';
import { PlayCircleIcon } from './icons';

interface CommunityGalleryProps {
  sessions: CommunitySession[];
  onSelectSession: (session: CommunitySession) => void;
}

const CommunityGallery: React.FC<CommunityGalleryProps> = ({ sessions, onSelectSession }) => {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Community Soundscapes</h2>
      {sessions.length === 0 ? (
         <p className="text-gray-500">No sessions shared yet. Create and share one!</p>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session)}
            className="group relative bg-gray-800/50 p-5 rounded-xl border border-gray-700 cursor-pointer hover:border-purple-500 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <p className="font-semibold italic text-gray-300">"{session.prompt}"</p>
              <p className="text-sm text-gray-400 mt-2 truncate">{session.affirmation}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>{session.music.mood}</span>
                <span>{session.music.tempo} BPM</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <PlayCircleIcon />
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default CommunityGallery;
