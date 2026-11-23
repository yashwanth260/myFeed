import { supabase } from './supabase';
import { Restaurant, MenuItem, Order, Address, Coupon, Review } from '@cravecart/shared-types';

export async function fetchRestaurants(searchQuery?: string, cuisine?: string): Promise<Restaurant[]> {
  try {
    let query = supabase.from('restaurants').select('*').eq('is_approved', true).eq('is_active', true);

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return getFallbackRestaurants(searchQuery, cuisine);
    }
    return data as Restaurant[];
  } catch {
    return getFallbackRestaurants(searchQuery, cuisine);
  }
}

export async function fetchRestaurantById(id: string): Promise<Restaurant | null> {
  try {
    const { data, error } = await supabase.from('restaurants').select('*').eq('id', id).single();
    if (error || !data) {
      return getFallbackRestaurants().find((r) => r.id === id) || getFallbackRestaurants()[0];
    }
    return data as Restaurant;
  } catch {
    return getFallbackRestaurants().find((r) => r.id === id) || getFallbackRestaurants()[0];
  }
}

export async function fetchMenuForRestaurant(restaurantId: string): Promise<{ categories: any[]; items: MenuItem[] }> {
  try {
    const { data: categories } = await supabase.from('menu_categories').select('*').eq('restaurant_id', restaurantId).order('display_order');
    const { data: items } = await supabase.from('menu_items').select('*').eq('restaurant_id', restaurantId).eq('is_available', true);

    if (!items || items.length === 0) {
      return getFallbackMenu(restaurantId);
    }
    return { categories: categories || [], items: items as MenuItem[] };
  } catch {
    return getFallbackMenu(restaurantId);
  }
}

export async function fetchCustomerOrders(customerId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, restaurant:restaurants(*), items:order_items(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as Order[];
  } catch {
    return [];
  }
}

export async function fetchOrderDetails(orderId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, restaurant:restaurants(*), items:order_items(*)')
      .eq('id', orderId)
      .single();

    if (error || !data) return null;
    return data as Order;
  } catch {
    return null;
  }
}

