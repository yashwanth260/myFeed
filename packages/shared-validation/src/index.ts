import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Valid 10-digit phone number required').max(15),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'restaurant_owner', 'delivery_partner']).default('customer'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const addressSchema = z.object({
  title: z.string().min(1, 'Address label required (e.g. Home, Work)'),
  fullAddress: z.string().min(5, 'Full street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(5, 'Postal code is required'),
  deliveryInstructions: z.string().optional(),
  isDefault: z.boolean().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const selectedCustomizationSchema = z.object({
  group_id: z.string().uuid(),
  group_name: z.string(),
  option_id: z.string().uuid(),
  option_name: z.string(),
  price_paise: z.number().int().min(0),
});

export const addToCartSchema = z.object({
  menu_item_id: z.string().uuid(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  customizations: z.array(selectedCustomizationSchema).default([]),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

export const createOrderSchema = z.object({
  restaurant_id: z.string().uuid(),
  address_id: z.string().uuid(),
  payment_method: z.enum(['razorpay', 'cod']),
  coupon_code: z.string().optional(),
  delivery_instructions: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  order_id: z.string().uuid(),
  new_status: z.enum([
    'pending',
    'confirmed',
    'preparing',
    'ready_for_pickup',
    'picked_up',
    'out_for_delivery',
    'delivered',
    'rejected',
    'cancelled',
    'payment_failed',
  ]),
  reason: z.string().optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const menuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description required'),
  price_paise: z.number().int().min(100, 'Price must be at least 100 paise (₹1)'),
  category_id: z.string().uuid('Category required'),
  image_url: z.string().url('Valid image URL required'),
  dietary_type: z.enum(['veg', 'non_veg', 'egg']),
  is_available: z.boolean().default(true),
  is_recommended: z.boolean().default(false),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;

export const reviewSchema = z.object({
  order_id: z.string().uuid(),
  restaurant_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
