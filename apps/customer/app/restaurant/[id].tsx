import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Star, Clock, Plus, Minus, ChevronRight, ShoppingBag } from 'lucide-react-native';
import { COLORS, SHADOWS } from '@cravecart/shared-ui';
import { formatCurrencyPaise } from '@cravecart/shared-business-logic';
import { fetchRestaurantById, fetchMenuForRestaurant } from '../../services/apiService';
import { useCartStore } from '../../store/cartStore';

export default function RestaurantDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const cartStore = useCartStore();

  const { data: restaurant, isLoading: resLoading } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => fetchRestaurantById(id as string),
  });

  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ['menu', id],
    queryFn: () => fetchMenuForRestaurant(id as string),
  });

  if (resLoading || menuLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 18, color: COLORS.text }}>Restaurant not found</Text>
      </View>
    );
  }

  const cartItemCount = cartStore.items.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddToCart = (item: any) => {
    const success = cartStore.addItem(restaurant, item, 1, []);
    if (!success) {
      Alert.alert(
        'Replace cart items?',
        `Your cart contains items from another restaurant. Would you like to reset your cart to add items from ${restaurant.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear & Add',
            style: 'destructive',
            onPress: () => {
              cartStore.clearCart();
              cartStore.addItem(restaurant, item, 1, []);
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: restaurant.banner_url || restaurant.logo_url }} style={styles.banner} />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={COLORS.text} size={22} />
          </TouchableOpacity>
        </View>

        {/* Restaurant Header */}
        <View style={styles.detailsHeader}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.title}>{restaurant.name}</Text>
              <Text style={styles.cuisines}>{restaurant.cuisine_types.join(' • ')}</Text>
              <Text style={styles.address}>{restaurant.address}, {restaurant.city}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Star color="#FFF" size={14} fill="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.ratingText}>{restaurant.rating}</Text>
              <Text style={styles.ratingCount}>({restaurant.rating_count})</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Clock color={COLORS.textMuted} size={14} style={{ marginRight: 4 }} />
              <Text style={styles.metaText}>{restaurant.estimated_prep_time_minutes} mins prep</Text>
            </View>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.metaText}>Delivery {formatCurrencyPaise(restaurant.base_delivery_fee_paise)}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuHeading}>Menu ({menuData?.items.length || 0} items)</Text>

          {menuData?.items.map((item) => {
            const existingCartItem = cartStore.items.find((i) => i.menuItem.id === item.id);
            const qty = existingCartItem ? existingCartItem.quantity : 0;

            return (
              <View key={item.id} style={styles.foodCard}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <View
                      style={[
                        styles.dietaryTag,
                        { borderColor: item.dietary_type === 'veg' ? COLORS.veg : COLORS.nonVeg },
                      ]}
                    >
                      <View
                        style={[
                          styles.dietaryDot,
                          { backgroundColor: item.dietary_type === 'veg' ? COLORS.veg : COLORS.nonVeg },
                        ]}
                      />
                    </View>
                    {item.is_recommended && (
                      <View style={styles.bestsellerTag}>
                        <Text style={styles.bestsellerText}>★ Bestseller</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodPrice}>{formatCurrencyPaise(item.price_paise)}</Text>
                  <Text style={styles.foodDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>

                <View style={styles.imageCol}>
                  <Image source={{ uri: item.image_url }} style={styles.foodImg} />
                  
                  {qty > 0 ? (
                    <View style={styles.qtyControl}>
                      <TouchableOpacity onPress={() => cartStore.updateQuantity(item.id, qty - 1)}>
                        <Minus color={COLORS.primary} size={16} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{qty}</Text>
                      <TouchableOpacity onPress={() => handleAddToCart(item)}>
                        <Plus color={COLORS.primary} size={16} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.addBtn} onPress={() => handleAddToCart(item)}>
                      <Text style={styles.addBtnText}>ADD</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Cart Bar */}
      {cartItemCount > 0 && (
        <TouchableOpacity
          style={styles.floatingCartBar}
          onPress={() => router.push('/cart')}
          activeOpacity={0.9}
        >
          <View style={styles.cartInfo}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
            <View>
              <Text style={styles.cartBarTitle}>View Cart</Text>
              <Text style={styles.cartBarSub}>
                {formatCurrencyPaise(cartStore.getSubtotalPaise())} plus taxes
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.checkoutText}>Checkout</Text>
            <ChevronRight color="#FFF" size={20} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  bannerContainer: {
    position: 'relative',
    height: 200,
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  detailsHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginTop: -24,
    marginHorizontal: 16,
    padding: 20,
    ...SHADOWS.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  cuisines: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  address: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
  },
  ratingBadge: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
  },
  ratingText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  ratingCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginLeft: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  dot: {
    marginHorizontal: 8,
    color: COLORS.textLight,
  },
  menuContainer: {
    padding: 16,
    marginTop: 8,
  },
  menuHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
  },
  foodCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  dietaryTag: {
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  dietaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bestsellerTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bestsellerText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '700',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  foodPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 4,
  },
  foodDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  imageCol: {
    alignItems: 'center',
  },
  foodImg: {
    width: 90,
    height: 90,
    borderRadius: 14,
  },
  addBtn: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
  addBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  qtyControl: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
  qtyText: {
    fontWeight: '800',
    color: COLORS.primary,
    marginHorizontal: 10,
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  cartBarTitle: {
    color: '#1E1E1E',
    fontWeight: '800',
    fontSize: 15,
  },
  cartBarSub: {
    color: 'rgba(30,30,30,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  checkoutText: {
    color: '#1E1E1E',
    fontWeight: '800',
    fontSize: 16,
    marginRight: 4,
  },
});