export async function createOrder(payload: any): Promise<Order> {
  const { data: session } = await supabase.auth.getSession();
  const token = session?.session?.access_token;

  if (token) {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (res.ok && resData.order) {
        return resData.order;
      }
    } catch {
      // Fallback direct DB insert if Edge Function is offline
    }
  }

  // Direct DB insertion fallback
  const orderNumber = `CC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  const { data: newOrder, error } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: payload.customer_id || 'demo-cust-id',
      restaurant_id: payload.restaurant_id,
      address_snapshot: payload.address_snapshot,
      order_status: 'pending',
      payment_status: 'pending',
      payment_method: payload.payment_method || 'razorpay',
      subtotal_paise: payload.subtotal_paise,
      discount_paise: payload.discount_paise || 0,
      delivery_fee_paise: payload.delivery_fee_paise || 4000,
      service_fee_paise: payload.service_fee_paise || 1500,
      tax_paise: payload.tax_paise || 0,
      final_total_paise: payload.final_total_paise,
      coupon_code: payload.coupon_code || null,
      estimated_delivery_time: new Date(Date.now() + 35 * 60000).toISOString(),
    })
    .select()
    .single();

  if (error || !newOrder) {
    throw new Error(error?.message || 'Order creation failed');
  }

  return newOrder as Order;
}

// Fallback Development Datasets
function getFallbackRestaurants(search?: string, cuisine?: string): Restaurant[] {
  const list: Restaurant[] = [
    {
      id: 'a1111111-1111-1111-1111-111111111111',
      name: 'Spice Junction',
      description: 'Authentic North Indian curries, tandoori breads, and rich gravies.',
      logo_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500',
      banner_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000',
      address: '42 MG Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postal_code: '560038',
      cuisine_types: ['North Indian', 'Biryani', 'Mughlai'],
      opening_time: '11:00',
      closing_time: '23:00',
      is_approved: true,
      is_active: true,
      is_open: true,
      min_order_amount_paise: 15000,
      base_delivery_fee_paise: 4000,
      free_delivery_threshold_paise: 50000,
      estimated_prep_time_minutes: 30,
      rating: 4.7,
      rating_count: 340,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'a2222222-2222-2222-2222-222222222222',
      name: 'Bella Italia Pizzeria',
      description: 'Wood-fired authentic Neapolitan pizzas with fresh mozzarella.',
      logo_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
      banner_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000',
      address: '108 100ft Road, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      postal_code: '560095',
      cuisine_types: ['Italian', 'Pizza', 'Pasta'],
      opening_time: '12:00',
      closing_time: '23:30',
      is_approved: true,
      is_active: true,
      is_open: true,
      min_order_amount_paise: 20000,
      base_delivery_fee_paise: 4500,
      free_delivery_threshold_paise: 60000,
      estimated_prep_time_minutes: 25,
      rating: 4.8,
      rating_count: 510,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'a5555555-5555-5555-5555-555555555555',
      name: 'Burger Shack & Grill',
      description: 'Juicy smashed burgers, golden fries, and milkshakes.',
      logo_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
      banner_url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1000',
      address: '23 CMH Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postal_code: '560008',
      cuisine_types: ['American', 'Burgers', 'Fast Food'],
      opening_time: '11:00',
      closing_time: '01:00',
      is_approved: true,
      is_active: true,
      is_open: true,
      min_order_amount_paise: 12000,
      base_delivery_fee_paise: 3000,
      free_delivery_threshold_paise: 40000,
      estimated_prep_time_minutes: 20,
      rating: 4.5,
      rating_count: 420,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  if (search) {
    return list.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  }
  return list;
}

function getFallbackMenu(restaurantId: string) {
  const categories = [
    { id: 'cat-1', name: 'Popular Food Items', display_order: 1 },
    { id: 'cat-2', name: 'Feedo Meat Fresh Cuts', display_order: 2 },
    { id: 'cat-3', name: 'Feedo Mart Daily Essentials', display_order: 3 },
  ];
  const items: MenuItem[] = [
    // 1. Food Items
    {
      id: 'item-biryani-01',
      restaurant_id: restaurantId,
      category_id: 'cat-1',
      name: 'Hyderabadi Dum Biryani',
      description: 'Slow-cooked fragrant basmati rice with tender spiced chicken pieces and saffron aromatics.',
      price_paise: 24900,
      image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
      dietary_type: 'non_veg',
      is_available: true,
      is_recommended: true,
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'item-noodles-01',
      restaurant_id: restaurantId,
      category_id: 'cat-1',
      name: 'Chicken Hakka Noodles',
      description: 'Wok-tossed noodles with farm vegetables, chicken slices and savory soy-garlic glaze.',
      price_paise: 18900,
      image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500',
      dietary_type: 'non_veg',
      is_available: true,
      is_recommended: true,
      display_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'item-burger-01',
      restaurant_id: restaurantId,
      category_id: 'cat-1',
      name: 'Gourmet Beef / Veg Cheese Burger',
      description: 'Flame-grilled patty layered with melted cheddar, crisp lettuce and secret house sauce.',
      price_paise: 16900,
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
      dietary_type: 'non_veg',
      is_available: true,
      is_recommended: true,
      display_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'item-fries-01',
      restaurant_id: restaurantId,
      category_id: 'cat-1',
      name: 'Crispy Golden French Fries',
      description: 'Double-fried hand-cut salted potato fries served with zesty dip.',
      price_paise: 9900,
      image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500',
      dietary_type: 'veg',
      is_available: true,
      is_recommended: false,
      display_order: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // 2. Feedo Meat
    {
      id: 'item-meat-chicken',
      restaurant_id: restaurantId,
      category_id: 'cat-2',
      name: 'Fresh Tender Chicken (Curry Cut, 500g)',
      description: '100% antibiotic-free, hygienically vacuum-packed fresh bone-in chicken curry cut.',
      price_paise: 18000,
      image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500',
      dietary_type: 'non_veg',
      is_available: true,
      is_recommended: true,
      display_order: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'item-meat-mutton',
      restaurant_id: restaurantId,
      category_id: 'cat-2',
      name: 'Premium Goat Mutton (Curry Cut, 500g)',
      description: 'Pasture-raised, tender young goat meat cut precisely for rich curries.',
      price_paise: 42000,
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
      dietary_type: 'non_veg',
      is_available: true,
      is_recommended: true,
      display_order: 6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'item-meat-prawns',
      restaurant_id: restaurantId,
      category_id: 'cat-2',
      name: 'Cleaned Fresh Sea Prawns (250g)',
      description: 'Fresh coastal catch, deveined and shell-off, ready to pan sear or curry.',
      price_paise: 26000,
      image_url: 'https://images.unsplash.com/photo-1559742811-822863c4caaf?w=500',
      dietary_type: 'non_veg',
      is_available: true,
      is_recommended: false,
      display_order: 7,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'item-meat-salmon',
      restaurant_id: restaurantId,
      category_id: 'cat-2',
      name: 'Atlantic Salmon Fillet (200g)',
      description: 'Rich in Omega-3, boneless skin-on pink salmon steak.',
      price_paise: 38000,
      image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500',
      dietary_type: 'non_veg',
      is_available: true,
      is_recommended: true,
      display_order: 8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'item-meat-eggs',
      restaurant_id: restaurantId,
      category_id: 'cat-2',
      name: 'Farm Fresh Classic White Eggs (Pack of 12)',
      description: 'Grade-A farm eggs, cleaned and tested for supreme freshness.',
      price_paise: 9500,
      image_url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500',
      dietary_type: 'egg',
      is_available: true,
      is_recommended: false,
      display_order: 9,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // 3. Feedo Mart
    {
      id: 'item-mart-avocado',
      restaurant_id: restaurantId,
      category_id: 'cat-3',
      name: 'Fresh Hass Avocados (Pack of 2)',
      description: 'Creamy, perfectly ripe avocados ideal for salads and guacamole.',
      price_paise: 16000,
      image_url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500',
      dietary_type: 'veg',
      is_available: true,
      is_recommended: true,
      display_order: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'item-mart-strawberry',
      restaurant_id: restaurantId,
      category_id: 'cat-3',
      name: 'Sweet Mahabaleshwar Strawberries (200g)',
      description: 'Juicy, fragrant ruby strawberries picked fresh from the hills.',
      price_paise: 12000,
      image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500',
      dietary_type: 'veg',
      is_available: true,
      is_recommended: true,
      display_order: 11,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'item-mart-milk',
      restaurant_id: restaurantId,
      category_id: 'cat-3',
      name: 'Organic A2 Pasteurized Farm Milk (1L)',
      description: 'Pure, wholesome natural farm milk bottle.',
      price_paise: 7500,
      image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500',
      dietary_type: 'veg',
      is_available: true,
      is_recommended: false,
      display_order: 12,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'item-mart-paneer',
      restaurant_id: restaurantId,
      category_id: 'cat-3',
      name: 'Fresh Malai Dairy Paneer (200g)',
      description: 'Melt-in-mouth cottage cheese crafted from pure full-cream milk.',
      price_paise: 8500,
      image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500',
      dietary_type: 'veg',
      is_available: true,
      is_recommended: true,
      display_order: 13,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // 4. Feedo Mart Juices & Beverages
    {
      id: 'item-mart-orange-juice',
      restaurant_id: restaurantId,
      category_id: 'cat-3',
      name: 'Orange Blossom Cold-Pressed Juice (500ml)',
      description: 'Cold-pressed 100% natural Valencia oranges without added sugar.',
      price_paise: 7900,
      image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500',
      dietary_type: 'veg',
      is_available: true,
      is_recommended: true,
      display_order: 14,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  return { categories, items };
}
