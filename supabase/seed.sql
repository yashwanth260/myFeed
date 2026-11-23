-- CraveCart Seed SQL File

-- 1. SEED RESTAURANTS
INSERT INTO public.restaurants (id, name, description, logo_url, banner_url, address, city, state, postal_code, cuisine_types, opening_time, closing_time, is_approved, is_active, is_open, min_order_amount_paise, base_delivery_fee_paise, free_delivery_threshold_paise, estimated_prep_time_minutes, rating, rating_count)
VALUES
(
  'a1111111-1111-1111-1111-111111111111',
  'Spice Junction',
  'Authentic North Indian curries, tandoori breads, and rich gravies cooked to perfection.',
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000',
  '42 MG Road, Indiranagar',
  'Bengaluru',
  'Karnataka',
  '560038',
  ARRAY['North Indian', 'Biryani', 'Mughlai'],
  '11:00',
  '23:00',
  true, true, true,
  15000, 4000, 50000, 30, 4.7, 340
),
(
  'a2222222-2222-2222-2222-222222222222',
  'Bella Italia Pizzeria',
  'Wood-fired authentic Neapolitan pizzas made with imported San Marzano tomatoes & fresh mozzarella.',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000',
  '108 100ft Road, Koramangala',
  'Bengaluru',
  'Karnataka',
  '560095',
  ARRAY['Italian', 'Pizza', 'Pasta'],
  '12:00',
  '23:30',
  true, true, true,
  20000, 4500, 60000, 25, 4.8, 510
),
(
  'a3333333-3333-3333-3333-333333333333',
  'Dragon Wok Chinese',
  'Sizzling Sichuan specialties, dim sums, noodles, and fried rice from expert chefs.',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1000',
  '15 Church Street, Ashok Nagar',
  'Bengaluru',
  'Karnataka',
  '560001',
  ARRAY['Chinese', 'Asian', 'Thai'],
  '12:00',
   me: '22:30',
  true, true, true,
  15000, 3500, 45000, 20, 4.6, 280
),
(
  'a4444444-4444-4444-4444-444444444444',
  'Royal Hyderabadi Biryani',
  'Slow-cooked Dum Biryani infused with saffron, secret spices, and tender meat or veggies.',
  'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500',
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1000',
  '88 Outer Ring Road, Bellandur',
  'Bengaluru',
  'Karnataka',
  '560103',
  ARRAY['Biryani', 'Hyderabadi', 'Kebab'],
  '11:30',
  '23:00',
  true, true, true,
  18000, 4000, 50000, 35, 4.9, 890
),
(
  'a5555555-5555-5555-5555-555555555555',
  'Burger Shack & Grill',
  'Juicy smashed beef and chicken burgers served with crispy golden fries and thick milkshakes.',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1000',
  '23 CMH Road, Lakshmipuram',
  'Bengaluru',
  'Karnataka',
  '560008',
  ARRAY['American', 'Burgers', 'Fast Food'],
  '11:00',
  '01:00',
  true, true, true,
  12000, 3000, 40000, 20, 4.5, 420
),
(
  'a6666666-6666-6666-6666-666666666666',
  'Dosa Junction South Tiffins',
  'Crispy Ghee Roast Dosas, fluffy Idlis, and aromatic Filter Coffee served fresh daily.',
  'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500',
  'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=1000',
  '7 Commercial Street, Tasker Town',
  'Bengaluru',
  'Karnataka',
  '560001',
  ARRAY['South Indian', 'Breakfast', 'Dosa'],
  '07:00',
  '22:00',
  true, true, true,
  10000, 2500, 35000, 15, 4.8, 950
),
(
  'a7777777-7777-7777-7777-777777777777',
  'Sweet Tooth Desserts & Bakery',
  'Decadent chocolate cakes, artisan donuts, waffles, and hand-crafted ice creams.',
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
  'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1000',
  '54 Lavelle Road, Shanthala Nagar',
  'Bengaluru',
  'Karnataka',
  '560001',
  ARRAY['Desserts', 'Bakery', 'Ice Cream'],
  '10:00',
  '00:00',
  true, true, true,
  10000, 3000, 30000, 15, 4.7, 310
),
(
  'a8888888-8888-8888-8888-888888888888',
  'Sakura Ramen & Sushi Bar',
  'Traditional Japanese ramen with rich broth, fresh nigiri sushi, and crispy tempura.',
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
  'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1000',
  '9 UB City, Vittal Mallya Road',
  'Bengaluru',
  'Karnataka',
  '560001',
  ARRAY['Japanese', 'Sushi', 'Ramen'],
  '12:30',
  '23:00',
  true, true, true,
  25000, 5000, 75000, 30, 4.9, 210
),
(
  'a9999999-9999-9999-9999-999999999999',
  'Green Bowl Co.',
  'Nutritious protein bowls, fresh avocado salads, cold-pressed juices, and smoothie bowls.',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1000',
  '31 HSR Layout Sector 1',
  'Bengaluru',
  'Karnataka',
  '560102',
  ARRAY['Healthy', 'Salads', 'Smoothies'],
  '08:30',
   me: '21:30',
  true, true, true,
  15000, 3500, 45000, 15, 4.6, 175
),
(
  'a0000000-0000-0000-0000-000000000000',
  'The Roastery Brew Cafe',
  'Specialty espresso beverages, artisan sandwiches, croissants, and all-day breakfast.',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1000',
  '12 Residency Road, Richmond Town',
  'Bengaluru',
  'Karnataka',
  '560025',
  ARRAY['Cafe', 'Coffee', 'Continental'],
  '08:00',
  '23:00',
  true, true, true,
  12000, 3000, 40000, 15, 4.8, 640
)
ON CONFLICT (id) DO NOTHING;

