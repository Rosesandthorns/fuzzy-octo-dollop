import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import Firebase Storage
import { db } from '../lib/firebase';

export const SettingsPage = () => {
  const [theme, setTheme] = useState('default');
  const [background, setBackground] = useState('#ffffff');
  const [gradientBackground, setGradientBackground] = useState('');
  const [emojiPack, setEmojiPack] = useState('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [prefixes, setPrefixes] = useState(['!']);
  const [emojiImages, setEmojiImages] = useState([]);
  const [userTier, setUserTier] = useState('free');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      if (typeof window === 'undefined' || !window.auth?.currentUser) return;
      const currentUser = window.auth.currentUser;

      setLoading(true);
      try {
        const docRef = doc(db, 'userSettings', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTheme(data.theme || 'default');
          setBackground(data.background || '#ffffff');
          setGradientBackground(data.gradientBackground || '');
          setEmojiPack(data.emojiPack || 'default');
          setNotificationsEnabled(data.notificationsEnabled ?? true);
          setPrefixes(data.prefixes || ['!']);
          setUserTier(data.tier || 'free');
          setEmojiImages(data.emojiImages || []);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to load settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    if (typeof window === 'undefined' || !window.auth?.currentUser) return;
    const currentUser = window.auth.currentUser;

    setLoading(true);
    setError('');

    try {
      await setDoc(doc(db, 'userSettings', currentUser.uid), {
        theme,
        background,
        gradientBackground,
        emojiPack,
        notificationsEnabled,
        prefixes,
        tier: userTier,
        emojiImages,
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
    newPrefixes[index] = e.target.value.trim();
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

  const handleEmojiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + emojiImages.length > 15) {
      alert('You can only upload up to 15 emojis.');
      return;
    }

    const storage = getStorage(); // Initialize Firebase Storage
    const uploadedUrls: string[] = [];

    setLoading(true);
    try {
      for (const file of files) {
        const storageRef = ref(storage, `emojis/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        uploadedUrls.push(downloadURL);
      }
      setEmojiImages([...emojiImages, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading emojis:', error);
      setError('Failed to upload emojis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-white bg-zinc-900 rounded-2xl shadow-lg space-y-6">
      <h1 className="text-4xl font-extrabold text-center">Settings</h1>

      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-red-400 font-semibold">{error}</p>}

      {!loading && (
        <>
          <div className="space-y-2">
            <label className="block font-medium text-lg">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="p-2 rounded bg-zinc-800 border border-zinc-700"
            >
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>

          {userTier === 'echo' && (
            <div className="space-y-2">
              <label className="block font-medium text-lg">Gradient Background</label>
              <input
                type="text"
                value={gradientBackground}
                onChange={(e) => setGradientBackground(e.target.value)}
                placeholder="e.g., linear-gradient(to right, #ff7e5f, #feb47b)"
                className="p-2 rounded bg-zinc-800 border border-zinc-700 w-full"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="block font-medium text-lg">Emoji Pack Upload (Max 15)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleEmojiUpload}
              className="text-sm file:bg-indigo-600 file:text-white file:px-4 file:py-2 file:rounded file:cursor-pointer"
            />
          </div>

          <div className="text-center">
            <button
              onClick={saveSettings}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md"
            >
              Save Settings
            </button>
          </div>
        </>
      )}
    </div>
  );
};
