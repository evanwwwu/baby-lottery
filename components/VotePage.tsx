import React, { useState, useEffect } from 'react';
import { GameState, Gender } from '../types';
import { castVote, deleteVote } from '../services/gameService';
import { signInWithGoogle } from '../services/authService';
import { generatePrediction } from '../services/geminiService';
import { User } from 'firebase/auth';

interface VotePageProps {
  gameState: GameState;
  user: User | null;
}

export const VotePage: React.FC<VotePageProps> = ({ gameState, user }) => {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [currentHostname, setCurrentHostname] = useState<string>('');
  
  // Check if current user has already voted
  const myVote = user ? gameState.votes.find(v => v.userId === user.uid) : undefined;
  const hasVoted = !!myVote;

  // Initialize hostname on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHostname(window.location.hostname);
    }
  }, []);

  // Pre-fill name from Google Account when user logs in
  useEffect(() => {
    if (user && user.displayName && !hasVoted && !name) {
      setName(user.displayName);
    }
  }, [user, hasVoted]);

  // If re-visiting the page and already voted, show the AI message if stored (not currently stored in DB but good for session)
  // Since we don't store AI message permanently in a way that's easily retrievable for "just viewing", 
  // we can just show the result. If we wanted to persist AI message, we'd read it from `myVote.aiMessage`.
  useEffect(() => {
    if (myVote?.aiMessage) {
      setAiMessage(myVote.aiMessage);
    }
  }, [myVote]);

  const handleLogin = async () => {
    await signInWithGoogle();
  };

  const handleVote = async () => {
    if (!user) return;
    if (!name.trim() || !selectedGender) return;
    
    setIsSubmitting(true);
    
    // 1. Get AI prediction
    const prediction = await generatePrediction(name, selectedGender);
    
    // 2. Save vote to Firebase
    try {
      const result = await castVote(
        name, 
        selectedGender, 
        user.uid, 
        user.photoURL || '', 
        prediction, 
        comment.trim()
      );
      
      if (result.success) {
        setAiMessage(prediction);
      } else {
        alert(result.message || "投票失敗");
      }
    } catch (e) {
      console.error(e);
      alert("連線發生錯誤，請稍後再試。");
    }
    
    setIsSubmitting(false);
  };

  const handleUndo = async () => {
    if (!myVote) return;
    if (window.confirm("確定要取消您的下注嗎？取消後可以重新投票。")) {
      setIsSubmitting(true);
      const success = await deleteVote(myVote.id);
      setIsSubmitting(false);
      
      if (!success) {
        alert("取消失敗，可能該筆資料已被移除。");
      } else {
        setAiMessage(null);
        setSelectedGender(null);
        setComment('');
      }
    }
  };

  // --- RENDER STATES ---

  if (gameState.isLocked || gameState.isRevealed) {
    return (
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl border-4 border-purple-100">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-3xl font-heading font-bold text-slate-700 mb-2">投票已截止</h2>
        <p className="text-slate-500">爸媽準備揭曉大驚喜了！請前往即時看板頁面。</p>
      </div>
    );
  }

  // 1. User not logged in
  if (!user) {
    return (
      <div className="text-center p-10 bg-white rounded-3xl shadow-xl border-4 border-indigo-50">
        <div className="text-6xl mb-6">👋</div>
        <h2 className="text-2xl font-heading font-bold text-slate-700 mb-4">
          請先登入以進行下注
        </h2>
        <p className="text-slate-500 mb-8">為了確保公平，每人限投一票喔！</p>
        
        <button
          onClick={handleLogin}
          className="flex items-center justify-center gap-3 w-full sm:w-auto mx-auto px-8 py-4 bg-white border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-2xl transition-all shadow-sm hover:shadow-md group"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
          <span className="font-bold text-slate-700 group-hover:text-indigo-600">使用 Google 帳號登入</span>
        </button>

        <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400">
          <p className="mb-2">開發者提示：若遇到網域授權錯誤，請複製下方網址至 Firebase Console：</p>
          <code className="block bg-slate-100 p-2 rounded text-slate-600 font-mono select-all cursor-pointer hover:bg-slate-200 transition-colors break-all" title="點擊複製" onClick={(e) => {
            const textToCopy = currentHostname || window.location.hostname;
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy);
                (e.target as HTMLElement).style.backgroundColor = '#dcfce7';
                setTimeout(() => (e.target as HTMLElement).style.backgroundColor = '', 500);
            }
          }}>
            {currentHostname || '取得中...'}
          </code>
        </div>
      </div>
    );
  }

  // 2. User has already voted
  if (hasVoted) {
    return (
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl border-4 border-green-100 animate-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-4">
           <img 
              src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
              className="w-16 h-16 rounded-full border-4 border-white shadow-md mb-2" 
              alt="Avatar"
           />
           <span className="text-slate-400 text-sm">Hi, {user.displayName}</span>
        </div>
        
        <div className="text-4xl mb-2">🎉</div>
        <h2 className="text-3xl font-heading font-bold text-slate-700 mb-2">您已完成下注！</h2>
        <p className="text-slate-500 mb-6">
          您選擇了 <span className={`font-bold ${myVote.choice === Gender.BOY ? 'text-blue-500' : 'text-pink-500'}`}>
            {myVote.choice === Gender.BOY ? 'BOY' : 'GIRL'}
          </span>
        </p>
        
        {/* Show AI Message if available (either from immediate state or saved record) */}
        {(aiMessage || myVote.aiMessage) && (
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-6">
            <p className="text-xs uppercase tracking-widest text-yellow-600 font-bold mb-1">寶寶悄悄話：</p>
            <p className="italic text-slate-700 font-medium">"{aiMessage || myVote.aiMessage}"</p>
          </div>
        )}
        
        <button 
          onClick={handleUndo}
          disabled={isSubmitting}
          className="w-full py-3 bg-white border-2 border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 rounded-xl font-bold transition-colors text-sm flex items-center justify-center gap-2"
        >
          {isSubmitting ? '處理中...' : '❌ 悔棋 (取消並重新投票)'}
        </button>
      </div>
    );
  }

  // 3. User logged in, hasn't voted
  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border-4 border-indigo-50">
      <div className="flex items-center justify-between mb-6">
         <h2 className="text-2xl md:text-3xl font-heading font-bold text-slate-700">
           下注猜性別！
         </h2>
         <img 
            src={user.photoURL || ""} 
            className="w-10 h-10 rounded-full border-2 border-slate-100" 
            title={user.displayName || "User"}
         />
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">您的暱稱</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="顯示在留言板的名字"
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100 transition-all outline-none text-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">給寶寶的話 (選填)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="祝福你健康快樂..."
            rows={2}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100 transition-all outline-none text-base resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedGender(Gender.BOY)}
            className={`p-6 rounded-2xl border-4 transition-all duration-200 flex flex-col items-center space-y-2
              ${selectedGender === Gender.BOY 
                ? 'border-blue-400 bg-blue-50 scale-105 shadow-blue-200 shadow-lg' 
                : 'border-slate-100 bg-slate-50 hover:border-blue-200 opacity-70 hover:opacity-100'
              }`}
          >
            <span className="text-4xl">🧢</span>
            <span className="font-heading font-bold text-blue-500">BOY</span>
          </button>

          <button
            onClick={() => setSelectedGender(Gender.GIRL)}
            className={`p-6 rounded-2xl border-4 transition-all duration-200 flex flex-col items-center space-y-2
              ${selectedGender === Gender.GIRL
                ? 'border-pink-400 bg-pink-50 scale-105 shadow-pink-200 shadow-lg' 
                : 'border-slate-100 bg-slate-50 hover:border-pink-200 opacity-70 hover:opacity-100'
              }`}
          >
            <span className="text-4xl">🎀</span>
            <span className="font-heading font-bold text-pink-500">GIRL</span>
          </button>
        </div>

        <button
          onClick={handleVote}
          disabled={!name || !selectedGender || isSubmitting}
          className={`w-full py-4 rounded-xl text-white font-bold text-xl shadow-lg transition-all transform active:scale-95
            ${(!name || !selectedGender || isSubmitting)
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500 animate-pulse-slow'
            }`}
        >
          {isSubmitting ? '正在聽寶寶說什麼...' : '確認下注！'}
        </button>
      </div>
    </div>
  );
};