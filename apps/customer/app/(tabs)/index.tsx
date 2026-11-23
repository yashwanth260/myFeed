import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Star,
  Clock,
  Tag,
  ChevronRight,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Plus,
  Minus,
  X,
  Check,
} from 'lucide-react-native';
import { COLORS, SHADOWS } from '@cravecart/shared-ui';
import { formatCurrencyPaise } from '@cravecart/shared-business-logic';
import { MenuItem } from '@cravecart/shared-types';
import { fetchRestaurants } from '../../services/apiService';
import { useCartStore } from '../../store/cartStore';
import { BorderBeamSearch } from '../../components/BorderBeamSearch';
import { AnimatedOtpModal } from '../../components/AnimatedOtpModal';

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  description: string;
  pricePaise: number;
  originalPricePaise: number;
  rating: number;
  distance: string;
  deliveryTime: string;
  imageUrl: string;
  dietaryType: 'veg' | 'non_veg' | 'egg';
}

export const PRODUCTS_BY_TYPE: Record<string, ProductItem[]> = {
  food: [
    {
      id: 'item-biryani-01',
      name: 'Hyderabadi Dum Biryani',
      category: 'Biryani',
      description: 'Slow-cooked fragrant basmati rice with tender spiced chicken pieces and saffron aromatics.',
      pricePaise: 24900,
      originalPricePaise: 32000,
      rating: 4.8,
      distance: '2.5km',
      deliveryTime: '30 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
      dietaryType: 'non_veg',
    },
    {
      id: 'item-biryani-02',
      name: 'Royal Awadhi Mutton Biryani',
      category: 'Biryani',
      description: 'Prime cuts of tender goat meat layered with aged basmati rice and royal kewra essence.',
      pricePaise: 38000,
      originalPricePaise: 46000,
      rating: 4.9,
      distance: '2.8km',
      deliveryTime: '35 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500',
      dietaryType: 'non_veg',
    },
    {
      id: 'item-burger-01',
      name: 'Beef Cheese Burger Deluxe',
      category: 'Burger',
      description: 'Flame-grilled prime patty layered with melted cheddar cheese, lettuce and signature sauce.',
      pricePaise: 16900,
      originalPricePaise: 21000,
      rating: 4.5,
      distance: '2.5km',
      deliveryTime: '20 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
      dietaryType: 'non_veg',
    },
    {
      id: 'item-burger-02',
      name: 'Crispy Chicken Zinger Burger',
      category: 'Burger',
      description: 'Golden fried crispy chicken thigh fillet with fresh iceberg lettuce and creamy mayo.',
      pricePaise: 19900,
      originalPricePaise: 25000,
      rating: 4.7,
      distance: '2.0km',
      deliveryTime: '20 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500',
      dietaryType: 'non_veg',
    },
    {
      id: 'item-pizza-01',
      name: 'Farmhouse Deluxe Pizza (10")',
      category: 'Pizza',
      description: 'Hand-stretched dough topped with mozzarella, bell peppers, golden corn, and mushrooms.',
      pricePaise: 29900,
      originalPricePaise: 38000,
      rating: 4.6,
      distance: '3.0km',
      deliveryTime: '25 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500',
      dietaryType: 'veg',
    },
    {
      id: 'item-noodles-01',
      name: 'Chicken Hakka Noodles',
      category: 'Noodles',
      description: 'Wok-tossed noodles with shredded chicken, crisp scallions, and savory soy garlic sauce.',
      pricePaise: 18900,
      originalPricePaise: 24000,
      rating: 4.5,
      distance: '2.5km',
      deliveryTime: '25 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500',
      dietaryType: 'non_veg',
    },
    {
      id: 'item-buddha-01',
      name: 'Buddha Bowl Rice & Greens',
      category: 'Sushi',
      description: 'Nutritious golden turmeric rice bowl with steamed edamame, avocado, and toasted sesame.',
      pricePaise: 22900,
      originalPricePaise: 28000,
      rating: 4.6,
      distance: '2.0km',
      deliveryTime: '15 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
      dietaryType: 'veg',
    },
    {
      id: 'item-fries-01',
      name: 'Crispy French Fries (Large)',
      category: 'Burger',
      description: 'Double-fried salted potato batons served hot with spicy house cocktail dip.',
      pricePaise: 9900,
      originalPricePaise: 14000,
      rating: 4.7,
      distance: '1.5km',
      deliveryTime: '10 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500',
      dietaryType: 'veg',
    },
  ],

  // Feedo Meat: 100% Antibiotic-Free Fresh Meat, Poultry & Seafood
  meat: [
    {
      id: 'item-meat-chicken-curry',
      name: 'Fresh Chicken Curry Cut (500g)',
      category: 'Chicken',
      description: '100% antibiotic-free, hygienically vacuum-packed fresh bone-in chicken curry cut.',
      pricePaise: 18000,
      originalPricePaise: 22000,
      rating: 4.9,
      distance: '1.8km',
      deliveryTime: '15 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500',
      dietaryType: 'non_veg',
    },
    {
      id: 'item-meat-chicken-breast',
      name: 'Chicken Breast Boneless (500g)',
      category: 'Chicken',
      description: 'High-protein, tender skinless chicken breast cuts, neatly trimmed and juicy.',
      pricePaise: 19500,
      originalPricePaise: 24000,
      rating: 4.9,
      distance: '1.8km',
      deliveryTime: '15 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500',
      dietaryType: 'non_veg',
    },
    {
      id: 'item-meat-chicken-drumsticks',
      name: 'Juicy Chicken Drumsticks (Pack of 4)',
      category: 'Chicken',
      description: 'Fresh plump chicken drumsticks with tender meat, perfect for roasting or grilling.',
      pricePaise: 17500,
      originalPricePaise: 22000,
      rating: 4.8,
      distance: '2.0km',
      deliveryTime: '15 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500',
      dietaryType: 'non_veg',
    },
    {
      id: 'item-meat-mutton-curry',
      name: 'Prime Goat Mutton Curry Cut (500g)',
      category: 'Mutton',
      description: 'Pasture-raised young goat meat cut precisely with balanced bone-in pieces for royal gravies.',
      pricePaise: 42000,
      originalPricePaise: 48000,
      rating: 4.8,
      distance: '2.2km',
      deliveryTime: '20 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
      dietaryType: 'non_veg',
    },
    {
      id: 'item-meat-mutton-keema',
      name: 'Fresh Minced Mutton Keema (400g)',
      category: 'Mutton',
      description: 'Finely minced fresh goat meat from lean cuts, perfect for succulent kebabs and keema pav.',
      pricePaise: 39000,
      originalPricePaise: 45000,
      rating: 4.7,
      distance: '2.2km',
      deliveryTime: '20 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500',
      dietaryType: 'non_veg',
    },
    {
      id: 'item-meat-prawns',
      name: 'Fresh Cleaned Sea Prawns (250g)',
      category: 'Seafood',
      description: 'Wild-caught coastal prawns, peeled, deveined, tail-on, cleaned ready to fry or curry.',
      pricePaise: 26000,
      originalPricePaise: 31000,
      rating: 4.7,
      distance: '2.5km',
      deliveryTime: '15 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1559742811-822863c4caaf?w=500',
      dietaryType: 'non_veg',
    },
    {
      id: 'item-meat-salmon',
      name: 'Atlantic Salmon Fillet (200g)',
      category: 'Seafood',
      description: 'Fresh sashimi-grade pink salmon steak loaded with natural Omega-3 fatty acids.',
      pricePaise: 38000,
      originalPricePaise: 44000,
      rating: 4.9,
      distance: '3.0km',
      deliveryTime: '15 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500',
      dietaryType: 'non_veg',
    },
    {
      id: 'item-meat-eggs-white',
      name: 'Farm Fresh Classic White Eggs (12pk)',
      category: 'Eggs',
      description: 'Grade-A farm eggs, cleaned and tested for supreme freshness and golden yolks.',
      pricePaise: 9500,
      originalPricePaise: 11000,
      rating: 4.6,
      distance: '1.2km',
      deliveryTime: '10 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500',
      dietaryType: 'egg',
    },
    {
      id: 'item-meat-eggs-brown',
      name: 'Organic Country Brown Eggs (6pk)',
      category: 'Eggs',
      description: 'Free-range country hens eggs, rich in natural lutein, vitamin D, and protein.',
      pricePaise: 7500,
      originalPricePaise: 9000,
      rating: 4.8,
      distance: '1.2km',
      deliveryTime: '10 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500',
      dietaryType: 'egg',
    },
    {
      id: 'item-meat-marinated-wings',
      name: 'Peri Peri Spicy Wings (500g)',
      category: 'Marinated',
      description: 'Ready-to-cook chicken wings marinated in crushed African bird’s eye chili, herbs and lemon.',
      pricePaise: 22000,
      originalPricePaise: 28000,
      rating: 4.8,
      distance: '2.0km',
      deliveryTime: '15 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1527477378408-1bc09c233134?w=500',
      dietaryType: 'non_veg',
    },
  ],

  // Feedo Mart: Instant Grocery & Daily Essentials
  mart: [
    {
      id: 'item-mart-avocado',
      name: 'Fresh Hass Avocados (Pack of 2)',
      category: 'Fruits',
      description: 'Creamy, perfectly ripe Mexican avocados loaded with healthy monounsaturated fats.',
      pricePaise: 16000,
      originalPricePaise: 19000,
      rating: 4.8,
      distance: '1.2km',
      deliveryTime: '10 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500',
      dietaryType: 'veg',
    },
    {
      id: 'item-mart-strawberry',
      name: 'Sweet Strawberries (200g)',
      category: 'Fruits',
      description: 'Juicy, fragrant ruby strawberries picked fresh and chilled to preserve peak sweetness.',
      pricePaise: 12000,
      originalPricePaise: 15000,
      rating: 4.7,
      distance: '1.5km',
      deliveryTime: '10 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500',
      dietaryType: 'veg',
    },
    {
      id: 'item-mart-blueberries',
      name: 'Fresh Blueberries (125g)',
      category: 'Fruits',
      description: 'Plump antioxidant-packed berries for nutritious yogurt bowls and smoothies.',
      pricePaise: 19000,
      originalPricePaise: 23000,
      rating: 4.6,
      distance: '1.8km',
      deliveryTime: '10 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=500',
      dietaryType: 'veg',
    },
    {
      id: 'item-mart-tomatoes',
      name: 'Vine-Ripened Tomatoes (1kg)',
      category: 'Veggies',
      description: 'Farm-fresh crimson tomatoes harvested directly from regional greenhouse vines.',
      pricePaise: 4500,
      originalPricePaise: 6000,
      rating: 4.7,
      distance: '1.0km',
      deliveryTime: '10 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500',
      dietaryType: 'veg',
    },
    {
      id: 'item-mart-spinach',
      name: 'Hydroponic Baby Spinach (250g)',
      category: 'Veggies',
      description: 'Crisp, washed and pesticide-free baby spinach leaves high in iron and vitamins.',
      pricePaise: 4000,
      originalPricePaise: 5500,
      rating: 4.8,
      distance: '1.2km',
      deliveryTime: '10 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500',
      dietaryType: 'veg',
    },
    {
      id: 'item-mart-milk',
      name: 'Organic A2 Whole Farm Milk (1L)',
      category: 'Dairy',
      description: 'Pure, wholesome unhomogenized natural cow milk bottled cold from local farms.',
      pricePaise: 7500,
      originalPricePaise: 8500,
      rating: 4.9,
      distance: '1.0km',
      deliveryTime: '10 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500',
      dietaryType: 'veg',
    },
    {
      id: 'item-mart-paneer',
      name: 'Fresh Malai Paneer (200g)',
      category: 'Dairy',
      description: 'Melt-in-mouth cottage cheese crafted fresh every morning from whole cream milk.',
      pricePaise: 8500,
      originalPricePaise: 10000,
      rating: 4.8,
      distance: '1.2km',
      deliveryTime: '10 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500',
      dietaryType: 'veg',
    },
    {
      id: 'item-mart-sourdough',
      name: 'Artisanal Sourdough Loaf (400g)',
      category: 'Bakery',
      description: 'Naturally fermented crusty European sourdough loaf with airy, chewy crumb.',
      pricePaise: 9000,
      originalPricePaise: 11000,
      rating: 4.8,
      distance: '1.5km',
      deliveryTime: '10 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500',
      dietaryType: 'veg',
    },
    {
      id: 'item-mart-croissant',
      name: 'French Butter Croissant (Pack of 2)',
      category: 'Bakery',
      description: 'Flaky, buttery golden French pastries made with pure imported lactic butter.',
      pricePaise: 11000,
      originalPricePaise: 14000,
      rating: 4.9,
      distance: '1.5km',
      deliveryTime: '10 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500',
      dietaryType: 'veg',
    },
    {
      id: 'item-mart-almonds',
      name: 'Roasted California Almonds (250g)',
      category: 'Snacks',
      description: 'Jumbo California almonds slow-roasted with Himalayan pink salt for daily crunch.',
      pricePaise: 28000,
      originalPricePaise: 34000,
      rating: 4.9,
      distance: '2.0km',
      deliveryTime: '10 min delivery',
      imageUrl: 'https://images.unsplash.com/photo-1508061252445-5633a2515b02?w=500',
      dietaryType: 'veg',
    },
  ],
};

