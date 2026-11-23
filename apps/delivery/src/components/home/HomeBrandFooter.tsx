import React from 'react';

export const HomeBrandFooter: React.FC = () => {
  return (
    <footer className="w-full pt-2 pb-8 font-sans select-none text-left">
      <div className="rounded-3xl bg-slate-950 border border-slate-800/80 p-4 sm:p-5 shadow-sm flex items-center justify-between gap-3 sm:gap-4 overflow-hidden relative">
        {/* Left Side: Eat Happy Live Hearty Brand Artwork */}
        <div className="flex-shrink-0">
          <img
            src="/brand/eat-happy-live-hearty.jpg"
            alt="Eat happy. Live hearty! - Feedo"
            className="w-24 sm:w-36 md:w-44 h-auto object-contain rounded-xl select-none pointer-events-none"
            loading="lazy"
          />
        </div>

        {/* Right Side: FEEDO PROMISE (without "Drive Less") */}
        <div className="flex-1 space-y-1 text-right">
          <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FACC15]">
            FEEDO PROMISE
          </div>
          <div className="text-xs sm:text-base font-extrabold text-white tracking-tight">
            Deliver Smarter • Earn Clearly
          </div>
        </div>
      </div>
    </footer>
  );
};
