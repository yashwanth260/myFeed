import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AccountStatus } from '../../types';
import { ApplicationStatusScreens } from './ApplicationStatusScreens';
import { PartnerRegistrationWizard } from './PartnerRegistrationWizard';
import { AdminDemoPortal } from '../admin/AdminDemoPortal';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Calendar,
  Heart,
  Clock,
  Building,
  RotateCw,
} from 'lucide-react';

interface AuthViewProps {
  onSuccessLogin: () => void;
  onOpenSupport?: () => void;
}

interface CarouselBanner {
  id: string;
  badge: string;
  badgeColor: string;
  badgeTextColor: string;
  badgeBorder: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  bgGradient: string;
  borderColor: string;
}

const FIVE_LOGIN_BANNERS: CarouselBanner[] = [
  {
    id: 'banner-1',
    badge: 'HIGH EARNING POTENTIAL',
    badgeColor: 'bg-amber-100',
    badgeTextColor: 'text-amber-950',
    badgeBorder: 'border-amber-300',
    title: 'Earn Up to ₹35,000 / Month',
    description: 'Drive less, deliver smarter, and earn clearly with instant incentives and transparent trip pay.',
    icon: Wallet,
    iconBg: 'bg-amber-100 text-amber-900 border-amber-300',
    iconColor: 'text-amber-900',
    bgGradient: 'from-amber-50/90 via-yellow-50/50 to-white',
    borderColor: 'border-amber-200/80',
  },
  {
    id: 'banner-2',
    badge: 'ON-TIME SETTLEMENTS',
    badgeColor: 'bg-emerald-100',
    badgeTextColor: 'text-emerald-950',
    badgeBorder: 'border-emerald-300',
    title: 'Automatic Wednesday Payouts',
    description: 'Weekly automated settlements sent straight to your registered bank account or UPI.',
    icon: Calendar,
    iconBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    iconColor: 'text-emerald-900',
    bgGradient: 'from-emerald-50/90 via-emerald-50/30 to-white',
    borderColor: 'border-emerald-200/80',
  },
  {
    id: 'banner-3',
    badge: 'ZERO PLATFORM CUT',
    badgeColor: 'bg-rose-100',
    badgeTextColor: 'text-rose-950',
    badgeBorder: 'border-rose-300',
    title: '100% Customer Tips to You',
    description: 'Every rupee tipped by customers is transferred directly to your balance with zero deductions.',
    icon: Heart,
    iconBg: 'bg-rose-100 text-rose-900 border-rose-300',
    iconColor: 'text-rose-900',
    bgGradient: 'from-rose-50/90 via-rose-50/30 to-white',
    borderColor: 'border-rose-200/80',
  },
  {
    id: 'banner-4',
    badge: 'YOUR SCHEDULE, YOUR WAY',
    badgeColor: 'bg-sky-100',
    badgeTextColor: 'text-sky-950',
    badgeBorder: 'border-sky-300',
    title: 'Flexible Hours & Delivery Zones',
    description: 'Deliver full-time or part-time in your favorite local cluster with complete scheduling freedom.',
    icon: Clock,
    iconBg: 'bg-sky-100 text-sky-900 border-sky-300',
    iconColor: 'text-sky-900',
    bgGradient: 'from-sky-50/90 via-sky-50/30 to-white',
    borderColor: 'border-sky-200/80',
  },
  {
    id: 'banner-5',
    badge: 'RIDER SAFETY FIRST',
    badgeColor: 'bg-purple-100',
    badgeTextColor: 'text-purple-950',
    badgeBorder: 'border-purple-300',
    title: '24/7 On-Road Assistance & Care',
    description: 'Ride with peace of mind. Instant emergency SOS, accident insurance, and dedicated partner support.',
    icon: ShieldCheck,
    iconBg: 'bg-purple-100 text-purple-900 border-purple-300',
    iconColor: 'text-purple-900',
    bgGradient: 'from-purple-50/90 via-purple-50/30 to-white',
    borderColor: 'border-purple-200/80',
  },
];

