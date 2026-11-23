import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/common/ToastContainer';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { NotificationsDrawer } from './components/layout/NotificationsDrawer';
import { OfflineModal } from './components/layout/OfflineModal';
import { SignOutConfirmModal } from './components/common/SignOutConfirmModal';
import { PermissionReminderDialog } from './components/common/PermissionReminderDialog';

// Modals
import { IncomingOrderModal } from './screens/main/IncomingOrderModal';
import { OrderDetailModal } from './screens/main/OrderDetailModal';

// Pre-auth screens
import { SplashScreen } from './screens/preauth/SplashScreen';
import { WelcomeScreen } from './screens/preauth/WelcomeScreen';
import { OnboardingScreen } from './screens/preauth/OnboardingScreen';
import { TermsConditionsScreen } from './screens/preauth/TermsConditionsScreen';
import { PrivacyPolicyScreen } from './screens/preauth/PrivacyPolicyScreen';
import { LegalAcceptanceScreen } from './screens/preauth/LegalAcceptanceScreen';
import { PermissionsScreen } from './screens/preauth/PermissionsScreen';
import { LoginScreen } from './screens/preauth/LoginScreen';
import { OtpScreen } from './screens/preauth/OtpScreen';
import { RegistrationScreen } from './screens/preauth/RegistrationScreen';
import { DocumentUploadScreen } from './screens/preauth/DocumentUploadScreen';
import { VerificationStatusScreen } from './screens/preauth/VerificationStatusScreen';
import { ApprovalScreen } from './screens/preauth/ApprovalScreen';
import { RestaurantSetupScreen } from './screens/preauth/RestaurantSetupScreen';

// Main screens
import { DashboardScreen } from './screens/main/DashboardScreen';
import { OrdersScreen } from './screens/main/OrdersScreen';
import { MenuScreen } from './screens/main/MenuScreen';
import { FinanceScreen } from './screens/main/FinanceScreen';
import { AnalyticsScreen } from './screens/main/AnalyticsScreen';
import { ReviewsScreen } from './screens/main/ReviewsScreen';
import { OffersScreen } from './screens/main/OffersScreen';
import { ProfileScreen } from './screens/main/ProfileScreen';
import { DocumentsScreen } from './screens/main/DocumentsScreen';
import { StaffScreen } from './screens/main/StaffScreen';
import { NotificationsScreen } from './screens/main/NotificationsScreen';
import { InventoryScreen } from './screens/main/InventoryScreen';
import { SupportScreen } from './screens/main/SupportScreen';
import { SettingsScreen } from './screens/main/SettingsScreen';
import { AdminScreen } from './screens/main/AdminScreen';

import { VolumeX } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    currentScreen,
    isAudioUnlocked,
    unlockAudio,
    showToast,
  } = useApp();

  const isPreAuth = [
    'splash',
    'welcome',
    'terms',
    'privacy',
    'acceptance',
    'permissions',
    'onboarding',
    'login',
    'otp',
    'register',
    'documents',
    'verification_status',
    'approval',
    'setup',
  ].includes(currentScreen);

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      // Pre-Auth
      case 'splash':
        return <SplashScreen />;
      case 'welcome':
        return <WelcomeScreen />;
      case 'terms':
      case 'privacy':
      case 'acceptance':
        return <TermsConditionsScreen />;
      case 'permissions':
        return <PermissionsScreen />;
      case 'onboarding':
        return <OnboardingScreen />;
      case 'login':
        return <LoginScreen />;
      case 'otp':
        return <OtpScreen />;
      case 'register':
        return <RegistrationScreen />;
      case 'documents':
        return <DocumentUploadScreen />;
      case 'verification_status':
        return <VerificationStatusScreen />;
      case 'approval':
        return <ApprovalScreen />;
      case 'setup':
        return <RestaurantSetupScreen />;

      // Main Section
      case 'dashboard':
        return <DashboardScreen />;
      case 'orders':
        return <OrdersScreen />;
      case 'menu':
        return <MenuScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'offers':
        return <OffersScreen />;
      case 'settings':
        return <SettingsScreen />;

      // Business Tools
      case 'inventory':
        return <InventoryScreen />;
      case 'earnings':
        return <FinanceScreen />;
      case 'reviews':
        return <ReviewsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'documents_compliance':
        return <DocumentsScreen />;
      case 'staff':
        return <StaffScreen />;
      case 'notifications_center':
        return <NotificationsScreen />;
      case 'support':
        return <SupportScreen />;
      case 'admin':
        return <AdminScreen />;

      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 md:py-6 flex items-center justify-center p-0 md:p-4 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Mobile Device Viewport Shell (Centred on desktop, full-screen on mobile phones) */}
      <div className="w-full max-w-[430px] h-[100dvh] md:h-[880px] bg-slate-50 md:rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col relative border-0 md:border-[10px] md:border-slate-800">
        
        {/* Mobile Device Status Bar (Notch + Time + 5G + Battery) */}
        <div className="hidden md:flex items-center justify-between px-6 pt-3 pb-1 bg-white select-none text-[11px] font-bold text-slate-800 z-30 shrink-0">
          <span>9:41</span>
          <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 ml-auto mr-1.5" />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-extrabold text-slate-600">5G</span>
            <span className="text-[10px]">100%</span>
          </div>
        </div>

        {/* Audio Permission Alert Banner (if browser blocked autoplay) */}
        {!isAudioUnlocked && (
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-feedo-600 text-white px-3 py-2 text-xs flex items-center justify-between gap-2 shadow-xs shrink-0 z-40">
            <div className="flex items-center gap-2 min-w-0">
              <VolumeX className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
              <span className="text-[10px] truncate">
                <strong>Audio Notice:</strong> Tap to enable kitchen order sound alerts.
              </span>
            </div>
            <button
              type="button"
              onClick={async () => {
                const ok = await unlockAudio();
                if (ok) {
                  showToast('🔔 Order alert sound enabled!', 'success');
                }
              }}
              className="px-2.5 py-1 bg-white text-slate-900 font-black rounded-lg hover:bg-amber-100 transition-colors shrink-0 text-[10px] shadow-xs cursor-pointer ml-1"
            >
              Enable
            </button>
          </div>
        )}

        {/* Modals & Slide-overs */}
        <ToastContainer />
        <IncomingOrderModal />
        <OrderDetailModal />
        <NotificationsDrawer />
        <OfflineModal />
        <SignOutConfirmModal />
        <PermissionReminderDialog />
        <Sidebar />

        {/* Main Phone View */}
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
          {isPreAuth ? (
            <div className="flex-1 overflow-y-auto bg-slate-50">{renderCurrentScreen()}</div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 relative">
              <Navbar />
              <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50">
                {renderCurrentScreen()}
              </main>
              <MobileBottomNav />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
