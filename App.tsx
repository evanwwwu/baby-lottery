import React, { useEffect, useState } from 'react';
import { GameState, INITIAL_STATE } from './types';
import { subscribeToGameUpdates } from './services/gameService';
import { auth } from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { logout } from './services/authService';
import { Dashboard } from './components/Dashboard';
import { VotePage } from './components/VotePage';
import { AdminPage } from './components/AdminPage';

type View = 'vote' | 'dashboard' | 'admin';

function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [currentView, setCurrentView] = useState<View>('vote');
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Sync state using Firebase subscription
  useEffect(() => {
    const unsubscribe = subscribeToGameUpdates((newState) => {
      setGameState(newState);
    });
    return () => unsubscribe();
  }, []);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Background style based on winner
  const getBgClass = () => {
    if (gameState.isRevealed && gameState.winner === 'BOY') return 'bg-blue-100';
    if (gameState.isRevealed && gameState.winner === 'GIRL') return 'bg-pink-100';
    return 'bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100';
  };

  const getTabClass = (view: View) => {
    const isActive = currentView === view;
    const baseClass = "px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer select-none";
    const activeClass = "bg-white text-indigo-600 shadow-sm";
    const inactiveClass = "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50";
    const adminActiveClass = "bg-slate-700 text-white shadow-sm";

    if (view === 'admin') {
      return `${baseClass} ${isActive ? adminActiveClass : inactiveClass}`;
    }
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${getBgClass()} flex flex-col font-sans overflow-x-hidden`}>
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-30 bg-stripes z-0"></div>
      <div className="fixed -top-20 -left-20 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
      <div className="fixed top-1/2 -right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{animationDelay: '1s'}}></div>
      
      {/* Navigation */}
      <nav className="relative z-20 bg-white/80 backdrop-blur-md sticky top-0 border-b border-white/20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
             <button 
                onClick={() => setCurrentView('vote')}
                className="flex items-center space-x-2 group focus:outline-none"
             >
                <span className="text-2xl group-hover:animate-bounce">👶</span>
                <h1 className="font-heading font-bold text-xl md:text-2xl text-slate-800 tracking-tight hidden md:block">
                  寶寶性別競猜
                </h1>
             </button>
          </div>
          
          <div className="flex items-center space-x-2">
             <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl mr-2">
                <button onClick={() => setCurrentView('vote')} className={getTabClass('vote')}>下注</button>
                <button onClick={() => setCurrentView('dashboard')} className={getTabClass('dashboard')}>看轉播</button>
                <button onClick={() => setCurrentView('admin')} className={getTabClass('admin')}>管理</button>
             </div>
             
             {user && (
               <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                    alt="User" 
                    className="w-8 h-8 rounded-full border border-white shadow-sm"
                  />
                  <button 
                    onClick={logout}
                    className="text-xs text-slate-400 hover:text-red-400 font-bold"
                  >
                    登出
                  </button>
               </div>
             )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-grow p-4 md:p-8">
        <div className="max-w-2xl mx-auto w-full">
          
          <div className="mb-8 text-center">
             {!gameState.isRevealed && (
               <p className="text-slate-600 font-heading text-lg animate-pulse-slow">
                 猜猜看性別！BOY or GIRL?
               </p>
             )}
          </div>

          <div className="transition-all duration-300">
            {loadingAuth ? (
              <div className="text-center py-20 text-slate-400">載入中...</div>
            ) : (
              <>
                {currentView === 'vote' && <VotePage gameState={gameState} user={user} />}
                {currentView === 'dashboard' && <Dashboard gameState={gameState} />}
                {currentView === 'admin' && <AdminPage gameState={gameState} />}
              </>
            )}
          </div>

        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-slate-400 text-sm">
        <p>© 2024 寶寶性別揭曉派對</p>
      </footer>
    </div>
  );
}

export default App;