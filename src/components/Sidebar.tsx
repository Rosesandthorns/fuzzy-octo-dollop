import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Settings, LogOut } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation

export function Sidebar() {
  const [theme, setTheme] = useState('dark'); // Default theme
  const user = auth.currentUser;
  const navigate = useNavigate(); // Initialize navigate function
  const location = useLocation(); // Get the current location

  useEffect(() => {
    const fetchTheme = async () => {
      if (user) {
        try {
          const userDoc = doc(db, 'users', user.uid); // Fetch user document
          const userSnap = await getDoc(userDoc);

          if (userSnap.exists() && userSnap.data().theme) {
            setTheme(userSnap.data().theme); // Set theme from Firebase
          }
        } catch (error) {
          console.error('Error fetching theme:', error);
        }
      }
    };

    fetchTheme();
  }, [user]);

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);

    if (user) {
      try {
        const userDoc = doc(db, 'users', user.uid);
        await setDoc(userDoc, { theme: newTheme }, { merge: true }); // Save theme to Firebase
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <div className="w-16 bg-gray-900 h-screen flex flex-col items-center py-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center mb-8">
          <MessageSquare className="text-white w-6 h-6" />
        </div>
        <nav className="flex-1 space-y-4">
          {/* Home Button */}
          <button
            onClick={() => navigate('/')} // Navigate to default page
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              location.pathname === '/'
                ? 'bg-indigo-600 text-white' // Active state styles
                : 'text-gray-400 hover:text-white hover:bg-gray-800' // Inactive state styles
            }`}
            title="Home"
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          {/* Users Button */}
          <button
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Users"
          >
            <Users className="w-6 h-6" />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => navigate('/settings')} // Navigate to settings page
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              location.pathname === '/settings'
                ? 'bg-indigo-600 text-white' // Active state styles
                : 'text-gray-400 hover:text-white hover:bg-gray-800' // Inactive state styles
            }`}
            title="Settings"
          >
            <Settings className="w-6 h-6" />
          </button>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg mt-auto transition-colors"
          title="Logout"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </>
  );
}
