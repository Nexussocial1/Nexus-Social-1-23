import React, { useState } from 'react';
import { User } from '../types';
import { auth, db, googleProvider } from '../firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getFriendlyErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'IDENTITY VERIFY FAILED';
      case 'auth/email-already-in-use':
        return 'IDENTITY ALREADY SYNCED';
      case 'auth/weak-password':
        return 'PASSWORD STRENGTH INSUFFICIENT';
      default:
        return 'NEURAL PULSE ANOMALY';
    }
  };

  const syncUserToFirestore = async (fbUser: any) => {
    const userDocRef = doc(db, "users", fbUser.uid);
    const userSnap = await getDoc(userDocRef);
    
    if (!userSnap.exists()) {
      const newUser: User = {
        id: fbUser.uid,
        username: fbUser.email?.split('@')[0] || 'entity_' + fbUser.uid.slice(0, 4),
        displayName: fbUser.displayName || 'Nexus Entity',
        email: fbUser.email || '',
        avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
        bio: 'Initialized via Nexus Protocol.',
        followers: 0,
        following: 0,
        postsCount: 0
      };
      await setDoc(userDocRef, {
        ...newUser,
        createdAt: serverTimestamp(),
        verified: false,
        isAdmin: false
      });
      return newUser;
    }
    return userSnap.data() as User;
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = await syncUserToFirestore(result.user);
      onLogin(user);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let fbUser;
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        fbUser = cred.user;
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        fbUser = cred.user;
      }
      
      const user = await syncUserToFirestore(fbUser);
      onLogin(user);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#02040a] p-6 relative overflow-hidden">
      {/* Background Aura */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[120px] animate-aura"></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="glass-aura rounded-[2.5rem] p-10 md:p-12 refract-border shadow-2xl bg-black/40 backdrop-blur-3xl">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-white rounded-[1.25rem] flex items-center justify-center text-black font-black text-xl mx-auto mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)] rotate-6">
               NX
            </div>
            <h1 className="text-3xl font-display font-black text-white mb-2 tracking-tighter uppercase">
              {isLogin ? 'Nexus Login' : 'Join Nexus'}
            </h1>
            <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[9px]">
              Activate Neural Link
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4">Neural Email</label>
              <div className="glass-aura rounded-2xl border border-white/5 bg-black/20 focus-within:border-white/20 transition-colors">
                <input
                  type="email"
                  required
                  className="w-full bg-transparent px-6 py-4 focus:outline-none text-white text-sm font-medium placeholder:text-slate-800"
                  placeholder="pulse@nexus.social"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4">Neural Password</label>
              <div className="glass-aura rounded-2xl border border-white/5 bg-black/20 focus-within:border-white/20 transition-colors">
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full bg-transparent px-6 py-4 focus:outline-none text-white text-sm font-medium placeholder:text-slate-800"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-black py-4.5 px-4 rounded-[1.25rem] transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.4em] mt-8 h-14"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              ) : (
                isLogin ? 'Initiate Sync' : 'Forge Identity'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 relative py-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <span className="relative px-4 bg-[#02040a] text-[8px] font-black uppercase tracking-widest text-slate-600">Cross-Platform Sync</span>
          </div>

          {/* Google Protocol */}
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-4 flex items-center justify-center gap-3 w-full h-14 glass-aura rounded-2xl border border-white/5 hover:bg-white/5 transition-all group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.176-1.288 1.288-3.312 2.712-7.392 2.712-6.416 0-11.456-5.2-11.456-11.616s5.04-11.616 11.456-11.616c3.456 0 6.048 1.36 8.232 3.44l2.312-2.312c-2.488-2.432-5.712-4.336-10.544-4.336-8.8 0-16 7.2-16 16s7.2 16 16 16c4.76 0 8.352-1.56 11.168-4.48 2.912-2.912 3.824-7.056 3.824-10.4 0-.816-.064-1.6-.192-2.32h-14.8z"/></svg>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Google Protocol</span>
          </button>

          {/* Footer Toggle */}
          <p className="mt-10 text-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
            {isLogin ? "Not yet in the matrix? " : "Identifier exists? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-300 hover:text-white transition-all underline decoration-white/20 underline-offset-4"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;