import React, { useState } from 'react';
import { Heart, Send, RefreshCw } from 'lucide-react';
import { generatePoems } from './poemGenerator';
import { Comments } from './components/Comments';

function App() {
  const [prompt, setPrompt] = useState('');
  const [poems, setPoems] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setPoems(generatePoems(prompt, 3));
      setIsGenerating(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 p-4 font-serif">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Heart className="w-8 h-8 text-pink-500" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-pink-600 font-serif">
          Rizz Poem Generator
        </h1>
        <h2 className="text-xl md:text-2xl text-purple-600 mb-6">
          AI-Powered Romance Poetry
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enter a prompt and let our AI create romantic poems that blend modern tech
          with timeless love. Perfect for digital age romance.
        </p>
      </div>

      {/* Input Section */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="flex gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your romantic prompt..."
            className="flex-1 px-4 py-3 rounded-lg border border-pink-200 focus:outline-none 
                     focus:border-pink-500 bg-white shadow-sm"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg
                     flex items-center gap-2 transform hover:scale-105 
                     transition-all duration-300 disabled:opacity-50 
                     disabled:hover:scale-100 disabled:cursor-not-allowed
                     shadow-lg shadow-pink-500/20"
          >
            {isGenerating ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Poems Display */}
      <div className="max-w-4xl mx-auto grid gap-6">
        {poems.map((poem, index) => (
          <div key={index}>
            <div
              className="bg-white p-6 rounded-lg border border-pink-200
                       shadow-lg hover:shadow-xl transition-shadow duration-300
                       hover:border-pink-300"
            >
              <pre className="whitespace-pre-wrap font-mono text-sm md:text-base text-gray-800">
                {poem}
              </pre>
            </div>
            <Comments poemId={`rizz-poem-${index}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;