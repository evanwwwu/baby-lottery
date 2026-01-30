import React from 'react';
import { GameState, Gender } from '../types';

interface DashboardProps {
  gameState: GameState;
}

export const Dashboard: React.FC<DashboardProps> = ({ gameState }) => {
  const { votes, winner, isRevealed } = gameState;

  // Calculate counts
  const boyCount = votes.filter(v => v.choice === Gender.BOY).length;
  const girlCount = votes.filter(v => v.choice === Gender.GIRL).length;
  const totalVotes = votes.length;

  if (isRevealed && winner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in duration-1000">
        <h2 className="text-4xl md:text-6xl font-heading font-bold text-slate-700 mb-4">結果揭曉...</h2>
        <div className={`text-6xl md:text-9xl font-black mb-8 animate-bounce ${winner === Gender.BOY ? 'text-blue-500' : 'text-pink-500'}`}>
          {winner === Gender.BOY ? "It's a BOY!" : "It's a GIRL!"}
        </div>
        <div className="text-2xl text-slate-500">
            {winner === Gender.BOY ? '💙🤴🚙' : '💖👸🎀'}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-heading font-bold text-slate-700">即時投票戰況</h2>
        <p className="text-slate-500">總票數：<span className="font-bold text-lg">{totalVotes}</span></p>
      </div>

      {/* Scoreboard Section */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border-4 border-yellow-100 mb-10 transform transition-all hover:shadow-2xl">
         <div className="flex items-center justify-around">
            {/* BOY Score */}
            <div className="text-center flex flex-col items-center group cursor-default">
               <span className="text-5xl md:text-6xl mb-2 transition-transform duration-300 group-hover:-translate-y-2 group-hover:rotate-12">🧢</span>
               <div className="text-6xl md:text-8xl font-black text-blue-500 tracking-tighter drop-shadow-sm tabular-nums">
                  {boyCount}
               </div>
               <div className="text-lg md:text-2xl font-bold text-blue-400 mt-2 bg-blue-50 px-4 py-1 rounded-full border border-blue-100">
                  BOY
               </div>
            </div>

            {/* VS Divider */}
            <div className="hidden md:flex flex-col items-center opacity-30 select-none">
               <div className="h-12 w-1.5 bg-slate-200 rounded-full mb-2"></div>
               <span className="font-heading font-black text-3xl text-slate-300 italic">VS</span>
               <div className="h-12 w-1.5 bg-slate-200 rounded-full mt-2"></div>
            </div>

            {/* GIRL Score */}
            <div className="text-center flex flex-col items-center group cursor-default">
               <span className="text-5xl md:text-6xl mb-2 transition-transform duration-300 group-hover:-translate-y-2 group-hover:-rotate-12">🎀</span>
               <div className="text-6xl md:text-8xl font-black text-pink-500 tracking-tighter drop-shadow-sm tabular-nums">
                  {girlCount}
               </div>
               <div className="text-lg md:text-2xl font-bold text-pink-400 mt-2 bg-pink-50 px-4 py-1 rounded-full border border-pink-100">
                  GIRL
               </div>
            </div>
         </div>
         
         {/* Progress Bar */}
         <div className="mt-8 relative h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div 
               className="h-full bg-blue-400 transition-all duration-1000 ease-out relative"
               style={{ width: `${totalVotes ? (boyCount / totalVotes) * 100 : 50}%` }}
            >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
            </div>
            <div 
               className="h-full bg-pink-400 transition-all duration-1000 ease-out relative"
               style={{ width: `${totalVotes ? (girlCount / totalVotes) * 100 : 50}%` }}
            >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>
         </div>
      </div>

      {/* Message Cloud Section */}
      <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border-4 border-white shadow-lg min-h-[300px]">
        <h3 className="font-heading font-bold text-xl text-slate-600 mb-6 text-center flex items-center justify-center gap-2">
           <span>💬</span> 
           <span>留言文字雲</span>
        </h3>
        
        <div className="flex flex-wrap justify-center content-start gap-4 pb-4">
          {votes.map((vote, i) => {
             // Deterministic random styling based on index
             // Avoid using Math.random() in render to prevent hydration mismatch or jitter
             const rotation = (i * 1337) % 10 - 5; // -5 to 5 degrees
             const delay = (i * 311) % 5; // 0 to 4s delay
             const duration = 3 + (i % 3); // 3-5s duration
             
             return (
              <div 
                key={vote.id} 
                className="animate-float"
                style={{ 
                  animationDelay: `${delay * 0.5}s`,
                  animationDuration: `${duration}s` 
                }}
              >
                <div 
                  className={`
                    relative px-4 py-3 rounded-2xl shadow-sm border-2 transition-all duration-300 hover:scale-110 hover:shadow-md hover:z-20 cursor-default select-none max-w-[220px]
                    ${vote.choice === Gender.BOY 
                      ? 'bg-blue-50 border-blue-200 text-blue-800' 
                      : 'bg-pink-50 border-pink-200 text-pink-800'
                    }
                  `}
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <div className="font-bold flex items-center justify-center text-sm mb-0.5">
                     <span>{vote.name}</span>
                  </div>
                  
                  {vote.userComment && (
                     <div className="text-xs text-center font-medium leading-relaxed opacity-90 break-words border-t border-current/10 pt-1 mt-1">
                        {vote.userComment}
                     </div>
                  )}
                  
                  {/* Decorative corner icon */}
                   <div className="absolute -top-2 -right-2 text-xs bg-white rounded-full p-0.5 border border-current shadow-sm">
                      {vote.choice === Gender.BOY ? '🧢' : '🎀'}
                   </div>
                </div>
              </div>
            );
          })}
          
          {votes.length === 0 && (
            <div className="flex flex-col items-center justify-center text-slate-400 py-12 w-full">
               <span className="text-5xl mb-4 opacity-50">☁️</span>
               <p className="font-medium text-lg">雲端留言板等待中...</p>
               <p className="text-sm opacity-70 mt-2">快來投下第一票，成為第一個留言的人！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};