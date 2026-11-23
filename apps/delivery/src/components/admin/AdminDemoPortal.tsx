import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';
import { PartnerProfile, AccountStatus } from '../../types';
import { adminStorage } from '../../services/adminStorage';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  X,
  Eye,
  Download,
  Upload,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Users,
  Bike,
  Wallet,
  Activity,
  Database,
  Radio,
  Save,
  ShoppingBag,
  LayoutGrid
} from 'lucide-react';
import { AdminStoreManagement } from './AdminStoreManagement';
import { AdminBannerManagement } from './AdminBannerManagement';

interface AdminDemoPortalProps {
  onClose: () => void;
}

type AdminTab = 'overview' | 'partners' | 'orders' | 'banners' | 'store' | 'logs' | 'payouts' | 'storage';

export const AdminDemoPortal: React.FC<AdminDemoPortalProps> = ({ onClose }) => {
  const {
    registeredPartners,
    usageLogs,
    partner: currentActivePartner,
    approvePartnerApplication,
    rejectPartnerApplication,
    suspendPartnerAccount,
    reactivatePartnerAccount,
    switchPartner,
    deletePartner,
    updateAnyPartner,
    addNewPartnerManually,
    resetFleetData,
  } = useAuth();

  const { ordersHistory, activeOrder, isOnline } = useDelivery();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [partnerFilter, setPartnerFilter] = useState<AccountStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Inspect & Edit Modals
  const [inspectPartner, setInspectPartner] = useState<PartnerProfile | null>(null);
  const [editingPartner, setEditingPartner] = useState<PartnerProfile | null>(null);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState<boolean>(false);
  const [rejectionModalPartner, setRejectionModalPartner] = useState<PartnerProfile | null>(null);
  const [customRejectionReason, setCustomRejectionReason] = useState<string>('');

  // New Partner Form State
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerPhone, setNewPartnerPhone] = useState('+91 ');
  const [newPartnerEmail, setNewPartnerEmail] = useState('');
  const [newPartnerCity, setNewPartnerCity] = useState('Bengaluru');
  const [newPartnerZone, setNewPartnerZone] = useState('Indiranagar Zone');
  const [newPartnerVehicleType, setNewPartnerVehicleType] = useState<'Bike' | 'Scooter' | 'Electric Vehicle'>('Scooter');
  const [newPartnerVehicleNumber, setNewPartnerVehicleNumber] = useState('KA 01 AB ');
  const [newPartnerStatus, setNewPartnerStatus] = useState<AccountStatus>('APPROVED');

  // Storage notification feedback
  const [storageFeedback, setStorageFeedback] = useState<string | null>(null);

  // Filtered partners
  const filteredPartners = registeredPartners.filter((p) => {
    if (partnerFilter !== 'ALL' && p.accountStatus !== partnerFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.applicationId.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.currentZone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = registeredPartners.filter((p) => p.accountStatus === 'UNDER_REVIEW').length;
  const approvedCount = registeredPartners.filter((p) => p.accountStatus === 'APPROVED').length;

  // Handle Export Data
  const handleExportJSON = () => {
    const jsonStr = adminStorage.exportAllDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedo-fleet-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStorageFeedback('Fleet database exported as JSON successfully.');
    setTimeout(() => setStorageFeedback(null), 3500);
  };

  // Handle Import Data
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = adminStorage.importDataFromJSON(content);
      if (res.success) {
        window.location.reload();
      } else {
        setStorageFeedback(`Import Failed: ${res.message}`);
        setTimeout(() => setStorageFeedback(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  // Handle Submit New Partner
  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName.trim() || !newPartnerPhone.trim()) return;

    addNewPartnerManually({
      name: newPartnerName,
      phone: newPartnerPhone,
      email: newPartnerEmail || `${newPartnerName.toLowerCase().replace(/\s+/g, '.')}@feedo.com`,
      city: newPartnerCity,
      currentZone: newPartnerZone,
      accountStatus: newPartnerStatus,
      vehicle: {
        type: newPartnerVehicleType,
        model: 'Standard Fleet Vehicle',
        number: newPartnerVehicleNumber,
        fuelType: newPartnerVehicleType === 'Electric Vehicle' ? 'Electric' : 'Petrol',
        insuranceValidUntil: '2027-12-31',
        rcNumber: `RC-${Date.now().toString().slice(-8)}`,
        pucValidUntil: '2026-12-31',
      },
    });

    setShowAddPartnerModal(false);
    setStorageFeedback(`Partner ${newPartnerName} successfully onboarded and stored.`);
    setTimeout(() => setStorageFeedback(null), 3500);
  };

  // Handle Edit Partner Save
  const handleSaveEditedPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    updateAnyPartner(editingPartner.id, editingPartner);
    setEditingPartner(null);
    setStorageFeedback(`Changes to partner ${editingPartner.name} saved and stored.`);
    setTimeout(() => setStorageFeedback(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-6xl h-[92vh] bg-white border border-slate-200 rounded-3xl flex flex-col shadow-2xl overflow-hidden relative">
        {/* Top Header Bar */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/brand/feedo-logo.png"
              alt="Feedo"
              className="w-10 h-10 object-contain drop-shadow-sm select-none pointer-events-none"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  FEEDO CENTRAL ADMIN DASHBOARD
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
                  FLEET STORE
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Full Access Controller & Persistent Data Store for Delivery Partner Fleet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-xs"
              title="Export all partner records as JSON"
            >
              <Download size={14} />
              <span>Export Store</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 text-slate-400 hover:text-slate-900 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              title="Close Admin Dashboard"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {storageFeedback && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs font-bold text-amber-900 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-amber-800" />
              <span>{storageFeedback}</span>
            </div>
            <button onClick={() => setStorageFeedback(null)} className="text-slate-400 hover:text-slate-700">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-slate-50 px-4 border-b border-slate-200 flex items-center gap-1 overflow-x-auto select-none no-scrollbar">
          {[
            { id: 'overview' as AdminTab, label: 'Overview & Fleet Metrics', icon: Activity },
            { id: 'partners' as AdminTab, label: `Partners Directory (${registeredPartners.length})`, icon: Users },
            { id: 'orders' as AdminTab, label: 'Live Orders & Trips', icon: Bike },
            { id: 'banners' as AdminTab, label: 'Home Page Banner Management (5)', icon: LayoutGrid },
            { id: 'store' as AdminTab, label: 'Feedo Partner Store', icon: ShoppingBag },
            { id: 'logs' as AdminTab, label: `Partner Usage Logs (${usageLogs.length})`, icon: Activity },
            { id: 'payouts' as AdminTab, label: 'Financials & Payouts', icon: Wallet },
            { id: 'storage' as AdminTab, label: 'Data Storage & Backup', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#FACC15] text-slate-950 bg-white shadow-xs font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-amber-600' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-slate-900 bg-slate-50/40">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Total Registered</span>
                    <Users size={16} className="text-amber-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">{registeredPartners.length}</div>
                  <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
                    <span>{approvedCount} Verified Active</span>
                  </div>
                </div>

                <div className="bg-white border border-amber-300 p-4 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
                    <span>Under Review</span>
                    <Clock size={16} />
                  </div>
                  <div className="text-2xl font-extrabold text-amber-900">{pendingCount}</div>
                  <div className="text-[11px] text-amber-700 mt-1 font-medium">Requires admin approval</div>
                </div>

                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Live Riders Duty</span>
                    <Radio size={16} className="text-emerald-600 animate-pulse" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {isOnline ? '1 Active' : '0 Online'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Active rider: {currentActivePartner.name}
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Fleet Deliveries</span>
                    <Bike size={16} className="text-emerald-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {840 + ordersHistory.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Payout balance: ₹45,890
                  </div>
                </div>
              </div>

              {/* Live Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Active Session & Switcher */}
                <div className="bg-white border border-slate-200/80 p-4 sm:p-5 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} className="text-amber-600" />
                      <span className="font-extrabold text-sm text-slate-900">Active Simulated Rider Session</span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      LIVE
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                    <img
                      src={currentActivePartner.photoUrl}
                      alt={currentActivePartner.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-extrabold text-slate-900">{currentActivePartner.name}</div>
                      <div className="text-xs text-slate-500">
                        ID: <span className="text-amber-900 font-mono font-bold bg-amber-100 px-1 rounded">{currentActivePartner.id}</span> • {currentActivePartner.currentZone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Database Backup Shortcut */}
                <div className="bg-white border border-slate-200/80 p-4 sm:p-5 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Database size={18} className="text-amber-600" />
                      <span className="font-extrabold text-sm text-slate-900">Persistent Fleet Data Store</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    All delivery partner records and event audit logs are saved in persistent storage.
                  </p>
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2.5 px-3 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download Fleet JSON Backup</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity Ticker */}
              <div className="bg-white border border-slate-200/80 p-4 sm:p-5 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Activity size={18} className="text-amber-600" />
                    <span className="font-extrabold text-sm text-slate-900">Real-Time Delivery Partner Uses & Activity</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="text-xs text-amber-800 font-bold hover:underline cursor-pointer"
                  >
                    View All ({usageLogs.length}) →
                  </button>
                </div>

                <div className="space-y-2">
                  {usageLogs.slice(0, 4).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#FACC15]" />
                        <div>
                          <div className="font-bold text-slate-900">
                            {log.partnerName} • <span className="text-amber-900 font-mono text-[11px] font-bold">{log.partnerId}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{log.details}</div>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                        {log.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARTNERS DIRECTORY */}
          {activeTab === 'partners' && (
            <div className="space-y-4">
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                {/* Search */}
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, mobile, partner ID, or zone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                  {(['ALL', 'UNDER_REVIEW', 'APPROVED', 'DOCUMENTS_PENDING', 'SUSPENDED', 'REJECTED'] as const).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setPartnerFilter(st)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                          partnerFilter === st
                            ? 'bg-[#FACC15] text-slate-950 shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setShowAddPartnerModal(true)}
                    className="px-3.5 py-1.5 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    <Plus size={14} />
                    <span>New Partner</span>
                  </button>
                </div>
              </div>

              {/* Partners Table / Card List */}
              <div className="space-y-2.5">
                {filteredPartners.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                    No delivery partners match the selected search or filter criteria.
                  </div>
                ) : (
                  filteredPartners.map((p) => {
                    const isCurrent = currentActivePartner.id === p.id;

                    return (
                      <div
                        key={p.id}
                        className={`p-4 rounded-2xl bg-white border transition-all shadow-xs ${
                          isCurrent ? 'border-amber-400 bg-amber-50/20 ring-1 ring-amber-300' : 'border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          {/* Left: Info */}
                          <div className="flex items-center gap-3.5">
                            <img
                              src={p.photoUrl}
                              alt={p.name}
                              className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-900">{p.name}</span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                    p.accountStatus === 'APPROVED'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : p.accountStatus === 'UNDER_REVIEW'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                      : p.accountStatus === 'SUSPENDED'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {p.accountStatus.replace('_', ' ')}
                                </span>
                                {isCurrent && (
                                  <span className="text-[10px] font-extrabold text-slate-950 bg-[#FACC15] px-2 py-0.5 rounded-full">
                                    CURRENT USER
                                  </span>
                                )}
                              </div>

                              <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span>ID: <strong className="text-slate-900 font-mono">{p.id}</strong></span>
                                <span>App ID: <strong className="text-amber-800 font-mono">{p.applicationId}</strong></span>
                                <span>Phone: <strong className="text-slate-900">{p.phone}</strong></span>
                                <span>Zone: {p.currentZone}</span>
                              </div>

                              <div className="text-[11px] text-slate-400 mt-1">
                                Vehicle: {p.vehicle?.model} ({p.vehicle?.number}) • Bank: {p.bankDetails?.bankName} ({p.bankDetails?.accountNumberMasked})
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                            <button
                              onClick={() => setInspectPartner(p)}
                              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                              title="Inspect Full Partner Profile & Documents"
                            >
                              <Eye size={13} className="text-slate-600" />
                              <span>View</span>
                            </button>

                            <button
                              onClick={() => setEditingPartner(p)}
                              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                              title="Edit Partner Information"
                            >
                              <Edit3 size={13} className="text-slate-600" />
                              <span>Edit</span>
                            </button>

                            {p.accountStatus === 'UNDER_REVIEW' && (
                              <>
                                <button
                                  onClick={() => approvePartnerApplication(p.applicationId)}
                                  className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-xs font-extrabold text-white cursor-pointer shadow-xs transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectionModalPartner(p);
                                    setCustomRejectionReason('Documents provided do not meet clarity requirements.');
                                  }}
                                  className="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {p.accountStatus === 'APPROVED' && !isCurrent && (
                              <button
                                onClick={() => switchPartner(p.id)}
                                className="px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold cursor-pointer flex items-center gap-1 transition-colors"
                                title="Login As this Delivery Partner"
                              >
                                <ExternalLink size={13} />
                                <span>Switch User</span>
                              </button>
                            )}

                            {p.accountStatus === 'APPROVED' && (
                              <button
                                onClick={() => suspendPartnerAccount(p.id, 'Admin audit compliance pause.')}
                                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-amber-800 text-xs font-bold cursor-pointer transition-colors"
                              >
                                Suspend
                              </button>
                            )}

                            {p.accountStatus === 'SUSPENDED' && (
                              <button
                                onClick={() => reactivatePartnerAccount(p.id)}
                                className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer transition-colors shadow-xs"
                              >
                                Reactivate
                              </button>
                            )}

                            {!isCurrent && (
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete delivery partner ${p.name}?`)) {
                                    deletePartner(p.id);
                                  }
                                }}
                                className="p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer transition-colors"
                                title="Delete Partner Record"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LIVE ORDERS & TRIPS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-sm text-slate-900">Live Fleet Dispatch & Trip Monitor</div>
                  <div className="text-xs text-slate-500">Real-time visibility into pickup codes, customer OTPs, and delivery stages</div>
                </div>
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {activeOrder ? '1 Order In-Transit' : 'No Active Dispatches'}
                </span>
              </div>

              {activeOrder && (
                <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-300 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                    <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Radio size={14} className="animate-ping" />
                      Live Order In Progress • #{activeOrder.id}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                      Stage: {activeOrder.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-slate-500">Restaurant / Store</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{activeOrder.store.name}</div>
                      <div className="text-[11px] text-slate-400">{activeOrder.store.address}</div>
                      <div className="mt-2 text-amber-900 font-mono font-bold bg-amber-50 p-1 rounded">
                        Pickup Code: {activeOrder.pickupCode}
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-slate-500">Customer Delivery</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{activeOrder.customer.name}</div>
                      <div className="text-[11px] text-slate-400">{activeOrder.customer.address}</div>
                      <div className="mt-2 text-emerald-800 font-mono font-bold bg-emerald-50 p-1 rounded">
                        Delivery OTP: {activeOrder.deliveryOtp}
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <div className="text-slate-500">Earning & Metrics</div>
                      <div className="text-xl font-extrabold text-slate-900 mt-0.5">₹{activeOrder.estimatedEarnings}</div>
                      <div className="text-[11px] text-slate-500">
                        Distance: {activeOrder.totalDistance} km • Time: {activeOrder.estimatedTime}m
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Completed Fleet Orders */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                  Recent Delivered Trips ({ordersHistory.length})
                </div>

                {ordersHistory.length === 0 ? (
                  <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                    No past delivered orders recorded in this session. Deliver an order to see it logged here.
                  </div>
                ) : (
                  ordersHistory.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                          ✓
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            #{ord.id} • {ord.store.name} ➔ {ord.customer.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {ord.totalDistance} km • OTP: {ord.deliveryOtp} • Pickup Code: {ord.pickupCode}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-extrabold text-slate-900">₹{ord.estimatedEarnings}</div>
                        <div className="text-[10px] text-emerald-700 font-bold uppercase">Delivered</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: USAGE LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-sm text-slate-900">Delivery Partner Uses & Activity Audit Log</div>
                  <div className="text-xs text-slate-500">Real-time operational stream of rider logins, duty changes, and delivery actions</div>
                </div>
                <button
                  onClick={() => {
                    adminStorage.saveUsageLogs([]);
                    window.location.reload();
                  }}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>

              <div className="space-y-2">
                {usageLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-xs flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.partnerName}</span>
                        <span className="text-amber-800 font-mono text-[11px]">({log.partnerId})</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-400">{log.zone}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">{log.details}</p>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                      {log.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FINANCIALS & PAYOUTS */}
          {activeTab === 'payouts' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs text-slate-500">Wednesday Settlement Cycle</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">₹45,890.00</div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1">Automated Bank Transfer</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs text-slate-500">Bank Accounts Verified</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">
                    {registeredPartners.filter((p) => p.bankDetails?.isVerified).length} / {registeredPartners.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">NPCI IMPS Ready</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs text-slate-500">Disbursement Schedule</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">Next Wednesday</div>
                  <div className="text-[11px] text-slate-500 mt-1">06:00 AM Auto-Batch</div>
                </div>
              </div>

              {/* Partners Bank Ledger */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-3.5 border-b border-slate-100 font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                  Partner Settlement & Bank Accounts Ledger
                </div>

                <div className="divide-y divide-slate-100">
                  {registeredPartners.map((p) => (
                    <div key={p.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{p.name} ({p.id})</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {p.bankDetails?.bankName} • {p.bankDetails?.accountNumberMasked} • IFSC: {p.bankDetails?.ifscCode}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] font-mono font-bold text-emerald-700">{p.bankDetails?.upiId}</div>
                        <span className="text-[10px] font-bold text-emerald-700">
                          {p.bankDetails?.isVerified ? '✓ Verified Account' : 'Pending Penny Drop'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DATA STORAGE & BACKUP */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <Database size={18} className="text-amber-600" />
                  <span>Persistent Fleet Database Status</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  All delivery partner registrations, document verification states, account updates, and live usage events are automatically stored in browser persistent storage.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-slate-500">Storage Engine</div>
                    <div className="font-bold text-slate-900 mt-1">Local Key-Value Store</div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-slate-500">Stored Partners</div>
                    <div className="font-bold text-slate-900 mt-1">{registeredPartners.length} Records</div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-slate-500">Audit Logs Stored</div>
                    <div className="font-bold text-slate-900 mt-1">{usageLogs.length} Events</div>
                  </div>
                </div>
              </div>

              {/* Data Export & Backup Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                  <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Download size={16} className="text-amber-600" />
                    <span>Download Fleet Data (JSON Backup)</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Export complete delivery partner profiles, vehicles, bank information, and audit logs into a single structured JSON file.
                  </p>
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2.5 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-extrabold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    DOWNLOAD FLEET BACKUP (.JSON)
                  </button>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                  <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Upload size={16} className="text-sky-600" />
                    <span>Restore Fleet from JSON File</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Restore partner database from an existing exported Feedo fleet backup file.
                  </p>
                  <label className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all">
                    <Upload size={14} />
                    <span>CHOOSE BACKUP FILE (.JSON)</span>
                    <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Reset Database */}
              <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl space-y-2">
                <div className="text-sm font-extrabold text-rose-800 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <span>Reset to Default Demo Fleet</span>
                </div>
                <p className="text-xs text-rose-700">
                  Clears local modifications and re-initializes standard verified and under-review demo delivery partners.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all fleet data to defaults?')) {
                      resetFleetData();
                      setStorageFeedback('Fleet data reset to default demo records.');
                      setTimeout(() => setStorageFeedback(null), 3000);
                    }
                  }}
                  className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Reset Fleet Database
                </button>
              </div>
            </div>
          )}

          {/* TAB: HOME PAGE BANNER MANAGEMENT */}
          {activeTab === 'banners' && (
            <AdminBannerManagement
              onNotify={(msg) => {
                setStorageFeedback(msg);
                setTimeout(() => setStorageFeedback(null), 3500);
              }}
            />
          )}

          {/* TAB: FEEDO PARTNER STORE MANAGEMENT */}
          {activeTab === 'store' && (
            <AdminStoreManagement
              onNotify={(msg) => {
                setStorageFeedback(msg);
                setTimeout(() => setStorageFeedback(null), 3500);
              }}
            />
          )}
        </div>

        {/* MODAL: Inspect Partner */}
        {inspectPartner && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
            <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <img src={inspectPartner.photoUrl} alt={inspectPartner.name} className="w-12 h-12 rounded-full object-cover border-2 border-amber-400" />
                  <div>
                    <div className="text-base font-extrabold text-slate-900">{inspectPartner.name}</div>
                    <div className="text-xs text-slate-500">Partner ID: {inspectPartner.id} • App ID: {inspectPartner.applicationId}</div>
                  </div>
                </div>
                <button onClick={() => setInspectPartner(null)} className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900">
                  <X size={16} />
                </button>
              </div>

              {/* Details sections */}
              <div className="space-y-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                  <div className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider">Personal Information</div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-slate-600">
                    <div>Phone: <span className="font-bold text-slate-900">{inspectPartner.phone}</span></div>
                    <div>Email: <span className="font-bold text-slate-900">{inspectPartner.email}</span></div>
                    <div>City: <span className="font-bold text-slate-900">{inspectPartner.city}</span></div>
                    <div>Zone: <span className="font-bold text-slate-900">{inspectPartner.currentZone}</span></div>
                    <div>Rating: <span className="text-amber-800 font-bold">★ {inspectPartner.rating || 5.0}</span></div>
                    <div>Status: <span className="font-bold text-slate-900">{inspectPartner.accountStatus}</span></div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                  <div className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider">Vehicle Details</div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-slate-600">
                    <div>Type: <span className="font-bold text-slate-900">{inspectPartner.vehicle?.type}</span></div>
                    <div>Model: <span className="font-bold text-slate-900">{inspectPartner.vehicle?.model}</span></div>
                    <div>Reg No: <span className="font-bold text-slate-900 font-mono">{inspectPartner.vehicle?.number}</span></div>
                    <div>RC No: <span className="font-bold text-slate-900 font-mono">{inspectPartner.vehicle?.rcNumber}</span></div>
                    <div>Insurance Valid: <span className="text-emerald-700 font-bold">{inspectPartner.vehicle?.insuranceValidUntil}</span></div>
                    <div>PUC Valid: <span className="font-bold text-slate-900">{inspectPartner.vehicle?.pucValidUntil}</span></div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                  <div className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider">Bank & Settlement</div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-slate-600">
                    <div>Bank: <span className="font-bold text-slate-900">{inspectPartner.bankDetails?.bankName}</span></div>
                    <div>Account: <span className="font-bold text-slate-900 font-mono">{inspectPartner.bankDetails?.accountNumberMasked}</span></div>
                    <div>IFSC: <span className="font-bold text-slate-900 font-mono">{inspectPartner.bankDetails?.ifscCode}</span></div>
                    <div>UPI ID: <span className="font-bold text-emerald-700 font-mono">{inspectPartner.bankDetails?.upiId}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setEditingPartner(inspectPartner);
                    setInspectPartner(null);
                  }}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setInspectPartner(null)}
                  className="px-4 py-2 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-extrabold text-xs cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Edit Partner Form */}
        {editingPartner && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
            <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-extrabold text-sm text-slate-900">Edit Partner: {editingPartner.name}</span>
                <button onClick={() => setEditingPartner(null)} className="text-slate-400 hover:text-slate-900">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEditedPartner} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-500 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editingPartner.name}
                      onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Phone</label>
                    <input
                      type="text"
                      value={editingPartner.phone}
                      onChange={(e) => setEditingPartner({ ...editingPartner, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-500 block mb-1">Zone</label>
                    <input
                      type="text"
                      value={editingPartner.currentZone}
                      onChange={(e) => setEditingPartner({ ...editingPartner, currentZone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Account Status</label>
                    <select
                      value={editingPartner.accountStatus}
                      onChange={(e) => setEditingPartner({ ...editingPartner, accountStatus: e.target.value as AccountStatus })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                    >
                      <option value="APPROVED">APPROVED</option>
                      <option value="UNDER_REVIEW">UNDER REVIEW</option>
                      <option value="DOCUMENTS_PENDING">DOCUMENTS PENDING</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-500 block mb-1">Vehicle Model</label>
                    <input
                      type="text"
                      value={editingPartner.vehicle?.model || ''}
                      onChange={(e) =>
                        setEditingPartner({
                          ...editingPartner,
                          vehicle: { ...editingPartner.vehicle, model: e.target.value },
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Vehicle Plate</label>
                    <input
                      type="text"
                      value={editingPartner.vehicle?.number || ''}
                      onChange={(e) =>
                        setEditingPartner({
                          ...editingPartner,
                          vehicle: { ...editingPartner.vehicle, number: e.target.value },
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingPartner(null)}
                    className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-extrabold flex items-center gap-1.5 shadow-xs"
                  >
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Onboard New Partner */}
        {showAddPartnerModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-extrabold text-sm text-slate-900">Directly Onboard New Delivery Partner</span>
                <button onClick={() => setShowAddPartnerModal(false)} className="text-slate-400 hover:text-slate-900">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreatePartner} className="space-y-3">
                <div>
                  <label className="text-slate-500 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={newPartnerName}
                    onChange={(e) => setNewPartnerName(e.target.value)}
                    placeholder="e.g. Anand Gowda"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-500 block mb-1">Mobile Number</label>
                    <input
                      type="text"
                      value={newPartnerPhone}
                      onChange={(e) => setNewPartnerPhone(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Operational Zone</label>
                    <input
                      type="text"
                      value={newPartnerZone}
                      onChange={(e) => setNewPartnerZone(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-500 block mb-1">Vehicle Type</label>
                    <select
                      value={newPartnerVehicleType}
                      onChange={(e) => setNewPartnerVehicleType(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                    >
                      <option value="Scooter">Scooter</option>
                      <option value="Bike">Bike / Motorcycle</option>
                      <option value="Electric Vehicle">Electric Vehicle</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Vehicle Plate</label>
                    <input
                      type="text"
                      value={newPartnerVehicleNumber}
                      onChange={(e) => setNewPartnerVehicleNumber(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Initial Verification Status</label>
                  <select
                    value={newPartnerStatus}
                    onChange={(e) => setNewPartnerStatus(e.target.value as AccountStatus)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="APPROVED">APPROVED (Active Immediately)</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="DOCUMENTS_PENDING">DOCUMENTS PENDING</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddPartnerModal(false)}
                    className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-extrabold shadow-xs"
                  >
                    Save & Store Partner
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Reject Reason */}
        {rejectionModalPartner && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
            <div className="w-full max-w-sm bg-white border border-rose-200 rounded-3xl p-5 shadow-2xl space-y-3 text-xs">
              <span className="font-extrabold text-sm text-rose-800">Reject Application: {rejectionModalPartner.name}</span>
              <p className="text-slate-500">Specify the exact reason for document verification failure:</p>
              <textarea
                value={customRejectionReason}
                onChange={(e) => setCustomRejectionReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-400"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setRejectionModalPartner(null)}
                  className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    rejectPartnerApplication(rejectionModalPartner.applicationId, customRejectionReason);
                    setRejectionModalPartner(null);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
