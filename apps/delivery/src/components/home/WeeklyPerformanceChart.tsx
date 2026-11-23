import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, Calendar, Sparkles } from 'lucide-react';

interface WeeklyPerformanceChartProps {
  onViewEarnings?: () => void;
}

const WEEKLY_DATA = [
  { day: 'Mon', earnings: 780, orders: 11 },
  { day: 'Tue', earnings: 920, orders: 14 },
  { day: 'Wed', earnings: 850, orders: 12 },
  { day: 'Thu', earnings: 960, orders: 15 },
  { day: 'Fri', earnings: 1120, orders: 18 },
  { day: 'Sat', earnings: 1380, orders: 21 },
  { day: 'Sun', earnings: 1240, orders: 19 },
];

export const WeeklyPerformanceChart: React.FC<WeeklyPerformanceChartProps> = ({
  onViewEarnings,
}) => {
  const totalWeeklyEarnings = WEEKLY_DATA.reduce((acc, cur) => acc + cur.earnings, 0);
  const totalOrders = WEEKLY_DATA.reduce((acc, cur) => acc + cur.orders, 0);

  return (
    <div className="rounded-3xl bg-[#1C1C1C] border border-[#252525] p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F5D76E] text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <Sparkles size={11} className="text-[#D4AF37]" />
            <span>Weekly Performance</span>
          </div>
          <h3 className="text-lg font-black text-white tracking-tight">
            Earnings & Delivery Volume
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#A1A1A1] block">This Week</span>
            <span className="text-base sm:text-lg font-black text-[#F5D76E]">
              ₹{totalWeeklyEarnings.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="h-7 w-[1px] bg-[#252525]" />
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#A1A1A1] block">Deliveries</span>
            <span className="text-base sm:text-lg font-black text-white">
              {totalOrders}
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="h-44 sm:h-52 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={WEEKLY_DATA} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="goldBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F5D76E" stopOpacity={1} />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="goldBarGradHighlight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
                <stop offset="100%" stopColor="#F5D76E" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#A1A1A1', fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666666', fontSize: 10 }}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#151515] border border-[#D4AF37]/50 p-2.5 rounded-xl shadow-2xl text-xs space-y-1">
                      <p className="font-bold text-[#F5D76E]">{data.day}</p>
                      <p className="text-white font-extrabold">₹{data.earnings.toLocaleString('en-IN')}</p>
                      <p className="text-[#A1A1A1] text-[10px]">{data.orders} Completed Trips</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="earnings" radius={[8, 8, 2, 2]}>
              {WEEKLY_DATA.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.day === 'Sat' ? 'url(#goldBarGradHighlight)' : 'url(#goldBarGrad)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-[#252525] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[#35B879] font-semibold text-[11px]">
          <TrendingUp size={14} />
          <span>+14.2% vs previous week</span>
        </div>
        {onViewEarnings && (
          <button
            onClick={onViewEarnings}
            className="text-[11px] font-bold text-[#F5D76E] hover:underline cursor-pointer"
          >
            Full Payout Breakdown →
          </button>
        )}
      </div>
    </div>
  );
};

