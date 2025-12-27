
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

  if (!isAuthenticated) {
    return <WelcomeScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="mt-6">
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
