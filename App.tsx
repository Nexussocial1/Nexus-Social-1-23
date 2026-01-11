import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './firebaseConfig';
import { User } from './types';

import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import FriendsPage from './pages/FriendsPage';
import GalleryPage from './pages/GalleryPage';
import SettingsPage from './pages/SettingsPage';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import ProfilePage from './pages/ProfilePage';
import PageDetailPage from './pages/PageDetailPage';
import GroupDetailPage from './pages/GroupDetailPage';
import HubPage from './pages/HubPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import RightSidebar from './components/RightSidebar';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

export type UserNode = User;

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userUnsub: Unsubscribe | null = null;

    const authUnsub = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) {
        setCurrentUser(null);
        setLoading(false);
        if (userUnsub) userUnsub();
        return;
      }

      const userRef = doc(db, 'users', fbUser.uid);

      userUnsub = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          setCurrentUser({ id: fbUser.uid, ...snap.data() } as User);
        } else {
          setCurrentUser({
            id: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Nexus Node',
            avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
            username: fbUser.email?.split('@')[0] || 'node_' + fbUser.uid.slice(0, 5),
            bio: 'Initializing...',
            followers: 0,
            following: 0,
          });
        }
        setLoading(false);
      });
    });

    return () => {
      authUnsub();
      if (userUnsub) userUnsub();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/5 border-t-cyan-400 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">
            NX
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser && !loading) {
  return (
    <Router>
      <LoginPage onLogin={(user) => setCurrentUser(user)} />
    </Router>
  );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Topbar user={currentUser} />
        <div className="flex flex-1 pt-32 px-8 gap-8">
          <div className="hidden lg:block w-20 sticky top-32 h-fit">
            <Sidebar user={currentUser} onLogout={handleLogout} />
          </div>

          <main className="flex-1 max-w-3xl mx-auto">
            <Routes>
              <Route path="/" element={<HomePage currentUser={currentUser} />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/chat" element={<ChatPage user={currentUser} />} />
              <Route path="/memories" element={<GalleryPage currentUser={currentUser} />} />
              <Route path="/post/:postId" element={<PostDetailPage currentUser={currentUser} />} />
              <Route path="/profile/:username" element={<ProfilePage currentUser={currentUser} onUpdateUser={setCurrentUser} />} />
              <Route path="/groups" element={<HubPage type="groups" currentUser={currentUser} />} />
              <Route path="/pages" element={<HubPage type="pages" currentUser={currentUser} />} />
              <Route path="/group/:groupId" element={<GroupDetailPage currentUser={currentUser} />} />
              <Route path="/page/:pageId" element={<PageDetailPage currentUser={currentUser} />} />
              <Route path="/settings" element={<SettingsPage currentUser={currentUser} onUpdateUser={setCurrentUser} />} />
              <Route path="/settings/:tab" element={<SettingsPage currentUser={currentUser} onUpdateUser={setCurrentUser} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <div className="hidden xl:block">
            <RightSidebar />
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
