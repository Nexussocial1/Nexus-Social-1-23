import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { UserNode } from './App';

const AdminDashboard: React.FC<{ currentUser: UserNode, onSelectChat: (id: string) => void }> = ({ currentUser, onSelectChat }) => {
  const [users, setUsers] = useState<UserNode[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser.isAdmin) return;

    // Direct registry listener
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => d.data() as UserNode));
    });

    // Collective signals listener
    const unsubChats = onSnapshot(query(collection(db, 'chats'), orderBy('lastUpdated', 'desc')), (snap) => {
      setChats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => { unsubUsers(); unsubChats(); };
  }, [currentUser.isAdmin]);

  if (!currentUser.isAdmin) return <div className="p-20 text-center font-black uppercase text-rose-500 tracking-[0.5em]">Access Restricted.</div>;

  return (
    <div className="flex-1 overflow-y-auto p-12 space-y-16 custom-scrollbar bg-[#02040a]/40">
      <div className="grid gap-12 lg:grid-cols-2">
        <section>
          <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-cyan-400 mb-8 px-2">Node Registry ({users.length})</h3>
          <div className="grid gap-4">
            {users.map(u => (
              <div key={u.username} className="glass-aura p-6 rounded-[2.5rem] flex items-center justify-between border border-white/5 transition-all hover:bg-white/[0.04]">
                <div className="flex items-center gap-6">
                  <div className={`w-3 h-3 rounded-full ${u.isAdmin ? 'bg-rose-500 shadow-[0_0_15px_rose]' : 'bg-emerald-500 shadow-[0_0_15px_emerald]'} animate-pulse`}></div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">{u.username}</p>
                    <p className="text-[9px] text-slate-500 font-bold tracking-widest">{u.email}</p>
                  </div>
                </div>
                {u.isAdmin && <span className="text-[8px] font-black uppercase text-rose-500 border border-rose-500/20 px-3 py-1 rounded-full">Origin Authority</span>}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-400 mb-8 px-2">Signal Monitoring ({chats.length})</h3>
          <div className="grid gap-4">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className="w-full text-left glass-aura p-6 rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{chat.participants.join(' ↔ ')}</p>
                  <span className="text-[8px] text-slate-600 font-black uppercase">Channel Active</span>
                </div>
                <p className="text-xs text-slate-400 italic font-medium leading-relaxed">"{chat.lastMessage}"</p>
              </button>
            ))}
          </div>
        </section>
      </div>
      
      {loading && (
        <div className="text-center py-20 animate-pulse">
           <div className="w-10 h-10 border-2 border-white/5 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
           <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">Synchronizing Oversight...</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;