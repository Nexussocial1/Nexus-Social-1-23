import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  doc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { UserNode } from './App';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: any;
}

const ChatRoom: React.FC<{ user: UserNode, chatId: string, onBack: () => void }> = ({ user, chatId, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const participants = chatId.split('_');
  const otherUser = participants.find(p => p !== user.username) || participants[0];

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[]);
      
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const content = input.trim();
    setInput('');

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        sender: user.username,
        content,
        timestamp: serverTimestamp()
      });

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: content,
        lastUpdated: serverTimestamp()
      });
    } catch (err) {
      console.error("Transmission failure:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#02040a]/40">
      <div className="p-8 border-b border-white/5 flex items-center justify-between glass-aura z-40">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="md:hidden p-2 text-slate-500 hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth={2.5}/></svg>
          </button>
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white ring-2 ring-indigo-500/20 shadow-xl font-black">
            {otherUser.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="text-base font-display font-black text-white uppercase tracking-tight">{otherUser}</h4>
            <p className="text-[8px] font-black uppercase text-cyan-400 mt-1 tracking-widest animate-pulse">Synchronized Link</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
        {messages.map(msg => {
          const isMe = msg.sender === user.username;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="max-w-[80%] relative group">
                <div className={`px-8 py-5 rounded-[2.5rem] text-sm font-medium tracking-wide shadow-2xl transition-all duration-500 ${isMe ? 'bg-white text-black rounded-br-none' : 'glass-aura text-white border-white/10 rounded-bl-none bg-white/5'}`}>
                  {msg.content}
                </div>
                <span className={`text-[7px] font-black text-slate-700 uppercase mt-2 block ${isMe ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Syncing...'}
                </span>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="py-20 text-center opacity-10">
            <p className="text-[10px] font-black uppercase tracking-[1em]">The link is silent</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-8 glass-aura border-t border-white/5 bg-black/40 backdrop-blur-3xl">
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Emit pulse..." 
            className="flex-1 glass-aura rounded-[2rem] px-8 py-4 border border-white/10 outline-none text-white text-sm font-medium placeholder:text-slate-700 transition-all focus-within:bg-white/10" 
            value={input} 
            onChange={e => setInput(e.target.value)} 
          />
          <button type="submit" className="w-14 h-14 bg-white text-black rounded-[1.5rem] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl">
            <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;