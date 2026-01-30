import React from 'react';
import { GameState, Gender } from '../types';
import { adminReset, adminReveal, adminSetLock, deleteVote } from '../services/gameService';

interface AdminPageProps {
  gameState: GameState;
}

export const AdminPage: React.FC<AdminPageProps> = ({ gameState }) => {
  
  const handleReveal = (gender: Gender) => {
    // Directly call reveal without confirmation to avoid UI blocking issues
    adminReveal(gender);
  };

  const handleDelete = (voteId: string, name: string) => {
    if (window.confirm(`確定要刪除「${name}」的下注嗎？`)) {
      deleteVote(voteId);
    }
  };

  return (
    <div className="bg-slate-800 text-white p-6 md:p-8 rounded-3xl shadow-xl mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading font-bold">管理員控制台</h2>
        <div className="px-3 py-1 bg-slate-700 rounded-full text-xs font-mono">
          狀態：{gameState.isLocked ? '已鎖定' : '開放中'}
        </div>
      </div>

      <div className="space-y-8">
        {/* Game Flow */}
        <section>
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-3">遊戲流程</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button
              onClick={() => adminSetLock(!gameState.isLocked)}
              className={`py-3 px-4 rounded-xl font-bold transition-colors ${
                gameState.isLocked 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-yellow-500 hover:bg-yellow-600 text-slate-900'
              }`}
            >
              {gameState.isLocked ? '🔓 開放投票' : '🔒 鎖定投票'}
            </button>
            
            <button
              onClick={() => {
                if(window.confirm("確定要重置所有資料嗎？此動作無法復原。")) {
                  adminReset();
                }
              }}
              className="py-3 px-4 rounded-xl font-bold bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/50 transition-all"
            >
              🗑️ 重置遊戲
            </button>
          </div>
        </section>

        {/* Vote List Management */}
        <section className="bg-slate-700/30 p-4 rounded-2xl border border-slate-700">
           <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-3 flex justify-between items-center">
             <span>投票名單管理 ({gameState.votes.length})</span>
           </h3>
           
           <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
             {gameState.votes.length === 0 ? (
               <div className="text-center text-slate-500 py-4 text-sm">目前尚無下注資料</div>
             ) : (
               gameState.votes.map(vote => (
                 <div key={vote.id} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                       <span className="text-xl">{vote.choice === Gender.BOY ? '🧢' : '🎀'}</span>
                       <div>
                          <div className="font-bold text-sm">{vote.name}</div>
                          {vote.userComment && (
                            <div className="text-xs text-slate-400 truncate max-w-[150px]">{vote.userComment}</div>
                          )}
                       </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(vote.id, vote.name)}
                      className="text-slate-400 hover:text-red-400 hover:bg-red-900/30 p-2 rounded transition-colors"
                      title="刪除此票"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                 </div>
               ))
             )}
           </div>
        </section>

        {/* The Reveal */}
        <section className="bg-slate-700/50 p-4 rounded-2xl border border-slate-600">
          <h3 className="text-purple-300 text-sm font-bold uppercase tracking-wider mb-3">神聖揭曉時刻</h3>
          <p className="text-sm text-slate-400 mb-4">點擊下方按鈕將鎖定遊戲並在儀表板上顯示獲勝動畫。</p>
          
          <div className="grid grid-cols-2 gap-4">
             <button
              onClick={() => handleReveal(Gender.BOY)}
              className={`py-6 rounded-xl font-bold text-white text-lg transition-all hover:scale-105 active:scale-95 ${
                  gameState.winner === Gender.BOY 
                  ? 'bg-blue-600 ring-4 ring-blue-300 shadow-lg scale-105' 
                  : 'bg-blue-500 hover:bg-blue-400 opacity-100'
              }`}
            >
              BOY 🧢
              {gameState.winner === Gender.BOY && <span className="block text-xs mt-1">目前結果</span>}
            </button>
             <button
              onClick={() => handleReveal(Gender.GIRL)}
              className={`py-6 rounded-xl font-bold text-white text-lg transition-all hover:scale-105 active:scale-95 ${
                  gameState.winner === Gender.GIRL 
                  ? 'bg-pink-600 ring-4 ring-pink-300 shadow-lg scale-105' 
                  : 'bg-pink-500 hover:bg-pink-400 opacity-100'
              }`}
            >
              GIRL 🎀
              {gameState.winner === Gender.GIRL && <span className="block text-xs mt-1">目前結果</span>}
            </button>
          </div>
          
          {gameState.isRevealed && (
             <div className="mt-6 text-center animate-in fade-in slide-in-from-top-2">
                <div className="mb-3 text-slate-300 text-sm">
                    目前揭曉結果：<span className="font-bold text-white text-lg ml-1">{gameState.winner === Gender.BOY ? 'BOY 🧢' : 'GIRL 🎀'}</span>
                </div>
                <button 
                  onClick={() => adminReveal(null)} 
                  className="text-xs px-3 py-2 rounded bg-slate-600 hover:bg-slate-500 text-slate-300 transition-colors"
                >
                    ↩️ 取消揭曉 (隱藏動畫)
                </button>
             </div>
          )}
        </section>
      </div>
    </div>
  );
};