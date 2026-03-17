
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { IdPhotoTab } from './components/IdPhotoTab';
import { ProfilePhotoTab } from './components/ProfilePhotoTab';
import { HistoryTab } from './components/HistoryTab';
import { WelcomeScreen } from './components/WelcomeScreen';

type ActiveTab = 'id' | 'profile' | 'history';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  // Check for API key
  useEffect(() => {
    const checkApiKey = async () => {
      // @ts-ignore
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // If not running in AI Studio environment, assume true or handle differently
        setHasApiKey(true);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    // @ts-ignore
    if (window.aistudio && window.aistudio.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Assume success to mitigate race condition
      setHasApiKey(true);
    }
  };

  // Check for authentication token on initial load
  useEffect(() => {
    try {
      const authStatus = localStorage.getItem('ai-photo-studio-auth');
      if (authStatus === 'true') {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error("Failed to read from localStorage", e);
    }
  }, []);

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-black text-slate-200 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 rounded-2xl p-8 border border-slate-800 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">API Key Required</h2>
          <p className="text-slate-400 mb-6">
            This application uses the Gemini 3.1 Flash Image Preview model, which requires a paid Google Cloud API key.
            Please select your API key to continue.
          </p>
          <button
            onClick={handleSelectApiKey}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            Select API Key
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <WelcomeScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-700 mb-6">
          <Header />
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <main>
          <div>
            {activeTab === 'id' && <IdPhotoTab />}
            {activeTab === 'profile' && <ProfilePhotoTab />}
            {activeTab === 'history' && <HistoryTab />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
