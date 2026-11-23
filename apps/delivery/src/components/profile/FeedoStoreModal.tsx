import React, { useState, useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { FeedoStoreItem } from '../../types';
import { storeService } from '../../services/storeService';

interface FeedoStoreModalProps {
  onClose: () => void;
}

export const FeedoStoreModal: React.FC<FeedoStoreModalProps> = ({ onClose }) => {
  const [items, setItems] = useState<FeedoStoreItem[]>(() => {
    return storeService.getProductsSync().filter((item) => item.isVisible !== false);
  });

  useEffect(() => {
    // Initial fetch from persistent storage
    storeService.getProducts().then((allProducts) => {
      setItems(allProducts.filter((item) => item.isVisible !== false));
    });

    // Subscribe to real-time updates from admin store management
    const unsubscribe = storeService.subscribe((updatedProducts) => {
      setItems(updatedProducts.filter((item) => item.isVisible !== false));
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center">
              <ShoppingBag size={22} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Feedo Partner Store</h2>
              <p className="text-xs text-slate-500">Official rider delivery equipment & apparel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {items.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <ShoppingBag size={36} className="mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No equipment currently available</p>
              <p className="text-xs text-slate-400">Please check back later or contact hub operations.</p>
            </div>
          ) : (
            items.map((item) => {
              const primaryPhoto =
                (item.images && item.images.length > 0 ? item.images[0] : null) || item.imageUrl;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {primaryPhoto && (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white border border-slate-200/80 flex-shrink-0 shadow-xs">
                          <img
                            src={primaryPhoto}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 uppercase">
                          {item.category}
                        </span>
                        <h3 className="text-sm font-extrabold text-slate-900 truncate">{item.name}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 pl-2">
                      <div className="text-lg font-extrabold text-slate-900">₹{item.price}</div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.inStock
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            : 'text-rose-700 bg-rose-50 border border-rose-200'
                        }`}
                      >
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 truncate mr-2">
                      Pick up at {item.pickupHub || 'Indiranagar Partner Hub'}
                    </span>
                    <button
                      type="button"
                      disabled={!item.inStock}
                      className="px-4 py-1.5 rounded-full bg-[#FACC15] hover:bg-[#EAB308] disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 font-extrabold text-xs shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                    >
                      Collect at Hub
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
