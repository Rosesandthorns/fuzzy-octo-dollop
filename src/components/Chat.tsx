import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Send, Smile } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: any;
}

export function Chat({ channelId }: { channelId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, `channels/${channelId}/messages`),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    setIsLoading(true);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Message))
        .reverse();
      setMessages(newMessages);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [channelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    try {
      await addDoc(collection(db, `channels/${channelId}/messages`), {
        text: newMessage,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.email?.split('@')[0] || 'Anonymous',
        createdAt: serverTimestamp()
      });
      setNewMessage('');
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-700">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 ${
                    message.userId === auth.currentUser?.uid ? 'justify-end' : ''
                  }`}
                >
                  <div
                    className={`max-w-xl rounded-lg px-4 py-2 ${
                      message.userId === auth.currentUser?.uid
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-600 text-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {message.userName}
                      </span>
                      <span className="text-xs opacity-75 ml-2">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                    <div className="mt-1">{message.text}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-600">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="text-gray-400 hover:text-white transition-colors"
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
          <input
            ref={messageInputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-indigo-600 text-white rounded-lg p-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}