export const AuthView: React.FC<AuthViewProps> = ({ onSuccessLogin, onOpenSupport }) => {
  const {
    loginWithPhone,
    verifyOtp,
    sendRealOtp,
    verifyRealOtp,
    partner,
    isAdminPortalOpen,
    setIsAdminPortalOpen,
  } = useAuth();
  const [viewState, setViewState] = useState<'LOGIN' | 'OTP' | 'REGISTRATION' | 'STATUS_SCREEN'>('LOGIN');
  const [phone, setPhone] = useState<string>('9999999999');
  const [otp, setOtp] = useState<string>('123456');
  const [error, setError] = useState<string>('');
  const [unregisteredError, setUnregisteredError] = useState<string>('');
  const [blockedStatus, setBlockedStatus] = useState<AccountStatus>('APPROVED');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // OTP Resend Cooldown Timer
  const [resendCooldown, setResendCooldown] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);

  // 5-Banner Carousel State & Touch/Drag handlers
  const [activeBannerIndex, setActiveBannerIndex] = useState<number>(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Auto-play carousel every 4.5 seconds if not hovered/interacting
  useEffect(() => {
    if (viewState !== 'LOGIN' || isHovered) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % FIVE_LOGIN_BANNERS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [viewState, isHovered]);

  // Resend OTP countdown timer
  useEffect(() => {
    if (viewState !== 'OTP') return;
    setResendCooldown(30);
    setCanResend(false);

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [viewState]);

  // Carousel touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > 40) {
      // Swiped Left -> Next banner
      setActiveBannerIndex((prev) => (prev + 1) % FIVE_LOGIN_BANNERS.length);
    } else if (distance < -40) {
      // Swiped Right -> Previous banner
      setActiveBannerIndex((prev) => (prev - 1 + FIVE_LOGIN_BANNERS.length) % FIVE_LOGIN_BANNERS.length);
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Carousel mouse drag handling for desktop/browser
  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartXRef.current = e.clientX;
    isDraggingRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    touchEndXRef.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const distance = touchStartXRef.current - touchEndXRef.current;
      if (distance > 40) {
        setActiveBannerIndex((prev) => (prev + 1) % FIVE_LOGIN_BANNERS.length);
      } else if (distance < -40) {
        setActiveBannerIndex((prev) => (prev - 1 + FIVE_LOGIN_BANNERS.length) % FIVE_LOGIN_BANNERS.length);
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Validate mobile number: exactly 10 digits starting with 6, 7, 8, or 9
  const cleanPhone = phone.replace(/\D/g, '');
  const isValidMobile = cleanPhone.length === 10 && /^[6-9]\d{9}$/.test(cleanPhone);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnregisteredError('');
    setError('');

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await sendRealOtp(cleanPhone, 'recaptcha-container');
      setIsSubmitting(false);

      if (!res.success) {
        if (res.message && res.message.toLowerCase().includes('not registered')) {
          setUnregisteredError(res.message);
        } else {
          setError(res.message || 'Failed to send OTP code. Please check your network and try again.');
        }
        return;
      }

      // Navigate to OTP verification screen
      setOtp('');
      setViewState('OTP');
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'An error occurred while sending OTP.');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await verifyRealOtp(otp);
      setIsSubmitting(false);

      if (result.success && result.status === 'APPROVED') {
        onSuccessLogin();
      } else if (result.isUnregistered) {
        setUnregisteredError(result.message || 'Account not registered.');
        setViewState('LOGIN');
      } else if (result.message && !result.success && result.status === partner.accountStatus) {
        setError(result.message);
      } else {
        setBlockedStatus(result.status);
        setViewState('STATUS_SCREEN');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to verify OTP code.');
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await sendRealOtp(cleanPhone, 'recaptcha-container');
      setIsSubmitting(false);
      if (res.success) {
        setResendCooldown(30);
        setCanResend(false);
      } else {
        setError(res.message || 'Failed to resend OTP.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to resend OTP.');
    }
  };

  if (isAdminPortalOpen) {
    return <AdminDemoPortal onClose={() => setIsAdminPortalOpen(false)} />;
  }

  if (viewState === 'REGISTRATION') {
    return (
      <PartnerRegistrationWizard
        onBackToLogin={() => setViewState('LOGIN')}
        onCompletedRegistration={() => {
          setBlockedStatus('UNDER_REVIEW');
          setViewState('STATUS_SCREEN');
        }}
      />
    );
  }

  if (viewState === 'STATUS_SCREEN') {
    return (
      <ApplicationStatusScreens
        status={blockedStatus}
        applicationId={partner.applicationId || 'FD-APP-102938'}
        onBackToLogin={() => setViewState('LOGIN')}
        onOpenSupport={() => {
          if (onOpenSupport) onOpenSupport();
        }}
        onResumeRegistration={() => setViewState('REGISTRATION')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-3 sm:p-5 relative font-sans selection:bg-[#FACC15] selection:text-slate-950">
      {/* Background Subtle Warm Ambient Glow */}
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

      {/* Admin Demo Portal Shortcut Pill */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
        <button
          onClick={() => setIsAdminPortalOpen(true)}
          type="button"
          className="py-1 px-3 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] border border-slate-200 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          title="Open Admin Demo Dashboard"
        >
          <Building size={12} className="text-amber-600" />
          <span>Admin Portal</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-5 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)] relative z-10 space-y-4">
        {/* ======================================================== */}
        {/* 1. Centered Feedo Logo & FEEDO DELIVERY PARTNER Text     */}
        {/* ======================================================== */}
        <div className="text-center pt-1">
          {/* Logo with transparent background (no black or white box) */}
          <div className="inline-block relative">
            <img
              src="/brand/feedo-logo.png"
              alt="Feedo Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto select-none pointer-events-none drop-shadow-[0_4px_16px_rgba(250,204,21,0.35)]"
            />
          </div>

          {/* App Name: FEEDO DELIVERY PARTNER */}
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-2 flex items-center justify-center gap-1.5">
            <span>FEEDO</span>
            <span className="text-amber-800 font-black">DELIVERY PARTNER</span>
          </h1>

          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
            Drive Less • Deliver Smarter • Earn Clearly
          </p>
        </div>

        {/* ======================================================== */}
        {/* 2. Swipeable 5-Banner Carousel with Pagination Dots      */}
        {/* ======================================================== */}
        {viewState === 'LOGIN' && (
          <div
            className="space-y-2 select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Carousel Frame */}
            <div
              className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border shadow-xs"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {/* Slides Track */}
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${activeBannerIndex * 100}%)` }}
              >
                {FIVE_LOGIN_BANNERS.map((banner) => {
                  const Icon = banner.icon;
                  return (
                    <div
                      key={banner.id}
                      className={`min-w-full p-4 sm:p-5 bg-gradient-to-br ${banner.bgGradient} border ${banner.borderColor} rounded-2xl sm:rounded-3xl flex flex-col justify-between min-h-[140px]`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span
                            className={`inline-block text-[9px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${banner.badgeColor} ${banner.badgeTextColor} ${banner.badgeBorder}`}
                          >
                            {banner.badge}
                          </span>
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                            {banner.title}
                          </h3>
                        </div>

                        <div
                          className={`w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 shadow-xs ${banner.iconBg}`}
                        >
                          <Icon size={20} className={banner.iconColor} />
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed mt-2 line-clamp-2">
                        {banner.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Discrete Left / Right Arrow Chevrons */}
              <button
                type="button"
                onClick={() =>
                  setActiveBannerIndex(
                    (prev) => (prev - 1 + FIVE_LOGIN_BANNERS.length) % FIVE_LOGIN_BANNERS.length
                  )
                }
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 flex items-center justify-center shadow-sm border border-slate-200 transition-all cursor-pointer"
                aria-label="Previous Banner"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={() => setActiveBannerIndex((prev) => (prev + 1) % FIVE_LOGIN_BANNERS.length)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 flex items-center justify-center shadow-sm border border-slate-200 transition-all cursor-pointer"
                aria-label="Next Banner"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-1.5 pt-0.5">
              {FIVE_LOGIN_BANNERS.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => setActiveBannerIndex(index)}
                  className={`transition-all duration-300 cursor-pointer ${
                    activeBannerIndex === index
                      ? 'w-6 h-2 rounded-full bg-[#FACC15]'
                      : 'w-2 h-2 rounded-full bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW A: LOGIN SCREEN (Mobile OTP Only)                   */}
        {/* ======================================================== */}
        {viewState === 'LOGIN' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4 pt-1">
            {/* 3. "LOGIN Using:" Header & Mobile Input */}
            <div className="space-y-2">
              <div className="text-left">
                <span className="text-xs font-black text-slate-800 tracking-wider uppercase">
                  LOGIN Using:
                </span>
              </div>

              {/* Mobile Number Input with +91 Country Code */}
              <div
                className={`relative flex items-center bg-slate-50 border rounded-2xl transition-all ${
                  isValidMobile
                    ? 'border-emerald-500 ring-2 ring-emerald-100 bg-white'
                    : 'border-slate-200 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 focus-within:bg-white'
                }`}
              >
                {/* Country Code Pill */}
                <div className="flex items-center gap-1.5 pl-4 pr-3 py-3 border-r border-slate-200 text-slate-800 font-extrabold text-sm select-none">
                  <span className="text-base">🇮🇳</span>
                  <span>+91</span>
                </div>

                {/* 10-Digit Numeric Keyboard Input */}
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    setPhone(cleaned);
                    setUnregisteredError('');
                    setError('');
                  }}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full bg-transparent px-3 py-3 text-base font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none tracking-wide"
                  autoComplete="tel-national"
                  autoFocus
                />

                {/* Validation Indicator */}
                <div className="pr-3.5 flex items-center">
                  {isValidMobile ? (
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 size={16} />
                    </span>
                  ) : cleanPhone.length > 0 ? (
                    <span className="text-[11px] font-semibold text-slate-400">
                      {cleanPhone.length}/10
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Validation Error Message */}
            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Unregistered Mobile Number Warning */}
            {unregisteredError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle size={15} className="text-rose-600" />
                  <span>MOBILE NUMBER NOT REGISTERED</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">{unregisteredError}</p>
                <button
                  type="button"
                  onClick={() => setViewState('REGISTRATION')}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus size={15} />
                  <span>REGISTER AS DELIVERY PARTNER NOW</span>
                </button>
              </div>
            )}

            {/* Quick Demo Helper Presets */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Quick Test Partner:</span>
              <button
                type="button"
                onClick={() => {
                  setPhone('9999999999');
                  setUnregisteredError('');
                  setError('');
                }}
                className="font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full cursor-pointer transition-colors"
              >
                9999999999 (Approved)
              </button>
            </div>

            {/* ======================================================== */}
            {/* 4. "Continue with Mobile OTP →" Button                   */}
            {/* ======================================================== */}
            <button
              type="submit"
              disabled={!isValidMobile || isSubmitting}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isValidMobile && !isSubmitting
                  ? 'bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 shadow-amber-200/80 active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RotateCw size={18} className="animate-spin text-slate-950" />
                  <span>SENDING SECURE OTP...</span>
                </>
              ) : (
                <>
                  <span>Continue with Mobile OTP</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* ======================================================== */}
            {/* 5. "Apply & Register as Delivery Partner" Option         */}
            {/* ======================================================== */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setViewState('REGISTRATION')}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-900 text-slate-950 font-black text-xs sm:text-sm tracking-wide transition-all shadow-xs hover:shadow active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus size={16} className="text-amber-600" />
                <span>Apply & Register as Delivery Partner</span>
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* VIEW B: OTP VERIFICATION SCREEN                          */}
        {/* ======================================================== */}
        {viewState === 'OTP' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4 pt-1">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                VERIFY MOBILE OTP
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-2">
                Enter Verification Code
              </h2>
              <p className="text-xs text-slate-500">
                6-digit OTP code dispatched to <strong className="text-slate-900">+91 {phone}</strong>
              </p>
            </div>

            {/* OTP Input */}
            <div className="space-y-2">
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                placeholder="123456"
                className="w-full text-center text-3xl font-mono tracking-widest font-black py-3.5 px-4 rounded-2xl bg-slate-50 border-2 border-amber-400 text-slate-950 focus:outline-none focus:bg-white shadow-xs"
                autoFocus
              />

              {/* Demo OTP Helper */}
              <div className="text-[11px] text-slate-600 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-center flex items-center justify-center gap-1.5 font-medium">
                <span>Demo OTP Code:</span>
                <span className="text-amber-950 font-mono font-black text-xs">123456</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Resend OTP Cooldown */}
            <div className="text-center text-xs text-slate-500">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-bold text-amber-900 hover:underline cursor-pointer"
                >
                  Resend OTP Code
                </button>
              ) : (
                <span>
                  Resend OTP code in <strong className="font-mono text-slate-900">{resendCooldown}s</strong>
                </span>
              )}
            </div>

            {/* Verify & Sign In Button */}
            <button
              type="submit"
              disabled={otp.length !== 6 || isSubmitting}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                otp.length === 6 && !isSubmitting
                  ? 'bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 shadow-amber-200/80 active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RotateCw size={18} className="animate-spin text-slate-950" />
                  <span>VERIFYING OTP...</span>
                </>
              ) : (
                <>
                  <span>VERIFY OTP & CONTINUE</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Change Number Option */}
            <button
              type="button"
              onClick={() => setViewState('LOGIN')}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-900 py-1 cursor-pointer transition-colors font-semibold"
            >
              ← Change Mobile Number
            </button>
          </form>
        )}

        {/* Persistent invisible reCAPTCHA container for Firebase Phone Authentication */}
        <div id="recaptcha-container" />
      </div>
    </div>
  );
};
