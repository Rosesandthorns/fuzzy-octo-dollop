import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { ServerList } from './components/ServerList';
import { Chat } from './components/Chat';
import { SettingsPage } from './components/SettingsPage'; // Correctly import the named export

function App() {
  const [user] = useAuthState(auth);
  const [currentServer, setCurrentServer] = useState<string | null>(null);

  if (!user) {
    return <Auth />;
  }

  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar />
        <Routes>
          {/* Add a route for SettingsPage */}
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Default layout */}
          <Route
            path="/"
            element={
              <>
                <ServerList onSelectServer={setCurrentServer} />
                {currentServer ? (
                  <Chat channelId={currentServer} />
                ) : (
                  <div className="flex-1 bg-gray-700 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <h2 className="text-2xl font-bold mb-2">Welcome to Flux!</h2>
                      <p>Select a server to start chatting</p>
                    </div>
                  </div>
                )}
              </>
            }
          />
          {/* Redirect any unknown routes to "/" */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