export const CUISINES_BY_TYPE: Record<string, { id: string; name: string }[]> = {
  food: [
    { id: 'all', name: 'All' },
    { id: 'Burger', name: 'Burger' },
    { id: 'Pizza', name: 'Pizza' },
    { id: 'Sushi', name: 'Sushi' },
    { id: 'Biryani', name: 'Biryani' },
    { id: 'Noodles', name: 'Noodles' },
  ],
  meat: [
    { id: 'all', name: 'All' },
    { id: 'Chicken', name: 'Chicken' },
    { id: 'Mutton', name: 'Mutton' },
    { id: 'Seafood', name: 'Seafood' },
    { id: 'Eggs', name: 'Eggs' },
    { id: 'Marinated', name: 'Marinated' },
  ],
  mart: [
    { id: 'all', name: 'All' },
    { id: 'Fruits', name: 'Fruits' },
    { id: 'Veggies', name: 'Veggies' },
    { id: 'Dairy', name: 'Dairy' },
    { id: 'Bakery', name: 'Bakery' },
    { id: 'Snacks', name: 'Snacks' },
  ],
};

export const ITEM_TYPES = [
  { id: 'food', label: 'Food Item' },
  { id: 'meat', label: 'Feedo Meat' },
  { id: 'mart', label: 'Feedo Mart' },
];

