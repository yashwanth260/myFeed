import React, { useState, useEffect, useRef } from 'react';
import {
  bannerService,
  BannerItemData,
  INITIAL_FIVE_BANNERS,
} from '../../services/bannerService';
import {
  LayoutGrid,
  Edit3,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Save,
  X,
  Sparkles,
  ShieldCheck,
  Wrench,
  Package,
  HeartPulse,
  Users,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface AdminBannerManagementProps {
  onNotify?: (message: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  ShieldCheck,
  Wrench,
  Package,
  HeartPulse,
  Users,
};

export const AdminBannerManagement: React.FC<AdminBannerManagementProps> = ({ onNotify }) => {
  const [banners, setBanners] = useState<BannerItemData[]>(() => bannerService.getBannersSync());
  const [editingBanner, setEditingBanner] = useState<BannerItemData | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formBadge, setFormBadge] = useState<string>('');
  const [formCtaText, setFormCtaText] = useState<string>('');
  const [formActionDest, setFormActionDest] = useState<'care' | 'help' | 'store' | 'orders' | 'profile'>('care');
  const [formImageUrl, setFormImageUrl] = useState<string | undefined>(undefined);
  const [formIsVisible, setFormIsVisible] = useState<boolean>(true);

  // Direct Device Upload State
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bannerService.getBanners().then(setBanners);
    const unsub = bannerService.subscribe(setBanners);
    return () => unsub();
  }, []);

  const handleOpenEdit = (b: BannerItemData) => {
    setEditingBanner(b);
    setFormTitle(b.title);
    setFormDescription(b.description);
    setFormBadge(b.badge);
    setFormCtaText(b.ctaText);
    setFormActionDest(b.actionDestination || 'care');
    setFormImageUrl(b.imageUrl);
    setFormIsVisible(b.isVisible !== false);
    setUploadErrorMsg(null);
    setUploadSuccessMsg(null);
    setShowModal(true);
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDeviceFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(20);
    setUploadErrorMsg(null);
    setUploadSuccessMsg(null);

    try {
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type.toLowerCase())) {
        throw new Error(`File "${file.name}" has unsupported format. Supported formats: JPG, JPEG, PNG, WebP.`);
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`File "${file.name}" exceeds 10 MB limit.`);
      }

      const res = await bannerService.uploadBannerImage(file, (pct) => {
        setUploadProgress(pct);
      });

      setFormImageUrl(res.url);
      setUploadSuccessMsg('Banner image uploaded directly from device successfully!');
      setTimeout(() => setUploadSuccessMsg(null), 3500);
    } catch (err: any) {
      setUploadErrorMsg(err.message || 'Direct banner image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setFormImageUrl(undefined);
    setUploadSuccessMsg('Banner image removed. Original illustration will be displayed.');
    setTimeout(() => setUploadSuccessMsg(null), 3000);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    if (!formTitle.trim()) {
      setUploadErrorMsg('Please enter a banner title.');
      return;
    }

    try {
      const updated: BannerItemData = {
        ...editingBanner,
        title: formTitle.trim(),
        description: formDescription.trim(),
        badge: formBadge.trim() || editingBanner.badge,
        ctaText: formCtaText.trim() || editingBanner.ctaText,
        actionDestination: formActionDest,
        imageUrl: formImageUrl,
        isVisible: formIsVisible,
      };

      await bannerService.saveBanner(updated);
      setShowModal(false);
      onNotify?.(`Banner "${editingBanner.title}" updated and synced with partner app.`);
    } catch (err: any) {
      setUploadErrorMsg(err.message || 'Failed to save banner. Please try again.');
    }
  };

  const handleToggleVisibility = async (b: BannerItemData) => {
    const nextVis = b.isVisible !== false ? false : true;
    await bannerService.saveBanner({
      ...b,
      isVisible: nextVis,
    });
    onNotify?.(
      `Banner "${b.title}" is now ${nextVis ? 'Visible in mobile carousel' : 'Hidden from mobile carousel'}.`
    );
  };

  const handleResetAllToDefaults = async () => {
    if (confirm('Reset all 5 home page banners to original default content and illustrations?')) {
      await bannerService.resetToDefaults();
      onNotify?.('All 5 home page banners reset to defaults.');
    }
  };

  const IconComp = editingBanner ? ICON_MAP[editingBanner.iconName] || ShieldCheck : ShieldCheck;

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* Top Banner Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Banners</span>
            <LayoutGrid size={16} className="text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">5</div>
          <div className="text-[10px] text-slate-400">Fixed 5-banner carousel layout</div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Active in App</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600">
            {banners.filter((b) => b.isVisible !== false).length} / 5
          </div>
          <div className="text-[10px] text-slate-400">Currently visible to delivery partners</div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Device Photos Uploaded</span>
            <ImageIcon size={16} className="text-sky-500" />
          </div>
          <div className="text-xl font-extrabold text-sky-600">
            {banners.filter((b) => !!b.imageUrl).length}
          </div>
          <div className="text-[10px] text-slate-400">Custom admin device photos</div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Auto-Rotate Pace</span>
            <Sparkles size={16} className="text-purple-500" />
          </div>
          <div className="text-xl font-extrabold text-purple-600">6.0s</div>
          <div className="text-[10px] text-slate-400">Swipe & pagination enabled</div>
        </div>
      </div>

      {/* Header Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-slate-900 tracking-tight">
              Home Page Banner Management
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
              5 Banners
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Select any banner to edit text, actions, visibility, or upload direct photos from your device.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetAllToDefaults}
          className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs flex-shrink-0"
          title="Restore default 5 banners"
        >
          <RotateCcw size={13} />
          <span>Reset to Defaults</span>
        </button>
      </div>

      {/* Five Banners List Cards */}
      <div className="space-y-3">
        {banners.map((banner, index) => {
          const Icon = ICON_MAP[banner.iconName] || ShieldCheck;
          const isVisible = banner.isVisible !== false;

          return (
            <div
              key={banner.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all bg-white shadow-xs ${
                isVisible ? 'border-slate-200/80 hover:border-amber-300' : 'border-slate-200 opacity-75 bg-slate-50/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Left: Thumbnail & Banner Identity */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  {/* Photo Thumbnail or Default Icon Box */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-xs">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ color: banner.accentColor }}
                      >
                        <Icon size={28} />
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-900/85 text-white font-mono font-bold text-[9px]">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Text Details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 uppercase tracking-wide border border-slate-200">
                        Banner {index + 1}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${banner.tagColor}`}
                      >
                        {banner.badge}
                      </span>
                      {banner.imageUrl && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                          Custom Photo
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                      {banner.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {banner.description}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-600 font-medium">
                      <span>Button: <strong className="text-slate-900">{banner.ctaText}</strong></span>
                      <span>•</span>
                      <span>Target: <strong className="text-amber-800 uppercase text-[10px]">{banner.actionDestination || 'care'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {/* Visibility Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(banner)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isVisible
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                    }`}
                    title="Toggle carousel visibility"
                  >
                    {isVisible ? (
                      <>
                        <Eye size={13} className="text-emerald-600" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={13} className="text-slate-500" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  {/* Edit Banner Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(banner)}
                    className="px-4 py-1.5 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-extrabold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit3 size={13} />
                    <span>Edit Banner</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Edit Banner Details & Direct Device Photo Upload */}
      {showModal && editingBanner && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <LayoutGrid size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Edit {editingBanner.id.toUpperCase().replace('-', ' ')}: {editingBanner.badge}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Direct device photo upload, title, description, and mobile destination
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* LIVE PREVIEW OF THE BANNER BEFORE SAVING */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500" />
                <span>Live Banner Carousel Preview (Before Saving)</span>
              </div>
              <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm bg-white select-none">
                <div
                  className={`w-full bg-gradient-to-br ${editingBanner.illustrationBg} p-5 sm:p-6 min-h-[160px] flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-xs ${editingBanner.tagColor}`}
                    >
                      <Sparkles size={11} />
                      <span>{formBadge || editingBanner.badge}</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-400">PREVIEW</span>
                  </div>

                  <div className="flex items-center justify-between gap-4 my-2">
                    <div className="space-y-1 max-w-sm sm:max-w-md">
                      <h4 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                        {formTitle || 'Banner Title'}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                        {formDescription || 'Banner description will appear here...'}
                      </p>
                    </div>

                    {formImageUrl ? (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border-2 border-white bg-white">
                        <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs border border-white/90 bg-white"
                        style={{ color: editingBanner.accentColor }}
                      >
                        <IconComp size={24} />
                      </div>
                    )}
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs font-black text-slate-900">
                      <span className="underline underline-offset-4 decoration-amber-400">
                        {formCtaText || 'Learn More'}
                      </span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSaveBanner} className="space-y-4">
              {/* 1. DIRECT DEVICE BANNER IMAGE UPLOAD */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                      <ImageIcon size={15} className="text-amber-600" />
                      <span>BANNER IMAGE (DIRECT DEVICE UPLOAD ONLY)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload directly from your device file picker or gallery. Supported formats: JPG, JPEG, PNG, WebP (Max 10MB).
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleDeviceFileSelected}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={handleTriggerUpload}
                    disabled={isUploading}
                    className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:bg-slate-400 flex-shrink-0"
                  >
                    <Upload size={14} className="text-amber-400" />
                    <span>Upload Banner Image</span>
                  </button>
                </div>

                {/* Progress bar */}
                {isUploading && (
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                      <span>Uploading device image...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-[#FACC15] transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Success / Error Alerts */}
                {uploadSuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                    <span>{uploadSuccessMsg}</span>
                  </div>
                )}
                {uploadErrorMsg && (
                  <div className="bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                    <AlertTriangle size={15} className="text-rose-600 flex-shrink-0" />
                    <span>{uploadErrorMsg}</span>
                  </div>
                )}

                {/* Image Preview & Replacement Box */}
                {formImageUrl ? (
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                        <img src={formImageUrl} alt="Uploaded Banner" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs">Device Photo Active</div>
                        <p className="text-[11px] text-slate-500">
                          This photo is currently set to display inside this carousel card.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={handleTriggerUpload}
                        className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Replace Image
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={handleTriggerUpload}
                    className="border-2 border-dashed border-slate-300 rounded-2xl p-5 text-center hover:bg-slate-100/70 transition-colors cursor-pointer space-y-1"
                  >
                    <ImageIcon size={28} className="mx-auto text-slate-400" />
                    <div className="font-bold text-slate-700 text-xs">No custom photo uploaded</div>
                    <p className="text-[11px] text-slate-400">
                      Click "Upload Banner Image" or click here to upload directly from your device.
                    </p>
                  </div>
                )}
              </div>

              {/* 2. BANNER DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Title */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Banner Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Badge Category */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Badge Category
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Button Text */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Button Text (CTA) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCtaText}
                    onChange={(e) => setFormCtaText(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Action / Destination */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Banner Action / Destination *
                  </label>
                  <select
                    value={formActionDest}
                    onChange={(e) => setFormActionDest(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="care">Customer Care & On-Road SOS</option>
                    <option value="help">Help & Fleet Network Support</option>
                    <option value="store">Feedo Partner Store Gear</option>
                    <option value="profile">Partner Profile & Insurance Details</option>
                    <option value="orders">Orders & Route Trips</option>
                  </select>
                </div>

                {/* Visibility */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Carousel Visibility *
                  </label>
                  <select
                    value={formIsVisible ? 'true' : 'false'}
                    onChange={(e) => setFormIsVisible(e.target.value === 'true')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="true">Visible — Show in mobile home carousel</option>
                    <option value="false">Hidden — Temporarily disable from carousel</option>
                  </select>
                </div>

                {/* Description */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Banner Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-extrabold text-xs shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

