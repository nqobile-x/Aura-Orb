
import React, { useState } from 'react';
import { SparklesIcon } from './icons';

interface MoodInputFormProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

const MoodInputForm: React.FC<MoodInputFormProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  const placeholderPrompts = [
    "I feel overwhelmed with work...",
    "Anxious about an upcoming event.",
    "Sad and lonely today.",
    "Stressed and can't focus."
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={placeholderPrompts[Math.floor(Math.random() * placeholderPrompts.length)]}
        className="w-full h-24 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-200 resize-none"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/30"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <SparklesIcon />
            <span>Create Soundscape</span>
          </>
        )}
      </button>
    </form>
  );
};

export default MoodInputForm;
