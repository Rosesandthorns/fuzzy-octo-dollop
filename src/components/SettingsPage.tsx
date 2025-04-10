import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';

export const SettingsPage = () => { // Updated export to named export
  const { user, userTier } = useAuth();
  const [theme, setTheme] = useState('default');
  const [background, setBackground] = useState('#ffffff');
  const [gradientBackground, setGradientBackground] = useState('');
  const [emojiPack, setEmojiPack] = useState('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [prefixes, setPrefixes] = useState(['!']);
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(''); // Error state

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'userSettings', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTheme(data.theme || 'default');
          setBackground(data.background || '#ffffff');
          setGradientBackground(data.gradientBackground || '');
          setEmojiPack(data.emojiPack || 'default');
          setNotificationsEnabled(data.notificationsEnabled ?? true);
          setPrefixes(data.prefixes || ['!']);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to load settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user]);

  const saveSettings = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      await setDoc(doc(db, 'userSettings', user.uid), {
        theme,
        background,
        gradientBackground,
        emojiPack,
        notificationsEnabled,
        prefixes,
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newPrefixes = [...prefixes];
    newPrefixes[index] = e.target.value.trim(); // Remove leading/trailing spaces
    setPrefixes(newPrefixes);
  };

  const addPrefix = () => {
    if (prefixes.length >= 25) {
      alert('You can only add up to 25 prefixes.');
      return;
    }
    if (prefixes.includes('')) {
      alert('Please fill in all prefix fields before adding a new one.');
      return;
    }
    setPrefixes([...prefixes, '']);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">User Settings</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && (
        <>
          <div className="mb-6">
            <label className="block font-semibold mb-1">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>

          {(userTier === 'glow' || userTier === 'echo') && (
            <div className="mb-6">
              <label className="block font-semibold mb-1">Background Color</label>
              <input
                type="color"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-16 h-10 p-1"
              />
            </div>
          )}

          {userTier === 'echo' && (
            <div className="mb-6">
              <label className="block font-semibold mb-1">Gradient Background</label>
              <input
                type="text"
                value={gradientBackground}
                onChange={(e) => setGradientBackground(e.target.value)}
                placeholder="e.g., linear-gradient(to right, #ff7e5f, #feb47b)"
                className="p-2 border rounded w-full"
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block font-semibold mb-1">Emoji Pack</label>
            <select
              value={emojiPack}
              onChange={(e) => setEmojiPack(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="default">Default</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block font-semibold mb-1">Notifications</label>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className="p-2 bg-blue-500 text-white rounded"
            >
              {notificationsEnabled ? 'Disable' : 'Enable'} Notifications
            </button>
          </div>

          {(userTier === 'glow' || userTier === 'echo') && (
            <div className="mb-6">
              <label className="block font-semibold mb-2">Custom Prefixes (Max 25)</label>
              {prefixes.map((prefix, index) => (
                <input
                  key={index}
                  type="text"
                  value={prefix}
                  onChange={(e) => handlePrefixChange(e, index)}
                  className="block mb-1 p-2 border rounded w-full"
                />
              ))}
              <button
                onClick={addPrefix}
                className="mt-2 p-2 bg-green-500 text-white rounded"
              >
                + Add Prefix
              </button>
            </div>
          )}

          <button
            onClick={saveSettings}
            className="mt-4 p-3 bg-indigo-600 text-white rounded shadow"
          >
            Save Settings
          </button>
        </>
      )}
    </div>
  );
};
