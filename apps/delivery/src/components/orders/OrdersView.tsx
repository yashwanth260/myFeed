import React, { useState } from 'react';
import { useDelivery } from '../../context/DeliveryContext';
import { Order, CategoryType } from '../../types';
import { CategoryBadge } from '../common/CategoryBadge';
import { ActiveDeliveryWorkflow } from '../delivery/ActiveDeliveryWorkflow';
import {
  Package,
  Bike,
  Clock,
  MapPin,
  ChevronRight,
  X,
  Phone,
  CheckCircle2,
  Navigation,
  Search,
  Filter,
  Sparkles,
  Calendar,
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const {
    activeOrder,
    ordersHistory,
    gpsState,
    updateDeliveryState,
    verifyPickupCode,
    verifyDeliveryOtp,
    cancelActiveOrder,
    isStoreCodeIncorrect,
    isCustomerOtpIncorrect,
  } = useDelivery();

  const [activeFilterTab, setActiveFilterTab] = useState<'ACTIVE' | 'ALL' | 'COMPLETED' | 'CANCELLED'>(
    activeOrder ? 'ACTIVE' : 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = ordersHistory.filter((order) => {
    if (activeFilterTab === 'COMPLETED' && order.status !== 'COMPLETED') return false;
    if (activeFilterTab === 'CANCELLED' && order.status !== 'CANCELLED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchStore = order.store.name.toLowerCase().includes(q);
      const matchCustomer = order.customer.name.toLowerCase().includes(q);
      if (!matchId && !matchStore && !matchCustomer) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-5 pb-28 md:pb-12 max-w-3xl mx-auto animate-fade-in font-sans">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Orders & Trips</span>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              HISTORY
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active dispatched deliveries and completed trip transaction records.
          </p>
        </div>

        {/* Filter Tab Switcher (Rounded pills inspired by reference) */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white border border-slate-200/80 shadow-xs text-xs font-semibold self-stretch sm:self-auto overflow-x-auto">
          {activeOrder && (
            <button
              onClick={() => setActiveFilterTab('ACTIVE')}
              type="button"
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilterTab === 'ACTIVE'
                  ? 'bg-[#FACC15] text-slate-950 font-black shadow-xs'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Active Trip</span>
            </button>
          )}

          <button
            onClick={() => setActiveFilterTab('ALL')}
            type="button"
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeFilterTab === 'ALL'
                ? 'bg-[#FACC15] text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({ordersHistory.length})
          </button>

          <button
            onClick={() => setActiveFilterTab('COMPLETED')}
            type="button"
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeFilterTab === 'COMPLETED'
                ? 'bg-[#FACC15] text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>

          <button
            onClick={() => setActiveFilterTab('CANCELLED')}
            type="button"
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeFilterTab === 'CANCELLED'
                ? 'bg-[#FACC15] text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Search & Filter Bar (Only shown in history modes) */}
      {activeFilterTab !== 'ACTIVE' && (
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Restaurant, or Customer..."
            className="w-full bg-white border border-slate-200/90 rounded-full pl-11 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 shadow-xs transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Active Trip Workflow Panel */}
      {activeFilterTab === 'ACTIVE' && activeOrder ? (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-amber-400 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center animate-pulse border border-amber-300/80">
                <Navigation size={20} />
              </div>
              <div>
                <div className="text-[10px] font-black text-amber-700 uppercase tracking-wider">
                  Live Dispatched Trip
                </div>
                <div className="text-sm font-black text-slate-900 mt-0.5">
                  Order #{activeOrder.id} • {activeOrder.store.name}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-slate-900">₹{activeOrder.estimatedEarnings}</div>
              <div className="text-[10px] text-slate-400">{activeOrder.totalDistance} km total</div>
            </div>
          </div>

          <ActiveDeliveryWorkflow
            order={activeOrder}
            gpsState={gpsState}
            onUpdateState={updateDeliveryState}
            onVerifyPickup={verifyPickupCode}
            onVerifyOtp={verifyDeliveryOtp}
            onCancelOrder={cancelActiveOrder}
            isStoreCodeError={isStoreCodeIncorrect}
            isOtpError={isCustomerOtpIncorrect}
          />
        </div>
      ) : (
        /* Trip History List */
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
              <Package size={40} className="mx-auto mb-3 opacity-30 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 mb-1">No Orders Found</h3>
              <p className="text-xs">There are no orders matching your selected search query or filter.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-white hover:bg-slate-50/70 border border-slate-100 hover:border-amber-300 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group select-none"
              >
                <div className="flex items-start gap-3.5">
                  <CategoryBadge category={order.category} size="md" showIconOnly />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">{order.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                          order.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                            : 'bg-rose-50 text-rose-700 border-rose-200/80'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">{order.store.name}</h4>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{order.createdAt}</span>
                      <span>•</span>
                      <span>{order.totalDistance} km</span>
                      <span>•</span>
                      <span>{order.itemCount} items</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-100 pt-2.5 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <div className="text-base sm:text-lg font-black text-slate-900">
                      ₹{order.estimatedEarnings}
                    </div>
                    <div className="text-[10px] text-slate-400">{order.zone} Zone</div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 group-hover:text-slate-900 group-hover:bg-white group-hover:border-amber-300 transition-colors shadow-xs">
                    <ChevronRight size={17} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-900">
            <button
              onClick={() => setSelectedOrder(null)}
              type="button"
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-full bg-slate-50 border border-slate-200/80 hover:bg-slate-100 cursor-pointer shadow-xs"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <CategoryBadge category={selectedOrder.category} size="md" />
              <span className="text-sm font-black text-slate-900 font-mono">{selectedOrder.id}</span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mb-4">Trip Receipt Summary</h3>

            {/* Store & Customer Details */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 mb-4 text-xs">
              <div>
                <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-0.5">
                  Pickup Merchant
                </div>
                <div className="text-sm font-bold text-slate-900">{selectedOrder.store.name}</div>
                <div className="text-slate-500">{selectedOrder.store.address}</div>
              </div>

              <div className="border-t border-slate-200 pt-2">
                <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-0.5">
                  Customer Delivery
                </div>
                <div className="text-sm font-bold text-slate-900">{selectedOrder.customer.name}</div>
                <div className="text-slate-500">{selectedOrder.customer.address}</div>
              </div>
            </div>

            {/* Pay Breakdown */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 mb-5 text-xs text-slate-600">
              <div className="flex justify-between font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                <span>Total Partner Earning</span>
                <span className="text-slate-950 text-base font-black">₹{selectedOrder.estimatedEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Delivery Earning</span>
                <span className="text-slate-900 font-bold">
                  ₹{(selectedOrder.earningsBreakdown.deliveryEarning ?? 
                    (selectedOrder.estimatedEarnings - (selectedOrder.earningsBreakdown.tip || 0))).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span className="font-medium">Customer Tip</span>
                <span className="font-bold">
                  {selectedOrder.earningsBreakdown.tip > 0 
                    ? `+₹${selectedOrder.earningsBreakdown.tip.toFixed(2)}` 
                    : '₹0 (No tip)'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              type="button"
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs cursor-pointer shadow-xs"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
