import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { DeliveryProvider, useDelivery } from './context/DeliveryContext';
import { Header } from './components/common/Header';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { Sidebar } from './components/common/Sidebar';
import { SplashScreen } from './components/common/SplashScreen';
import { DashboardView } from './components/dashboard/DashboardView';
import { OrdersView } from './components/orders/OrdersView';
import { EarningsView } from './components/earnings/EarningsView';
import { ProfileView } from './components/profile/ProfileView';
import { HelpSupportView } from './components/support/HelpSupportView';
import { CustomerCareModal } from './components/support/CustomerCareModal';
import { ReferralModal } from './components/referral/ReferralModal';
import { EmergencySOSModal } from './components/emergency/EmergencySOSModal';
import { NotificationsModal } from './components/common/NotificationsModal';
import { OrderOfferModal } from './components/delivery/OrderOfferModal';
import { DeliverySuccessModal } from './components/delivery/DeliverySuccessModal';
import { AuthView } from './components/auth/AuthView';
import { AdminDemoPortal } from './components/admin/AdminDemoPortal';
import { FloatingDemoControlPanel } from './components/dev/FloatingDemoControlPanel';

const AppContent: React.FC = () => {
  const { isAuthenticated, isAdminPortalOpen, setIsAdminPortalOpen } = useAuth();
  const {
    offeredOrder,
    acceptOrderOffer,
    declineOrderOffer,
    showSuccessModal,
    closeSuccessModal,
    lastCompletedEarning,
    lastDeliveryEarning,
    lastTipAmount,
    activeOrder,
    activeOrders,
  } = useDelivery();

  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showSosModal, setShowSosModal] = useState<boolean>(false);
  const [showHelpCenter, setShowHelpCenter] = useState<boolean>(false);
  const [showCareModal, setShowCareModal] = useState<boolean>(false);
  const [showReferralModal, setShowReferralModal] = useState<boolean>(false);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated) {
    return (
      <AuthView
        onSuccessLogin={() => { }}
        onOpenSupport={() => setShowHelpCenter(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 md:py-6 flex items-center justify-center p-0 md:p-4 selection:bg-[#FACC15] selection:text-slate-950 font-sans">
      {/* Mobile Device Viewport Shell (Centred on desktop, full-screen on mobile phones) */}
      <div className="w-full max-w-[430px] h-[100dvh] md:h-[880px] bg-[#F8F9FA] md:rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col relative border-0 md:border-[10px] md:border-slate-800 text-slate-900">
        
        {/* Mobile Device Status Bar (Notch + Time + 5G + Battery) */}
        <div className="hidden md:flex items-center justify-between px-6 pt-3 pb-1 bg-white select-none text-[11px] font-bold text-slate-800 z-30 shrink-0 border-b border-slate-50">
          <span>9:41</span>
          <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 ml-auto mr-1.5" />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-extrabold text-slate-600">5G</span>
            <span className="text-[10px]">100%</span>
          </div>
        </div>

        {/* Top Header: Feedo branding, Care, Support & Profile */}
        <Header
          onOpenSupport={() => {
            setActiveTab('home');
            setShowHelpCenter(true);
          }}
          onOpenCare={() => setShowCareModal(true)}
          onOpenProfile={() => {
            setShowHelpCenter(false);
            setActiveTab('profile');
          }}
        />

        {/* Main Content View (Scrollable phone viewport) */}
        <main className="flex-1 overflow-y-auto p-3.5 pb-4 overscroll-contain bg-[#F8F9FA]">
          {showHelpCenter ? (
            <div className="space-y-4 max-w-xl mx-auto">
              <button
                onClick={() => setShowHelpCenter(false)}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                ← Back to Home
              </button>
              <HelpSupportView />
            </div>
          ) : (
            <>
              {activeTab === 'home' && (
                <DashboardView
                  onNavigateTab={(tab) => {
                    setShowHelpCenter(false);
                    setActiveTab(tab);
                  }}
                  onOpenHelp={() => setShowHelpCenter(true)}
                  onOpenCare={() => setShowCareModal(true)}
                  onOpenReferralModal={() => setShowReferralModal(true)}
                />
              )}
              {activeTab === 'earnings' && <EarningsView />}
              {activeTab === 'orders' && <OrdersView />}
              {activeTab === 'profile' && (
                <ProfileView onOpenHelpSupport={() => setShowHelpCenter(true)} />
              )}
            </>
          )}
        </main>

        {/* Mobile Bottom Navigation (4 items: Home, Earnings, Orders, Profile) */}
        <BottomNav
          activeTab={showHelpCenter ? 'home' : activeTab}
          setActiveTab={(tab) => {
            setShowHelpCenter(false);
            setActiveTab(tab);
          }}
          activeOrderCount={activeOrders && activeOrders.length > 0 ? activeOrders.length : (activeOrder ? 1 : 0)}
        />

        {/* Care / Customer Assistance Modal */}
        {showCareModal && (
          <CustomerCareModal
            onClose={() => setShowCareModal(false)}
            onOpenLiveChat={() => {
              setShowCareModal(false);
              setShowHelpCenter(true);
            }}
          />
        )}

        {/* Refer a Friend Modal */}
        {showReferralModal && (
          <ReferralModal onClose={() => setShowReferralModal(false)} />
        )}

        {/* Admin Demo Approval Portal */}
        {isAdminPortalOpen && (
          <AdminDemoPortal onClose={() => setIsAdminPortalOpen(false)} />
        )}

        {/* Order Incoming Offer Modal */}
        {offeredOrder && (
          <OrderOfferModal
            order={offeredOrder}
            onAccept={acceptOrderOffer}
            onDecline={declineOrderOffer}
          />
        )}

        {/* Delivery Success Celebration Modal */}
        {showSuccessModal && (
          <DeliverySuccessModal
            earningAmount={lastCompletedEarning ?? 46.50}
            deliveryEarning={lastDeliveryEarning ?? 26.50}
            tipAmount={lastTipAmount ?? 20.00}
            onClose={closeSuccessModal}
            onViewOrders={() => {
              closeSuccessModal();
              setActiveTab('orders');
            }}
          />
        )}

        {/* Notifications Drawer/Modal */}
        {showNotifications && (
          <NotificationsModal onClose={() => setShowNotifications(false)} />
        )}

        {/* Emergency SOS Modal */}
        {showSosModal && (
          <EmergencySOSModal onClose={() => setShowSosModal(false)} />
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <DeliveryProvider>
          <AppContent />
        </DeliveryProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
