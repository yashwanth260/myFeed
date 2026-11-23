import React, { useState, useEffect, useRef } from 'react';
import { FeedoStoreItem } from '../../types';
import { storeService, STORE_CATEGORIES, STORE_PICKUP_HUBS } from '../../services/storeService';
import {
  ShoppingBag,
  Plus,
  Search,
  Edit3,
  Trash2,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Package,
  MapPin,
  Image as ImageIcon,
  Save,
  X,
} from 'lucide-react';

interface AdminStoreManagementProps {
  onNotify?: (message: string) => void;
}

export const AdminStoreManagement: React.FC<AdminStoreManagementProps> = ({ onNotify }) => {
  const [products, setProducts] = useState<FeedoStoreItem[]>(() => storeService.getProductsSync());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Modals
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<FeedoStoreItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<FeedoStoreItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Official Gear');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formPrice, setFormPrice] = useState<number | string>(499);
  const [formInStock, setFormInStock] = useState<boolean>(true);
  const [formPickupHub, setFormPickupHub] = useState<string>('Indiranagar Partner Hub');
  const [formIsVisible, setFormIsVisible] = useState<boolean>(true);
  const [formImages, setFormImages] = useState<string[]>([]);

  // Direct Device Upload States
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);
  const [replaceTargetIndex, setReplaceTargetIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    storeService.getProducts().then(setProducts);
    const unsub = storeService.subscribe(setProducts);
    return () => unsub();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Official Gear');
    setFormDescription('');
    setFormPrice(499);
    setFormInStock(true);
    setFormPickupHub('Indiranagar Partner Hub');
    setFormIsVisible(true);
    setFormImages([]);
    setUploadErrorMsg(null);
    setUploadSuccessMsg(null);
    setReplaceTargetIndex(null);
    setShowProductModal(true);
  };

  const handleOpenEdit = (prod: FeedoStoreItem) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormDescription(prod.description);
    setFormPrice(prod.price);
    setFormInStock(prod.inStock);
    setFormPickupHub(prod.pickupHub || 'Indiranagar Partner Hub');
    setFormIsVisible(prod.isVisible !== false);
    setFormImages(
      prod.images && prod.images.length > 0
        ? [...prod.images]
        : prod.imageUrl
        ? [prod.imageUrl]
        : []
    );
    setUploadErrorMsg(null);
    setUploadSuccessMsg(null);
    setReplaceTargetIndex(null);
    setShowProductModal(true);
  };

  const handleTriggerUpload = () => {
    setReplaceTargetIndex(null);
    fileInputRef.current?.click();
  };

  const handleTriggerReplace = (idx: number) => {
    setReplaceTargetIndex(idx);
    fileInputRef.current?.click();
  };

  const handleDeviceFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    setUploadProgress(15);
    setUploadErrorMsg(null);
    setUploadSuccessMsg(null);

    try {
      const newUrls: string[] = [];
      const total = files.length;

      for (let i = 0; i < total; i++) {
        const file = files[i];
        const res = await storeService.uploadProductPhoto(file, (pct) => {
          const overall = Math.round(((i + pct / 100) / total) * 100);
          setUploadProgress(overall);
        });
        newUrls.push(res.url);
      }

      setUploadProgress(100);

      if (replaceTargetIndex !== null && replaceTargetIndex >= 0 && newUrls.length > 0) {
        setFormImages((prev) => {
          const next = [...prev];
          next[replaceTargetIndex] = newUrls[0];
          return next;
        });
        setUploadSuccessMsg('Photo replaced successfully from device.');
        setReplaceTargetIndex(null);
      } else {
        setFormImages((prev) => [...prev, ...newUrls]);
        setUploadSuccessMsg(
          `${newUrls.length} photo${newUrls.length > 1 ? 's' : ''} uploaded directly from device successfully!`
        );
      }

      setTimeout(() => setUploadSuccessMsg(null), 3500);
    } catch (err: any) {
      setUploadErrorMsg(err.message || 'Direct photo upload failed. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSetPrimary = (idx: number) => {
    setFormImages((prev) => {
      const target = prev[idx];
      const rest = prev.filter((_, i) => i !== idx);
      return [target, ...rest];
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setUploadErrorMsg('Please enter a product name.');
      return;
    }
    const numPrice = Number(formPrice);
    if (isNaN(numPrice) || numPrice < 0) {
      setUploadErrorMsg('Please enter a valid price in ₹.');
      return;
    }

    try {
      const productPayload: FeedoStoreItem = {
        id: editingProduct ? editingProduct.id : `store-${Date.now()}`,
        name: formName.trim(),
        category: formCategory.trim() || 'Official Gear',
        description: formDescription.trim(),
        price: numPrice,
        inStock: formInStock,
        pickupHub: formPickupHub.trim() || 'Indiranagar Partner Hub',
        isVisible: formIsVisible,
        images: formImages,
        imageUrl: formImages.length > 0 ? formImages[0] : undefined,
        createdAt: editingProduct?.createdAt,
      };

      await storeService.saveProduct(productPayload);
      setShowProductModal(false);
      const msg = editingProduct
        ? `Product "${formName}" updated successfully in Feedo Partner Store.`
        : `New product "${formName}" added successfully to Feedo Partner Store.`;
      onNotify?.(msg);
    } catch (err: any) {
      setUploadErrorMsg(err.message || 'Failed to save product. Please try again.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      await storeService.deleteProduct(deletingProduct.id);
      onNotify?.(`Product "${deletingProduct.name}" removed from Feedo Partner Store.`);
      setDeletingProduct(null);
    } catch {
      onNotify?.('Failed to delete product. Please try again.');
    }
  };

  const handleToggleStock = async (prod: FeedoStoreItem) => {
    const updated = await storeService.saveProduct({
      ...prod,
      inStock: !prod.inStock,
    });
    onNotify?.(`Product "${prod.name}" marked ${updated.inStock ? 'In Stock' : 'Out of Stock'}.`);
  };

  const handleToggleVisibility = async (prod: FeedoStoreItem) => {
    const nextVis = prod.isVisible === false ? true : false;
    await storeService.saveProduct({
      ...prod,
      isVisible: nextVis,
    });
    onNotify?.(
      `Product "${prod.name}" is now ${nextVis ? 'Visible in mobile app' : 'Hidden from mobile app'}.`
    );
  };

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
    if (stockFilter === 'IN_STOCK' && !p.inStock) return false;
    if (stockFilter === 'OUT_OF_STOCK' && p.inStock) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.pickupHub && p.pickupHub.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* Top Store Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Products</span>
            <Package size={16} className="text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">{products.length}</div>
          <div className="text-[10px] text-slate-400">Rider gear & official merchandise</div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>In Stock</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600">
            {products.filter((p) => p.inStock).length}
          </div>
          <div className="text-[10px] text-slate-400">Available for partner collection</div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Out of Stock</span>
            <AlertTriangle size={16} className="text-rose-500" />
          </div>
          <div className="text-xl font-extrabold text-rose-600">
            {products.filter((p) => !p.inStock).length}
          </div>
          <div className="text-[10px] text-slate-400">Pending hub replenishment</div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Visible in App</span>
            <Eye size={16} className="text-sky-500" />
          </div>
          <div className="text-xl font-extrabold text-sky-600">
            {products.filter((p) => p.isVisible !== false).length}
          </div>
          <div className="text-[10px] text-slate-400">Displayed in Feedo Partner Store</div>
        </div>
      </div>

      {/* Action and Filter Controls */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto flex-1">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name, hub..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {STORE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Stock</option>
            <option value="IN_STOCK">In Stock Only</option>
            <option value="OUT_OF_STOCK">Out of Stock Only</option>
          </select>
        </div>

        {/* Primary Add Product Button */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all flex-shrink-0"
        >
          <Plus size={15} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Product Photo</th>
                <th className="py-3 px-4">Product Name & Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4">Pickup Hub</th>
                <th className="py-3 px-4">Visibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ShoppingBag size={32} className="mx-auto mb-2 text-slate-300" />
                    <div className="font-bold text-slate-600">No store products match your criteria</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Try resetting filters or click "Add Product".
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const photos =
                    prod.images && prod.images.length > 0
                      ? prod.images
                      : prod.imageUrl
                      ? [prod.imageUrl]
                      : [];
                  const primaryPhoto = photos.length > 0 ? photos[0] : null;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Photo thumbnail with photo count */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="relative w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {primaryPhoto ? (
                            <img
                              src={primaryPhoto}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={22} className="text-slate-400" />
                          )}
                          {photos.length > 1 && (
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full bg-slate-900/80 text-white font-extrabold text-[9px] shadow-xs">
                              +{photos.length - 1}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Name & Category */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wide border border-slate-200/60">
                              {prod.category}
                            </span>
                          </div>
                          <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            {prod.name}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {prod.description}
                          </p>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="font-extrabold text-sm text-slate-900">₹{prod.price}</div>
                        <span className="text-[10px] text-slate-400">Fixed MRP</span>
                      </td>

                      {/* Stock status (toggleable) */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStock(prod)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            prod.inStock
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                          }`}
                          title="Click to toggle stock status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              prod.inStock ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                          <span>{prod.inStock ? 'In Stock' : 'Out of Stock'}</span>
                        </button>
                      </td>

                      {/* Pickup Hub */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-1.5 text-slate-700 text-xs font-medium">
                          <MapPin size={13} className="text-amber-600 flex-shrink-0" />
                          <span>{prod.pickupHub || 'Indiranagar Partner Hub'}</span>
                        </div>
                      </td>

                      {/* Visibility */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(prod)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            prod.isVisible !== false
                              ? 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
                              : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                          }`}
                          title="Click to toggle store visibility"
                        >
                          {prod.isVisible !== false ? (
                            <>
                              <Eye size={12} className="text-sky-600" />
                              <span>Visible</span>
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} className="text-slate-500" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Edit Product Details & Photos"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProduct(prod)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add / Edit Store Product */}
      {showProductModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingProduct ? 'Edit Store Product' : 'Add New Store Product'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Direct device photo upload, inventory pricing & pickup hub configuration
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* 1. DIRECT PRODUCT PHOTO UPLOAD SECTION */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                      <ImageIcon size={15} className="text-amber-600" />
                      <span>PRODUCT PHOTOS (DIRECT DEVICE UPLOAD)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload directly from your device file picker or gallery. Supported formats: JPG, JPEG,
                      PNG, WebP (Max 10MB).
                    </p>
                  </div>

                  {/* Hidden input for device files */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={replaceTargetIndex === null}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleDeviceFilesSelected}
                    className="hidden"
                  />

                  {/* Direct Upload Button */}
                  <button
                    type="button"
                    onClick={handleTriggerUpload}
                    disabled={isUploadingPhoto}
                    className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:bg-slate-400 flex-shrink-0"
                  >
                    <Upload size={14} className="text-amber-400" />
                    <span>Upload Product Photos</span>
                  </button>
                </div>

                {/* Upload Progress Bar */}
                {isUploadingPhoto && (
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                      <span>Uploading device photo{replaceTargetIndex !== null ? ' (replacing)' : 's'}...</span>
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

                {/* Feedback Messages */}
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

                {/* Photos Grid Previews */}
                {formImages.length === 0 ? (
                  <div
                    onClick={handleTriggerUpload}
                    className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-100/70 transition-colors cursor-pointer space-y-1.5"
                  >
                    <ImageIcon size={32} className="mx-auto text-slate-400" />
                    <div className="font-extrabold text-slate-700 text-xs">No product photos uploaded yet</div>
                    <p className="text-[11px] text-slate-400">
                      Click "Upload Product Photos" or click here to select photos directly from your device.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {formImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white aspect-square shadow-xs"
                      >
                        <img src={imgUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#FACC15] text-slate-950 font-extrabold text-[9px] shadow-xs">
                            Primary Photo
                          </span>
                        )}

                        {/* Hover action overlay */}
                        <div className="absolute inset-0 bg-slate-900/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(idx)}
                              className="w-full py-1 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] transition-colors cursor-pointer"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleTriggerReplace(idx)}
                            className="w-full py-1 rounded-md bg-white hover:bg-slate-100 text-slate-900 font-bold text-[10px] transition-colors cursor-pointer"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="w-full py-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. PRODUCT DETAILS SECTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Product Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Feedo Insulated Delivery Backpack (Thermal 45L)"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {STORE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Price in ₹ *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-extrabold text-slate-500 text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Stock Status */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Stock Status *
                  </label>
                  <select
                    value={formInStock ? 'true' : 'false'}
                    onChange={(e) => setFormInStock(e.target.value === 'true')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="true">In Stock (Available for partners)</option>
                    <option value="false">Out of Stock (Temporarily unavailable)</option>
                  </select>
                </div>

                {/* Pickup Hub Location */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Pickup Hub Location *
                  </label>
                  <select
                    value={formPickupHub}
                    onChange={(e) => setFormPickupHub(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {STORE_PICKUP_HUBS.map((hub) => (
                      <option key={hub} value={hub}>
                        {hub}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Visibility */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Store Visibility (Show / Hide) *
                  </label>
                  <select
                    value={formIsVisible ? 'true' : 'false'}
                    onChange={(e) => setFormIsVisible(e.target.value === 'true')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="true">Visible — Show in Feedo Delivery Partner Store</option>
                    <option value="false">Hidden — Do not display in mobile store</option>
                  </select>
                </div>

                {/* Description */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Product Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter specifications, material, insulation details, warranty, or partner instructions..."
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
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-extrabold text-xs shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>{editingProduct ? 'Update Product' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Product Confirmation */}
      {deletingProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
          <div className="w-full max-w-sm bg-white border border-rose-200 rounded-3xl p-5 shadow-2xl space-y-3 text-xs">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-rose-900">Delete Store Product?</h4>
              <p className="text-slate-500 mt-1">
                Are you sure you want to delete{' '}
                <span className="font-bold text-slate-900">"{deletingProduct.name}"</span>?
              </p>
              <p className="text-rose-600 text-[11px] mt-1">
                This action cannot be undone and will remove the product from the Feedo Partner Store.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