export default function CustomerHomeScreen() {
  const router = useRouter();
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [selectedType, setSelectedType] = useState('food');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    'item-biryani-01': true,
    'item-meat-chicken-curry': true,
    'item-mart-avocado': true,
  });
  const [otpModalVisible, setOtpModalVisible] = useState(false);

  // Item customization modal state
  const [activeCustomItem, setActiveCustomItem] = useState<ProductItem | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [selectedPortion, setSelectedPortion] = useState<'regular' | 'large'>('regular');
  const [selectedSpice, setSelectedSpice] = useState<'mild' | 'medium' | 'extra'>('medium');

  const cartItems = useCartStore((s) => s.items);
  const cartSubtotal = useCartStore((s) => s.getSubtotalPaise());

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants', searchQuery, selectedCuisine, selectedType],
    queryFn: () => fetchRestaurants(searchQuery, selectedCuisine === 'all' ? undefined : selectedCuisine),
  });

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTypeChange = (typeId: string) => {
    setSelectedType(typeId);
    setSelectedCuisine('all');
  };

  const getHeaderTitle = () => {
    if (selectedType === 'meat') return 'Feedo Meat';
    if (selectedType === 'mart') return 'Feedo Mart';
    return 'Popular Items';
  };

  const openCustomModal = (prod: ProductItem) => {
    setActiveCustomItem(prod);
    setModalQuantity(1);
    setSelectedPortion('regular');
    setSelectedSpice('medium');
  };

  const handleAddProductToCart = (prod: ProductItem, qty = 1, portion = 'regular', spice = 'medium') => {
    const defaultRestaurant = restaurants?.[0] || ({
      id: 'res-feedo-central',
      name: 'Feedo Central',
      min_order_amount_paise: 10000,
      base_delivery_fee_paise: 4000,
    } as any);

    const extraPortionPaise = portion === 'large' ? 5000 : 0;
    const finalPricePaise = prod.pricePaise + extraPortionPaise;

    const menuItem: MenuItem = {
      id: prod.id,
      restaurant_id: defaultRestaurant.id,
      category_id: selectedType,
      name: `${prod.name}${portion === 'large' ? ' (Large Pack)' : ''}`,
      description: `${prod.description} [${spice.toUpperCase()} SPICE]`,
      price_paise: finalPricePaise,
      image_url: prod.imageUrl,
      dietary_type: prod.dietaryType,
      is_available: true,
      is_recommended: true,
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    useCartStore.getState().addItem(defaultRestaurant, menuItem, qty, []);
    setActiveCustomItem(null);
  };

  const currentCuisines = CUISINES_BY_TYPE[selectedType] || CUISINES_BY_TYPE.food;
  const currentProducts = PRODUCTS_BY_TYPE[selectedType] || PRODUCTS_BY_TYPE.food;

  // Real reactive filtering across category pill AND search term
  const filteredProducts = currentProducts.filter((p) => {
    const matchesCuisine =
      selectedCuisine === 'all' || p.category.toLowerCase() === selectedCuisine.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query);

    return matchesCuisine && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Top App Bar with Pill Title & Round Action Buttons */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.roundIconButton}
          onPress={() => setOtpModalVisible(true)}
          activeOpacity={0.8}
        >
          <ShieldCheck color="#1E1E1E" size={20} />
        </TouchableOpacity>

        <View style={styles.centerCapsule}>
          <Text style={styles.centerCapsuleText}>{getHeaderTitle()}</Text>
        </View>

        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={styles.roundIconButton}
            onPress={() => router.push('/search')}
            activeOpacity={0.8}
          >
            <Search color="#1E1E1E" size={18} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roundIconButton}
            onPress={() => router.push('/cart')}
            activeOpacity={0.8}
          >
            <ShoppingBag color="#1E1E1E" size={18} />
            {cartItemCount > 0 && (
              <View style={styles.cartDotBadge}>
                <Text style={styles.cartDotText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Animated Border Beam Search Bar */}
        <BorderBeamSearch
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={
            selectedType === 'meat'
              ? 'Search chicken, mutton, prawns, eggs...'
              : selectedType === 'mart'
              ? 'Search milk, paneer, strawberries, sourdough...'
              : 'Search biryani, burgers, pizza, noodles...'
          }
          onFilterPress={() => setSelectedCuisine('all')}
        />

        {/* Promo Banner: Delicious Savings UPTO 30% Off */}
        <TouchableOpacity
          style={styles.promoCard}
          onPress={() => router.push('/cart')}
          activeOpacity={0.92}
        >
          <View style={styles.wingAccentLeft} />
          <View style={styles.wingAccentRight} />

          <View style={{ flex: 1, paddingLeft: 8 }}>
            <Text style={styles.promoSubtitle}>
              {selectedType === 'meat'
                ? 'Farm Fresh Antibiotic-Free Cuts'
                : selectedType === 'mart'
                ? '10-Minute Mart Delivery'
                : 'Delicious Daily Savings'}
            </Text>
            <View style={styles.discountRow}>
              <Text style={styles.discountPre}>UPTO</Text>
              <Text style={styles.discountMain}>30%</Text>
              <View style={styles.offBadge}>
                <Text style={styles.offBadgeText}>Off</Text>
              </View>
            </View>
            <View style={styles.promoCodePill}>
              <Tag color="#FFC727" size={12} style={{ marginRight: 4 }} />
              <Text style={styles.promoCodeText}>Use code SAVINGS30</Text>
            </View>
          </View>

          <Image
            source={{
              uri:
                selectedType === 'meat'
                  ? 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80'
                  : selectedType === 'mart'
                  ? 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80'
                  : 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
            }}
            style={styles.promoBurgerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* =========================================================
            PRIMARY 3-WAY SUB-CATEGORY SWITCHER:
            Food Item | Feedo Meat | Feedo Mart
            ========================================================= */}
        <View style={styles.typeSwitcherRow}>
          {ITEM_TYPES.map((type) => {
            const isActive = selectedType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                style={[styles.typePill, isActive && styles.typePillActive]}
                onPress={() => handleTypeChange(type.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.typePillText, isActive && styles.typePillTextActive]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dynamic Category Header & Filter Chips */}
        <View style={styles.categoryHeader}>
          <Text style={styles.sectionTitle}>
            {selectedType === 'meat'
              ? 'Meat & Seafood Categories'
              : selectedType === 'mart'
              ? 'Mart Departments'
              : 'Food Categories'}
          </Text>
          <TouchableOpacity onPress={() => setSelectedCuisine('all')}>
            <Text style={styles.seeAllText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cuisineScroll}>
          {currentCuisines.map((item) => {
            const isSelected = selectedCuisine.toLowerCase() === item.id.toLowerCase();
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.cuisineChip, isSelected && styles.cuisineChipSelected]}
                onPress={() => setSelectedCuisine(item.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.cuisineText, isSelected && styles.cuisineTextSelected]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 2-Column Product Grid Section */}
        <View style={styles.restaurantSectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedType === 'meat'
              ? 'Feedo Meat Fresh Cuts'
              : selectedType === 'mart'
              ? 'Feedo Mart Instant Grocery'
              : 'Popular Food Items'}
          </Text>
          <Text style={styles.restaurantCount}>{filteredProducts.length} Items</Text>
        </View>

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
            <Text style={styles.emptyStateTitle}>No items found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try clearing filters or search for another item in {getHeaderTitle()}
            </Text>
            <TouchableOpacity
              style={styles.resetFilterBtn}
              onPress={() => {
                setSelectedCuisine('all');
                setSearchQuery('');
              }}
            >
              <Text style={styles.resetFilterBtnText}>View All {getHeaderTitle()}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredProducts.map((prod) => {
              const isFav = !!favorites[prod.id];
              return (
                <TouchableOpacity
                  key={prod.id}
                  style={styles.gridCard}
                  onPress={() => openCustomModal(prod)}
                  activeOpacity={0.9}
                >
                  <View style={styles.gridImageContainer}>
                    <Image source={{ uri: prod.imageUrl }} style={styles.gridImage} />
                    <TouchableOpacity
                      style={styles.favRoundBtnSmall}
                      onPress={() => toggleFavorite(prod.id)}
                      activeOpacity={0.8}
                    >
                      <Heart
                        color={isFav ? '#EF4444' : '#64748B'}
                        fill={isFav ? '#EF4444' : 'transparent'}
                        size={14}
                      />
                    </TouchableOpacity>

                    {/* Dietary badge */}
                    <View
                      style={[
                        styles.dietaryMiniBadge,
                        {
                          borderColor:
                            prod.dietaryType === 'veg'
                              ? '#10B981'
                              : prod.dietaryType === 'egg'
                              ? '#F59E0B'
                              : '#EF4444',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.dietaryMiniDot,
                          {
                            backgroundColor:
                              prod.dietaryType === 'veg'
                                ? '#10B981'
                                : prod.dietaryType === 'egg'
                                ? '#F59E0B'
                                : '#EF4444',
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.gridBody}>
                    <Text style={styles.gridCategoryBadge}>{prod.category}</Text>
                    <Text style={styles.gridTitle} numberOfLines={1}>
                      {prod.name}
                    </Text>

                    <View style={styles.gridPriceRow}>
                      <Text style={styles.gridActualPrice}>{formatCurrencyPaise(prod.pricePaise)}</Text>
                      <Text style={styles.gridStrikethroughPrice}>
                        {formatCurrencyPaise(prod.originalPricePaise)}
                      </Text>
                      <View style={styles.gridRatingBadge}>
                        <Star color="#F59E0B" size={11} fill="#F59E0B" style={{ marginRight: 2 }} />
                        <Text style={styles.gridRatingText}>{prod.rating}</Text>
                      </View>
                    </View>

                    <Text style={styles.gridMetaText}>
                      {prod.distance} • {prod.deliveryTime}
                    </Text>

                    <TouchableOpacity
                      style={styles.gridAddBtn}
                      onPress={() => handleAddProductToCart(prod)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.gridAddBtnText}>+ Add</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Featured Store Card */}
        <View style={[styles.restaurantSectionHeader, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>
            {selectedType === 'meat'
              ? 'Feedo Cold-Chain Fulfillment Hub'
              : selectedType === 'mart'
              ? 'Feedo Mart Dark Store Hub'
              : 'Featured Kitchen / Hub'}
          </Text>
          <Text style={styles.restaurantCount}>{restaurants?.length || 1} Hubs</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#FFC727" size="large" style={{ marginVertical: 30 }} />
        ) : (
          restaurants?.slice(0, 1).map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.restaurantCard}
              onPress={() => router.push(`/restaurant/${restaurant.id}`)}
              activeOpacity={0.9}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: restaurant.banner_url || restaurant.logo_url }}
                  style={styles.restaurantImage}
                />
                <View style={styles.prepBadge}>
                  <Clock color="#1E1E1E" size={12} style={{ marginRight: 3 }} />
                  <Text style={styles.prepBadgeText}>
                    {selectedType === 'mart'
                      ? '10 min express'
                      : selectedType === 'meat'
                      ? '15 min chilled'
                      : `${restaurant.estimated_prep_time_minutes} min`}
                  </Text>
                </View>
              </View>

              <View style={styles.restaurantContent}>
                <View style={styles.restaurantTitleRow}>
                  <Text style={styles.restaurantName}>
                    {selectedType === 'meat'
                      ? 'Feedo Meat Central Depot'
                      : selectedType === 'mart'
                      ? 'Feedo Mart Express Hub'
                      : restaurant.name}
                  </Text>
                  <View style={styles.ratingBadge}>
                    <Star color="#F59E0B" size={13} fill="#F59E0B" style={{ marginRight: 3 }} />
                    <Text style={styles.ratingText}>
                      {restaurant.rating} ({restaurant.rating_count}+)
                    </Text>
                  </View>
                </View>
                <Text style={styles.cuisinesText}>
                  {selectedType === 'meat'
                    ? 'Antibiotic-Free • 100% Halal Cut • Vacuum Packed'
                    : selectedType === 'mart'
                    ? 'Daily Dairy • Farm Produce • Fresh Breads'
                    : restaurant.cuisine_types.join(' • ')}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Floating View Cart Footer Bar */}
      {cartItemCount > 0 && (
        <TouchableOpacity
          style={styles.floatingCartBar}
          onPress={() => router.push('/cart')}
          activeOpacity={0.92}
        >
          <View style={styles.cartInfo}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
            <View>
              <Text style={styles.cartBarTitle}>View Bag ({cartItemCount} items)</Text>
              <Text style={styles.cartBarSub}>{formatCurrencyPaise(cartSubtotal)} plus taxes</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.checkoutText}>Checkout</Text>
            <ChevronRight color="#1E1E1E" size={20} />
          </View>
        </TouchableOpacity>
      )}

      {/* ========================================================
          ITEM CUSTOMIZATION BOTTOM SHEET MODAL
          ======================================================== */}
      {activeCustomItem && (
        <Modal
          visible={!!activeCustomItem}
          transparent
          animationType="slide"
          onRequestClose={() => setActiveCustomItem(null)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setActiveCustomItem(null)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.modalTitle}>{activeCustomItem.name}</Text>
                  <Text style={styles.modalSubtitle}>{activeCustomItem.description}</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setActiveCustomItem(null)}
                >
                  <X color="#64748B" size={18} />
                </TouchableOpacity>
              </View>

              <Image source={{ uri: activeCustomItem.imageUrl }} style={styles.modalImage} />

              {/* Portion selection */}
              <Text style={styles.optionSectionTitle}>Portion Size</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.optionChip,
                    selectedPortion === 'regular' && styles.optionChipActive,
                  ]}
                  onPress={() => setSelectedPortion('regular')}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      selectedPortion === 'regular' && styles.optionChipTextActive,
                    ]}
                  >
                    Regular ({formatCurrencyPaise(activeCustomItem.pricePaise)})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionChip,
                    selectedPortion === 'large' && styles.optionChipActive,
                  ]}
                  onPress={() => setSelectedPortion('large')}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      selectedPortion === 'large' && styles.optionChipTextActive,
                    ]}
                  >
                    Family Pack (+{formatCurrencyPaise(5000)})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Spice or Cut preference */}
              <Text style={styles.optionSectionTitle}>
                {selectedType === 'meat' ? 'Cut & Prep Preference' : 'Spice Level'}
              </Text>
              <View style={styles.optionsRow}>
                {(['mild', 'medium', 'extra'] as const).map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    style={[
                      styles.optionChip,
                      selectedSpice === lvl && styles.optionChipActive,
                    ]}
                    onPress={() => setSelectedSpice(lvl)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        selectedSpice === lvl && styles.optionChipTextActive,
                      ]}
                    >
                      {lvl === 'mild' ? 'Mild 🌿' : lvl === 'medium' ? 'Medium 🔥' : 'Extra Hot 🌶️'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Quantity Selector & Add Button */}
              <View style={styles.modalFooter}>
                <View style={styles.modalQtyControls}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  >
                    <Minus color="#1E1E1E" size={16} />
                  </TouchableOpacity>
                  <Text style={styles.modalQtyValue}>{modalQuantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setModalQuantity(modalQuantity + 1)}
                  >
                    <Plus color="#1E1E1E" size={16} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.modalAddToCartBtn}
                  onPress={() =>
                    handleAddProductToCart(
                      activeCustomItem,
                      modalQuantity,
                      selectedPortion,
                      selectedSpice
                    )
                  }
                >
                  <Text style={styles.modalAddToCartText}>
                    Add to Bag •{' '}
                    {formatCurrencyPaise(
                      (activeCustomItem.pricePaise + (selectedPortion === 'large' ? 5000 : 0)) *
                        modalQuantity
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Animated OTP Verification Modal */}
      <AnimatedOtpModal
        visible={otpModalVisible}
        onClose={() => setOtpModalVisible(false)}
        onVerifySuccess={(code) => {
          alert(`OTP ${code} Verified! Logged in successfully.`);
        }}
        phoneNumber="+91 98765 43210"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#FBFBFC',
  },
  roundIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  centerCapsule: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  centerCapsuleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1E1E',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartDotBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cartDotText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 110,
  },
  promoCard: {
    backgroundColor: '#1C1917',
    borderRadius: 28,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.md,
  },
  wingAccentLeft: {
    position: 'absolute',
    left: -4,
    top: '35%',
    width: 8,
    height: 45,
    backgroundColor: '#EC4899',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  wingAccentRight: {
    position: 'absolute',
    right: -4,
    top: '35%',
    width: 8,
    height: 45,
    backgroundColor: '#38BDF8',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  promoSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
    gap: 4,
  },
  discountPre: {
    color: '#E5E7EB',
    fontSize: 11,
    fontWeight: '800',
  },
  discountMain: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  offBadge: {
    backgroundColor: '#FF5E7E',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  offBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  promoCodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  promoCodeText: {
    color: '#FFC727',
    fontSize: 11,
    fontWeight: '800',
  },
  promoBurgerImage: {
    width: 105,
    height: 95,
    marginLeft: 10,
  },
  typeSwitcherRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typePill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  typePillActive: {
    backgroundColor: '#FFC727',
    borderColor: '#FFC727',
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  typePillTextActive: {
    color: '#1E1E1E',
    fontWeight: '900',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1E1E1E',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  cuisineScroll: {
    marginBottom: 16,
  },
  cuisineChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 24,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  cuisineChipSelected: {
    backgroundColor: '#1E1E1E',
    borderColor: '#1E1E1E',
  },
  cuisineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  cuisineTextSelected: {
    color: '#FFFFFF',
  },
  restaurantSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginVertical: 12,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1E1E',
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  resetFilterBtn: {
    backgroundColor: '#FFC727',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resetFilterBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E1E1E',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  gridImageContainer: {
    position: 'relative',
    width: '100%',
    height: 110,
    backgroundColor: '#F8FAFC',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  favRoundBtnSmall: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  dietaryMiniBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  dietaryMiniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  gridBody: {
    padding: 10,
  },
  gridCategoryBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E1E1E',
    marginBottom: 4,
  },
  gridPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  gridActualPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1E1E1E',
  },
  gridStrikethroughPrice: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF5E7E',
    textDecorationLine: 'line-through',
  },
  gridRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  gridRatingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E1E1E',
  },
  gridMetaText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
  },
  gridAddBtn: {
    backgroundColor: '#FFC727',
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  gridAddBtnText: {
    color: '#1E1E1E',
    fontSize: 11,
    fontWeight: '900',
  },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  prepBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  prepBadgeText: {
    color: '#1E1E1E',
    fontWeight: '800',
    fontSize: 10,
  },
  restaurantContent: {
    padding: 14,
  },
  restaurantTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1E1E1E',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#1E1E1E',
    fontWeight: '800',
    fontSize: 11,
  },
  cuisinesText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFC727',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.lg,
  },
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBadge: {
    backgroundColor: '#1E1E1E',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
  },
  cartBarTitle: {
    color: '#1E1E1E',
    fontWeight: '800',
    fontSize: 13,
  },
  cartBarSub: {
    color: 'rgba(30,30,30,0.7)',
    fontSize: 10,
    fontWeight: '600',
  },
  checkoutText: {
    color: '#1E1E1E',
    fontWeight: '800',
    fontSize: 13,
    marginRight: 2,
  },

  /* Item Customization Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 22,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1E1E1E',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImage: {
    width: '100%',
    height: 150,
    borderRadius: 20,
    marginBottom: 16,
  },
  optionSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1E1E',
    marginTop: 10,
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  optionChipActive: {
    backgroundColor: '#1E1E1E',
    borderColor: '#1E1E1E',
  },
  optionChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  optionChipTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 10,
  },
  modalQtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  modalQtyValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1E1E',
    paddingHorizontal: 12,
  },
  modalAddToCartBtn: {
    backgroundColor: '#FFC727',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  modalAddToCartText: {
    color: '#1E1E1E',
    fontWeight: '900',
    fontSize: 13,
  },
});
