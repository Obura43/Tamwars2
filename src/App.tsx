import React, { useEffect, useMemo, useState } from 'react';
import { Heart, Send, RefreshCw } from 'lucide-react';
import { generatePoems } from './poemGenerator';
import { Comments } from './components/Comments';
import ContactSupport from './Pages/ContactSupport';
import DeleteAccount from './Pages/DeleteAccount';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import TermsOfUse from './Pages/TermsOfUse';

type RouteKey = '/' | '/privacy' | '/terms' | '/support' | '/delete';

const routeLabels: Record<RouteKey, string> = {
  '/': 'Home',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Use',
  '/support': 'Contact Support',
  '/delete': 'Delete Account',
};

const normalizeRoute = (pathname: string): RouteKey => {
  const cleaned = pathname.replace(/\/+$/, '') || '/';

  switch (cleaned) {
    case '/privacy':
    case '/terms':
    case '/support':
    case '/delete':
      return cleaned;
    default:
      return '/';
  }
};

function App() {
  const [prompt, setPrompt] = useState('');
  const [poems, setPoems] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [route, setRoute] = useState<RouteKey>(normalizeRoute(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setRoute(normalizeRoute(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: RouteKey) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setRoute(path);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setPoems(generatePoems(prompt, 3));
      setIsGenerating(false);
    }, 500);
  };

  const pageContent = useMemo(() => {
    switch (route) {
      case '/privacy':
        return <PrivacyPolicy />;
      case '/terms':
        return <TermsOfUse />;
      case '/support':
        return <ContactSupport />;
      case '/delete':
        return <DeleteAccount />;
      default:
        return (
          <>
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

            <div className="max-w-2xl mx-auto mb-12">
              <div className="flex flex-col gap-4 md:flex-row">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your romantic prompt..."
                  className="flex-1 px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:border-pink-500 bg-white shadow-sm"
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg flex items-center gap-2 justify-center transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg shadow-pink-500/20"
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

            <div className="max-w-4xl mx-auto grid gap-6">
              {poems.map((poem, index) => (
                <div key={index}>
                  <div className="bg-white p-6 rounded-lg border border-pink-200 shadow-lg hover:shadow-xl transition-shadow duration-300 hover:border-pink-300">
                    <pre className="whitespace-pre-wrap font-mono text-sm md:text-base text-gray-800">
                      {poem}
                    </pre>
                  </div>
                  <Comments poemId={`rizz-poem-${index}`} />
                </div>
              ))}
            </div>
          </>
        );
    }
  }, [prompt, poems, isGenerating, route]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 p-4 font-serif">
      <div className="max-w-5xl mx-auto mb-8">
        <nav className="flex flex-wrap justify-center gap-3 rounded-full bg-white/80 border border-pink-100 px-4 py-3 shadow-sm shadow-pink-200/30 backdrop-blur">
          {Object.entries(routeLabels).map(([path, label]) => (
            <button
              key={path}
              onClick={() => navigate(path as RouteKey)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                route === path ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-white text-pink-600 hover:bg-pink-50'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="max-w-5xl mx-auto">{pageContent}</div>
    </div>
  );
}

export default App;
