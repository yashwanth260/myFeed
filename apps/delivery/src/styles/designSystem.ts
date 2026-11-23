/**
 * Feedo Partner Premium Minimalist Light Design System
 * Inspired by modern delivery experience: Clean white surfaces, Feedo warm yellow & charcoal accents.
 * Brand Philosophy: DRIVE LESS. DELIVER SMARTER. EARN CLEARLY.
 */

export const DESIGN_TOKENS = {
  colors: {
    brand: {
      primary: '#FACC15', // Feedo vibrant warm yellow
      highlight: '#FDE047', // Light yellow
      dark: '#CA8A04', // Dark amber/gold
      gradient: 'linear-gradient(135deg, #FACC15 0%, #F5D76E 100%)',
      glow: 'rgba(250, 204, 21, 0.35)',
      glowSubtle: 'rgba(250, 204, 21, 0.15)',
    },
    background: {
      app: '#F8F9FA', // Clean light background
      surface: '#FFFFFF', // Pure white surface
      card: '#FFFFFF', // Card background
      cardElevated: '#FFFFFF',
      cardSubtle: '#F1F5F9',
      darkAccent: '#0F172A', // Slate 900 for dark chips/cards
    },
    border: {
      subtle: '#F1F5F9', // Slate 100
      light: '#E2E8F0', // Slate 200
      prominent: '#CBD5E1', // Slate 300
      yellow: 'rgba(250, 204, 21, 0.5)',
      yellowSubtle: 'rgba(250, 204, 21, 0.25)',
    },
    text: {
      primary: '#0F172A', // Slate 900
      secondary: '#475569', // Slate 600
      muted: '#94A3B8', // Slate 400
      yellow: '#CA8A04', // Amber 600
      yellowHighlight: '#EAB308',
    },
    status: {
      success: '#10B981', // Emerald 500
      error: '#EF4444', // Red 500
      warning: '#F59E0B', // Amber 500
      info: '#3B82F6', // Blue 500
    },
  },
  company: {
    name: 'Feedo',
    appName: 'Feedo Delivery Partner',
    theme: 'Premium Minimalist (White & Feedo Yellow)',
    philosophy: 'DRIVE LESS. DELIVER SMARTER. EARN CLEARLY.',
  },
  radii: {
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.75rem', // 28px
    full: '9999px',
  },
  typography: {
    heroTitle: 'text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900',
    sectionTitle: 'text-lg sm:text-xl font-extrabold tracking-tight text-slate-900',
    cardTitle: 'text-sm sm:text-base font-bold text-slate-900',
    metricNumber: 'text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight',
    bodyText: 'text-xs sm:text-sm text-slate-600 font-medium leading-relaxed',
    label: 'text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400',
  },
  cards: {
    primary: 'bg-white border border-slate-100 rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all',
    elevated: 'bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all',
    subtle: 'bg-slate-50 border border-slate-100 rounded-2xl p-3.5 sm:p-4',
    yellowGlow: 'bg-white border border-amber-300 rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(250,204,21,0.15)] transition-all',
  },
  buttons: {
    yellow: 'px-5 py-3 rounded-2xl bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-black text-xs sm:text-sm transition-all transform active:scale-[0.98] shadow-md shadow-amber-200/60 cursor-pointer flex items-center justify-center gap-2',
    secondary: 'px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm',
    dark: 'px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm transition-all transform active:scale-[0.98] shadow-sm cursor-pointer flex items-center justify-center gap-2',
  },
};
