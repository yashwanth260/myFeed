export const APP_NAME = 'CraveCart';

export const ORDER_STATUS_CONFIG = {
  pending: { label: 'Order Placed', color: '#F59E0B', bgColor: '#FEF3C7' },
  confirmed: { label: 'Accepted by Restaurant', color: '#3B82F6', bgColor: '#DBEAFE' },
  preparing: { label: 'Preparing Food', color: '#8B5CF6', bgColor: '#EDE9FE' },
  ready_for_pickup: { label: 'Ready for Pickup', color: '#10B981', bgColor: '#D1FAE5' },
  picked_up: { label: 'Picked Up', color: '#06B6D4', bgColor: '#CFFAFE' },
  out_for_delivery: { label: 'Out for Delivery', color: '#6366F1', bgColor: '#E0E7FF' },
  delivered: { label: 'Delivered', color: '#16A34A', bgColor: '#DCFCE7' },
  rejected: { label: 'Rejected by Restaurant', color: '#EF4444', bgColor: '#FEE2E2' },
  cancelled: { label: 'Cancelled', color: '#6B7280', bgColor: '#F3F4F6' },
  payment_failed: { label: 'Payment Failed', color: '#DC2626', bgColor: '#FEE2E2' },
} as const;

export const DEFAULT_CURRENCY = 'INR';
export const DEFAULT_CURRENCY_SYMBOL = '₹';

export const APP_IDENTIFIERS = {
  customer: 'com.cravecart.customer',
  restaurant: 'com.cravecart.restaurant',
  delivery: 'com.cravecart.delivery',
} as const;

export function getSupabaseConfig() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://demo-cravecart.supabase.co';
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key';
  return { url, anonKey };
}

export function getRazorpayKeyId() {
  return process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_demo123456';
}
