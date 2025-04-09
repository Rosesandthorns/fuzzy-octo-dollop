import React, { useState } from 'react';
import { MessageSquare, Users, Settings, LogOut, X } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export function Sidebar() {
  const [showSettings, setShowSettings] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleMessagesClick = () => {
    setActiveSection('Messages');
    console.log('Navigating to Messages...');
    // Add navigation logic here
  };

  const handleUsersClick = () => {
    setActiveSection('Users');
    console.log('Navigating to Users...');
    // Add navigation logic here
  };

  const handleSettingsClick = () => {
    setActiveSection('Settings');
    setShowSettings(true);
  };

  return (
    <>
      <div className="w-16 bg-gray-900 h-screen flex flex-col items-center py-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center mb-8">
          <MessageSquare className="text-white w-6 h-6" />
        </div>
        <nav className="flex-1 space-y-4">
          <button
            onClick={handleMessagesClick}
            className={`w-10 h-10 flex items-center justify-center ${
              activeSection === 'Messages' ? 'text-white bg-gray-800' : 'text-gray-400'
            } hover:text-white hover:bg-gray-800 rounded-lg transition-colors`}
            title="Messages"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
          <button
            onClick={handleUsersClick}
            className={`w-10 h-10 flex items-center justify-center ${
              activeSection === 'Users' ? 'text-white bg-gray-800' : 'text-gray-400'
            } hover:text-white hover:bg-gray-800 rounded-lg transition-colors`}
            title="Users"
          >
            <Users className="w-6 h-6" />
          </button>
          <button
            onClick={handleSettingsClick}
            className={`w-10 h-10 flex items-center justify-center ${
              activeSection === 'Settings' ? 'text-white bg-gray-800' : 'text-gray-400'
            } hover:text-white hover:bg-gray-800 rounded-lg transition-colors`}
            title="Settings"
          >
            <Settings className="w-6 h-6" />
          </button>
        </nav>
        <button
          onClick={handleLogout}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg mt-auto transition-colors"
          title="Logout"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Theme
                </label>
                <select className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Notifications
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-gray-300">Enable notifications</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
