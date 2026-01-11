import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { UserNode } from './App';

interface ChatRoomData {
  id: string;
  participants: string[];
  lastMessage: string;
  lastUpdated: any;
}

const ChatList: React.FC<{ user: UserNode, activeChatId: string | null, onSelectChat: (id: string) => void }> = ({ user, activeChatId, onSelectChat }) => {
  const [chats, setChats] = useState<ChatRoomData[]>([]);
  const [targetUsername, setTargetUsername] = useState('');
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'chats'), 
      where('participants', 'array-contains', user.username),
      orderBy('lastUpdated', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatRoomData[]);
    });

    return () => unsubscribe();
  }, [user.username]);

  const startNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = targetUsername.trim().toLowerCase();
    if (!target || target === user.username) return;
    
    setIsSearching(true);
    setError('');

    try {
      // Manual Firestore "Auth" User check
      const targetDoc = await getDoc(doc(db, "users", target));
      if (!targetDoc.exists()) {
        setError('Entity not detected in Nexus.');
        return;
      }

      // Consistent ID generation for direct chats
      const chatId = [user.username, target].sort().join('_');
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.username, target].sort(),
          lastMessage: "Link Initialized.",
          lastUpdated: serverTimestamp()
        });
      }
      onSelectChat(chatId);
      setTargetUsername('');
    } catch (err: any) {
      setError('Signal disruption: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-8 overflow-y-auto custom-scrollbar">
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400 mb-6">Neural Signals</h3>
        <form onSubmit={startNewChat} className="space-y-4">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Query Identifier..." 
              className="w-full glass-aura rounded-2xl px-5 py-3.5 text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-700"
              value={targetUsername}
              onChange={e => setTargetUsername(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={isSearching}
              className="absolute right-2 top-1.5 bottom-1.5 px-4 bg-white text-black rounded-xl text-[8px] font-black uppercase hover:scale-105 transition-all shadow-lg shadow-white/5"
            >
              {isSearching ? '...' : 'Beam'}
            </button>
          </div>
          {error && <p className="text-[8px] text-rose-500 font-black uppercase text-center tracking-widest">{error}</p>}
        </form>
      </div>

      <div className="flex-1 space-y-3">
        {chats.map(chat => {
          const other = chat.participants.find(p => p !== user.username);
          return (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full text-left p-5 rounded-[2rem] border transition-all duration-500 ${activeChatId === chat.id ? 'glass-aura border-indigo-500/30 bg-white/10' : 'border-transparent hover:bg-white/5 opacity-60 hover:opacity-100'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-white font-black text-xs ring-1 ring-white/10 group-hover:scale-105 transition-all">
                  {other?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-white truncate">{other}</p>
                  <p className="text-[9px] text-slate-500 font-black truncate mt-1 uppercase tracking-tight italic opacity-70">"{chat.lastMessage}"</p>
                </div>
              </div>
            </button>
          );
        })}
        {chats.length === 0 && (
          <div className="py-20 text-center opacity-20">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">No resonances detected.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;