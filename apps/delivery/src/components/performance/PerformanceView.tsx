import React from 'react';
import { Star, ThumbsUp, ShieldCheck, Clock, Heart } from 'lucide-react';
import { mockPartnerProfile } from '../../data/mockProfile';

export const PerformanceView: React.FC = () => {
  const ratingDistribution = [
    { stars: '5 ★', percentage: 92, count: 315 },
    { stars: '4 ★', percentage: 6, count: 20 },
    { stars: '3 ★', percentage: 1, count: 4 },
    { stars: '2 ★', percentage: 0.5, count: 2 },
    { stars: '1 ★', percentage: 0.5, count: 1 },
  ];

  const compliments = [
    { title: 'Super Fast Delivery', count: 184, icon: Clock },
    { title: 'Friendly & Polite', count: 142, icon: Heart },
    { title: 'Well Packaged & Intact', count: 98, icon: ShieldCheck },
    { title: 'Followed Instructions', count: 76, icon: ThumbsUp },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Performance & Partner Ratings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Maintain high ratings and low cancellation rates to receive priority order matching.</p>
      </div>

      {/* Main Overall Rating Highlight */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200/80 flex flex-col items-center justify-center font-extrabold shadow-xs">
            <span className="text-3xl leading-none">{mockPartnerProfile.rating}</span>
            <div className="flex text-amber-500 text-xs mt-1">
              <Star size={12} fill="currentColor" />
            </div>
          </div>
          <div>
            <div className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">
              EXCELLENT PARTNER SCORE
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">Top 5% Partner in Indiranagar</h2>
            <p className="text-xs text-slate-500 mt-0.5">Based on {mockPartnerProfile.totalRatings} customer & store ratings</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 text-center">
            <div className="text-xs text-slate-500 font-medium">Acceptance Rate</div>
            <div className="text-xl font-extrabold text-emerald-700">96%</div>
          </div>
          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 text-center">
            <div className="text-xs text-slate-500 font-medium">Completion Rate</div>
            <div className="text-xl font-extrabold text-emerald-700">98%</div>
          </div>
        </div>
      </div>

      {/* Rating Breakdown Chart */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-4">
        <h3 className="text-base font-extrabold text-slate-900">Star Rating Breakdown</h3>

        <div className="space-y-2.5">
          {ratingDistribution.map((item) => (
            <div key={item.stars} className="flex items-center gap-3 text-xs">
              <span className="w-8 font-bold text-amber-800">{item.stars}</span>
              <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60">
                <div
                  className="bg-[#FACC15] h-full rounded-full"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="w-12 text-right text-slate-500 font-semibold">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Compliments Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-slate-900">Customer Compliments</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {compliments.map((comp) => {
            const Icon = comp.icon;
            return (
              <div key={comp.title} className="bg-white border border-slate-100 p-4 rounded-2xl text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center justify-center mx-auto mb-2">
                  <Icon size={20} />
                </div>
                <div className="text-lg font-extrabold text-slate-900">{comp.count}</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">{comp.title}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