-- Fix closing times in seed values above
UPDATE public.restaurants SET closing_time = '22:30' WHERE id = 'a3333333-3333-3333-3333-333333333333';
UPDATE public.restaurants SET closing_time = '21:30' WHERE id = 'a9999999-9999-9999-9999-999999999999';

-- 2. SEED MENU CATEGORIES
INSERT INTO public.menu_categories (id, restaurant_id, name, display_order)
VALUES
-- Spice Junction categories
('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Starters & Tandoor', 1),
('c1111111-1111-1111-1111-222222222222', 'a1111111-1111-1111-1111-111111111111', 'Main Course Gravies', 2),
('c1111111-1111-1111-1111-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Biryani & Rice', 3),
('c1111111-1111-1111-1111-444444444444', 'a1111111-1111-1111-1111-111111111111', 'Naan & Breads', 4),

-- Bella Italia categories
('c2222222-2222-2222-2222-111111111111', 'a2222222-2222-2222-2222-222222222222', 'Gourmet Pizzas', 1),
('c2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'Artisan Pastas', 2),
('c2222222-2222-2222-2222-333333333333', 'a2222222-2222-2222-2222-222222222222', 'Appetizers & Garlic Bread', 3),

-- Dragon Wok categories
('c3333333-3333-3333-3333-111111111111', 'a3333333-3333-3333-3333-333333333333', 'Dim Sums & Momos', 1),
('c3333333-3333-3333-3333-222222222222', 'a3333333-3333-3333-3333-333333333333', 'Noodles & Fried Rice', 2),

-- Royal Hyderabadi Biryani categories
('c4444444-4444-4444-4444-111111111111', 'a4444444-4444-4444-4444-444444444444', 'Special Dum Biryani', 1),
('c4444444-4444-4444-4444-222222222222', 'a4444444-4444-4444-4444-444444444444', 'Kebab & Starters', 2),

-- Burger Shack categories
('c5555555-5555-5555-5555-111111111111', 'a5555555-5555-5555-5555-555555555555', 'Signature Burgers', 1),
('c5555555-5555-5555-5555-222222222222', 'a5555555-5555-5555-5555-555555555555', 'Sides & Fries', 2),

-- Dosa Junction categories
('c6666666-6666-6666-6666-111111111111', 'a6666666-6666-6666-6666-666666666666', 'Crispy Dosas', 1),
('c6666666-6666-6666-6666-222222222222', 'a6666666-6666-6666-6666-666666666666', 'Idlis & Vadas', 2)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED MENU ITEMS (40+ items with paise prices)
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price_paise, image_url, dietary_type, is_available, is_recommended)
VALUES
-- Spice Junction Items
('m1111111-0001-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Paneer Tikka Angaara', 'Cottage cheese marinated in spicy yoghurt and roasted in clay tandoor.', 32000, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500', 'veg', true, true),
('m1111111-0002-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Tandoori Murgh (Half)', 'Chicken on bone slow-cooked in charcoal tandoor with aromatic herbs.', 38000, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500', 'non_veg', true, true),
('m1111111-0003-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-222222222222', 'Butter Chicken Special', 'Tender tandoori chicken simmered in rich creamy tomato cashew gravy.', 42000, 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500', 'non_veg', true, true),
('m1111111-0004-1111-1111-111111111111', 'a1111111-1111-1111-1111-222222222222', 'Dal Makhani Special', 'Black lentils slow-cooked overnight with butter, cream, and subtle spices.', 30000, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500', 'veg', true, true),
('m1111111-0005-1111-1111-111111111111', 'a1111111-1111-1111-1111-333333333333', 'Chicken Dum Biryani', 'Long grain basmati rice layered with succulent marinated chicken and saffron.', 36000, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500', 'non_veg', true, true),
('m1111111-0006-1111-1111-111111111111', 'a1111111-1111-1111-1111-444444444444', 'Butter Garlic Naan', 'Leavened clay oven bread brushed with rich garlic butter.', 8000, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500', 'veg', true, false),

-- Bella Italia Items
('m2222222-0001-2222-2222-111111111111', 'a2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-111111111111', 'Margherita Supreme Pizza', 'San Marzano tomato sauce, fresh mozzarella di bufala, basil & extra virgin olive oil.', 45000, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500', 'veg', true, true),
('m2222222-0002-2222-2222-111111111111', 'a2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-111111111111', 'Pepperoni Passion Pizza', 'Loaded with Italian pepperoni, spicy jalapenos, mozzarella, and chili honey drizzle.', 58000, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500', 'non_veg', true, true),
('m2222222-0003-2222-2222-111111111111', 'a2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Creamy Truffle Mushroom Pasta', 'Fettuccine tossed in white truffle parmesan cream sauce with wild mushrooms.', 49000, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281254?w=500', 'veg', true, true),
('m2222222-0004-2222-2222-111111111111', 'a2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-333333333333', 'Cheesy Garlic Pull-Apart Bread', 'Freshly baked baguette topped with garlic herb butter and melted mozzarella.', 24000, 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500', 'veg', true, false),

-- Dragon Wok Items
('m3333333-0001-3333-3333-111111111111', 'a3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-111111111111', 'Steamed Chicken Dim Sums (6pcs)', 'Delicate dumplings filled with seasoned minced chicken & scallions served with chili oil.', 28000, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500', 'non_veg', true, true),
('m3333333-0002-3333-3333-111111111111', 'a3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-222222222222', 'Sichuan Hakka Noodles', 'Wok-tossed noodles with colorful bell peppers, bok choy, and spicy Sichuan sauce.', 26000, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500', 'veg', true, false),

-- Royal Biryani Items
('m4444444-0001-4444-4444-111111111111', 'a4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-111111111111', 'Royal Mutton Dum Biryani', 'Tender goat meat slow cooked with basmati rice, caramelized onions & mint.', 48000, 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500', 'non_veg', true, true),
('m4444444-0002-4444-4444-111111111111', 'a4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-222222222222', 'Chicken 65 Spicy Starter', 'Crispy deep-fried chicken tossed in curry leaves, yogurt, and red chili sauce.', 32000, 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500', 'non_veg', true, true),

-- Burger Shack Items
('m5555555-0001-5555-5555-111111111111', 'a5555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-111111111111', 'Double Cheese Smash Burger', 'Two seared beef patties, double cheddar cheese, house pickles & secret sauce.', 35000, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', 'non_veg', true, true),
('m5555555-0002-5555-5555-111111111111', 'a5555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-222222222222', 'Loaded Peri Peri Fries', 'Crispy skin-on potato fries tossed in peri peri spice & topped with cheese sauce.', 18000, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500', 'veg', true, false),

-- Dosa Junction Items
('m6666666-0001-6666-6666-111111111111', 'a6666666-6666-6666-6666-666666666666', 'c6666666-6666-6666-6666-111111111111', 'Special Masala Dosa', 'Golden crispy dosa stuffed with spiced potato masala, served with 3 chutneys & sambar.', 14000, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500', 'veg', true, true),
('m6666666-0002-6666-6666-111111111111', 'a6666666-6666-6666-6666-666666666666', 'c6666666-6666-6666-6666-222222222222', 'Button Sambar Idli (12pcs)', 'Mini steaming rice cakes submerged in hot spicy lentil sambar drizzled with pure ghee.', 12000, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500', 'veg', true, true)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED CUSTOMIZATION GROUPS & OPTIONS
INSERT INTO public.item_customization_groups (id, menu_item_id, name, min_select, max_select, is_required)
VALUES
('g222-1', 'm2222222-0001-2222-2222-111111111111', 'Crust Type', 1, 1, true),
('g222-2', 'm2222222-0001-2222-2222-111111111111', 'Extra Toppings', 0, 3, false),
('g555-1', 'm5555555-0001-5555-5555-111111111111', 'Choose Patty', 1, 1, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.item_customization_options (id, group_id, name, price_paise, is_available)
VALUES
('o222-11', 'g222-1', 'Classic Thin Crust', 0, true),
('o222-12', 'g222-1', 'Cheese Burst Crust', 8000, true),
('o222-21', 'g222-2', 'Extra Mozzarella Cheese', 5000, true),
('o222-22', 'g222-2', 'Black Olives & Jalapenos', 4000, true),
('o555-11', 'g555-1', 'Grilled Beef Patty', 0, true),
('o555-12', 'g555-1', 'Crispy Fried Chicken Patty', 0, true)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED COUPONS
INSERT INTO public.coupons (id, code, description, discount_type, discount_value, max_discount_paise, min_order_amount_paise, valid_from, valid_until, usage_limit_per_user, is_active)
VALUES
('cp-1', 'WELCOME50', '50% Off up to ₹100 on your first order!', 'percentage', 50, 10000, 15000, '2026-01-01', '2027-12-31', 1, true),
('cp-2', 'CRAVE20', 'Flat ₹50 Off on orders above ₹299', 'flat', 5000, NULL, 29900, '2026-01-01', '2027-12-31', 5, true),
('cp-3', 'FREEDEL', 'Free delivery on orders above ₹399', 'flat', 4000, NULL, 39900, '2026-01-01', '2027-12-31', 10, true)
ON CONFLICT (id) DO NOTHING;
