export type UserRoleType =
  | 'customer'
  | 'restaurant_owner'
  | 'restaurant_staff'
  | 'delivery_partner'
  | 'admin';

export type AccountStatus = 'active' | 'suspended' | 'pending_approval';

export interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  avatar_url?: string | null;
  account_status: AccountStatus;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: UserRoleType;
  assignment_metadata?: Record<string, unknown> | null;
  created_at: string;
}

export type RestaurantMemberRole = 'owner' | 'manager' | 'staff';

export interface RestaurantMember {
  id: string;
  restaurant_id: string;
  user_id: string;
  membership_role: RestaurantMemberRole;
  membership_status: 'active' | 'inactive';
  created_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  banner_url: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude?: number | null;
  longitude?: number | null;
  cuisine_types: string[];
  opening_time: string;
  closing_time: string;
  is_approved: boolean;
  is_active: boolean;
  is_open: boolean;
  min_order_amount_paise: number;
  base_delivery_fee_paise: number;
  free_delivery_threshold_paise?: number | null;
  estimated_prep_time_minutes: number;
  rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export type DietaryType = 'veg' | 'non_veg' | 'egg';

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price_paise: number;
  image_url: string;
  dietary_type: DietaryType;
  is_available: boolean;
  is_recommended: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ItemCustomizationOption {
  id: string;
  group_id: string;
  name: string;
  price_paise: number;
  is_available: boolean;
  created_at: string;
}

export interface ItemCustomizationGroup {
  id: string;
  menu_item_id: string;
  name: string;
  min_select: number;
  max_select: number;
  is_required: boolean;
  options?: ItemCustomizationOption[];
  created_at: string;
}

export interface Address {
  id: string;
  customer_id: string;
  title: string; // e.g. Home, Work, Other
  full_address: string;
  city: string;
  state: string;
  postal_code: string;
  delivery_instructions?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface SelectedCustomization {
  group_id: string;
  group_name: string;
  option_id: string;
  option_name: string;
  price_paise: number;
}

export interface CartItem {
  id: string;
  cart_id: string;
  menu_item_id: string;
  menu_item?: MenuItem;
  quantity: number;
  customizations: SelectedCustomization[];
  unit_price_paise: number;
  line_total_paise: number;
  created_at: string;
}

export interface Cart {
  id: string;
  customer_id: string;
  restaurant_id: string | null;
  restaurant?: Restaurant | null;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'rejected'
  | 'cancelled'
  | 'payment_failed';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export type PaymentMethod = 'razorpay' | 'cod';

export interface OrderItemSnapshot {
  menu_item_id: string;
  name: string;
  unit_price_paise: number;
  quantity: number;
  customizations: SelectedCustomization[];
  line_total_paise: number;
}

export interface AddressSnapshot {
  full_address: string;
  city: string;
  state: string;
  postal_code: string;
  delivery_instructions?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_profile?: Profile;
  restaurant_id: string;
  restaurant?: Restaurant;
  address_snapshot: AddressSnapshot;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  subtotal_paise: number;
  discount_paise: number;
  delivery_fee_paise: number;
  service_fee_paise: number;
  tax_paise: number;
  final_total_paise: number;
  coupon_code?: string | null;
  rejection_reason?: string | null;
  cancellation_reason?: string | null;
  estimated_delivery_time?: string | null;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  unit_price_paise: number;
  quantity: number;
  customization_snapshot: SelectedCustomization[];
  line_total_paise: number;
  created_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  previous_status: OrderStatus | null;
  new_status: OrderStatus;
  actor_id: string;
  reason?: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: 'razorpay' | 'cod';
  provider_reference?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  amount_paise: number;
  currency: string;
  payment_status: PaymentStatus;
  verification_metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'flat' | 'percentage';
  discount_value: number; // Paise for flat, percentage integer (e.g. 20 for 20%)
  max_discount_paise?: number | null;
  min_order_amount_paise: number;
  valid_from: string;
  valid_until: string;
  usage_limit_per_user: number;
  total_usage_limit?: number | null;
  is_active: boolean;
  created_at: string;
}

export interface CouponRedemption {
  id: string;
  coupon_id: string;
  customer_id: string;
  order_id: string;
  discount_applied_paise: number;
  created_at: string;
}

export type DeliveryAssignmentStatus =
  | 'offered'
  | 'accepted'
  | 'picked_up'
  | 'completed'
  | 'rejected';

export interface DeliveryAssignment {
  id: string;
  order_id: string;
  order?: Order;
  delivery_partner_id: string;
  delivery_partner_profile?: Profile;
  assignment_status: DeliveryAssignmentStatus;
  offered_at: string;
  accepted_at?: string | null;
  picked_up_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryLocation {
  id: string;
  delivery_partner_id: string;
  order_id: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order_update' | 'delivery_assigned' | 'payment_status' | 'general';
  data?: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  customer_id: string;
  restaurant_id: string;
  rating: number; // 1-5
  comment?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  target_table: string;
  target_id: string;
  details?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
}

export interface PricingCalculationResult {
  subtotal_paise: number;
  discount_paise: number;
  delivery_fee_paise: number;
  service_fee_paise: number;
  tax_paise: number;
  final_total_paise: number;
  coupon_applied?: {
    code: string;
    discount_paise: number;
  } | null;
}
