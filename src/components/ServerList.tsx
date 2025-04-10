import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Plus, X } from 'lucide-react';

interface Server {
  id: string;
  name: string;
  createdAt: any;
  createdBy: string;
}

export function ServerList({ onSelectServer }: { onSelectServer: (id: string) => void }) {
  const [servers, setServers] = useState<Server[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'servers'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const serverList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Server));
      setServers(serverList);
    });

    return () => unsubscribe();
  }, []);

  const createServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName.trim() || !auth.currentUser) return;

    try {
      const serverRef = await addDoc(collection(db, 'servers'), {
        name: newServerName,
        createdAt: new Date(),
        createdBy: auth.currentUser.uid
      });
      setNewServerName('');
      setIsCreating(false);
      onSelectServer(serverRef.id);
      setSelectedServer(serverRef.id);
    } catch (error) {
      console.error('Error creating server:', error);
    }
  };

  const handleServerSelect = (serverId: string) => {
    setSelectedServer(serverId);
    onSelectServer(serverId);
  };

  return (
    <div className="w-60 bg-gray-800 h-screen p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">Servers</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="text-gray-400 hover:text-white transition-colors"
          title="Create new server"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {isCreating && (
        <div className="mb-4">
          <form onSubmit={createServer} className="space-y-2">
            <input
              type="text"
              value={newServerName}
              onChange={(e) => setNewServerName(e.target.value)}
              placeholder="Server name"
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white rounded px-3 py-1 text-sm hover:bg-indigo-700 transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 bg-gray-700 text-white rounded px-3 py-1 text-sm hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-1">
        {servers.map((server) => (
          <button
            key={server.id}
            onClick={() => handleServerSelect(server.id)}
            className={`w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 rounded transition-colors ${
              selectedServer === server.id ? 'bg-gray-700' : ''
            }`}
          >
            # {server.name}
          </button>
        ))}
      </div>

      {servers.length === 0 && !isCreating && (
        <div className="text-center text-gray-400 mt-4">
          <p className="text-sm">No servers yet</p>
          <p className="text-xs mt-1">Click + to create one</p>
        </div>
      )}
    </div>
  );
}
