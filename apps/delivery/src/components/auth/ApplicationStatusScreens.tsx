import React from 'react';
import { AccountStatus } from '../../types';
import { ShieldAlert, Clock, AlertTriangle, FileText, Phone, ArrowLeft, RefreshCw, HelpCircle, CheckCircle2, Sparkles } from 'lucide-react';

interface ApplicationStatusScreensProps {
  status: AccountStatus;
  applicationId?: string;
  rejectionReason?: string;
  missingDocuments?: string[];
  onBackToLogin: () => void;
  onOpenSupport: () => void;
  onResumeRegistration?: () => void;
}

export const ApplicationStatusScreens: React.FC<ApplicationStatusScreensProps> = ({
  status,
  applicationId = 'FD-APP-102938',
  rejectionReason = 'Driving licence photo verification failed due to blurriness.',
  missingDocuments = ['Driving Licence (Front & Back)', 'Vehicle RC (Registration Certificate)'],
  onBackToLogin,
  onOpenSupport,
  onResumeRegistration,
}) => {
  if (status === 'UNDER_REVIEW') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)] relative text-center text-slate-900">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center mx-auto mb-4 animate-pulse shadow-xs">
            <Clock size={32} />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-widest mb-2">
            APPLICATION UNDER REVIEW
          </span>

          <h2 className="text-xl font-extrabold text-slate-900 mb-1">Your Application is Being Verified</h2>
          <p className="text-xs text-slate-500 mb-5">
            Our Feedo partner onboarding team is currently checking your submitted documents and vehicle registration.
          </p>

          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl mb-5 text-left space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-semibold">Application Reference ID</span>
              <span className="font-mono font-bold text-amber-900">{applicationId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Current Status</span>
              <span className="font-bold text-amber-800">⏳ Under Admin Verification</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated Review Time</span>
              <span className="font-bold text-slate-900">2 to 6 Hours</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 mb-6 text-left">
            Notice: Dashboard access is disabled until your Feedo partner account is approved by admin verification.
          </div>

          <div className="space-y-2.5">
            <button
              onClick={onOpenSupport}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-200/60 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <HelpCircle size={16} />
              <span>CONTACT SUPPORT TEAM</span>
            </button>

            <button
              onClick={onBackToLogin}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <ArrowLeft size={16} />
              <span>BACK TO LOGIN</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'DOCUMENTS_PENDING') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)] relative text-center text-slate-900">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <FileText size={32} />
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 mb-1">Complete Your Application</h2>
          <p className="text-xs text-slate-500 mb-5">
            You are a few steps away from completing your Feedo delivery partner registration!
          </p>

          {/* Checklist */}
          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl mb-6 text-left space-y-2.5 text-xs">
            <div className="text-slate-400 font-bold mb-1 tracking-wider uppercase text-[10px]">Registration Checklist</div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <CheckCircle2 size={16} />
              <span>Mobile OTP Verification</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <CheckCircle2 size={16} />
              <span>Personal Information</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <CheckCircle2 size={16} />
              <span>Profile Photo</span>
            </div>
            {missingDocuments.map((doc) => (
              <div key={doc} className="flex items-center gap-2 text-rose-600 font-bold">
                <AlertTriangle size={16} />
                <span>Missing: {doc}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5">
            <button
              onClick={onResumeRegistration}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-200/60 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <RefreshCw size={16} />
              <span>RESUME REGISTRATION WIZARD</span>
            </button>

            <button
              onClick={onBackToLogin}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <ArrowLeft size={16} />
              <span>BACK TO LOGIN</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'REJECTED') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)] relative text-center text-slate-900">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <ShieldAlert size={32} />
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 mb-1">Application Not Approved</h2>
          <p className="text-xs text-slate-500 mb-5">
            Your application could not be verified by our Feedo compliance team.
          </p>

          <div className="bg-rose-50 border border-rose-200/80 p-4 rounded-2xl mb-6 text-left space-y-2 text-xs">
            <div className="text-rose-700 font-bold">REJECTION REASON</div>
            <p className="text-slate-700">{rejectionReason}</p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={onResumeRegistration}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-200/60 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <RefreshCw size={16} />
              <span>RE-UPLOAD CORRECTION DOCUMENTS</span>
            </button>

            <button
              onClick={onOpenSupport}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <HelpCircle size={16} />
              <span>CONTACT SUPPORT</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Suspended Status
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)] relative text-center text-slate-900">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <ShieldAlert size={32} />
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 mb-1">Partner Account Suspended</h2>
        <p className="text-xs text-slate-500 mb-5">
          Your Feedo delivery partner account has been temporarily suspended.
        </p>

        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl mb-6 text-left text-xs text-slate-600">
          Reason: Order cancellation threshold exceeded / Pending safety audit. Please contact Feedo Partner Helpdesk.
        </div>

        <button
          onClick={onOpenSupport}
          className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shadow-rose-200/60"
        >
          <Phone size={16} />
          <span>CALL PARTNER HELPDESK</span>
        </button>

        <button
          onClick={onBackToLogin}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-xs"
        >
          <ArrowLeft size={16} />
          <span>BACK TO LOGIN</span>
        </button>
      </div>
    </div>
  );
};
