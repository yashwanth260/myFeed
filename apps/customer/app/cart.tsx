import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trash2, Plus, Minus, Tag, Check, ShieldCheck } from 'lucide-react-native';
import { COLORS, SHADOWS } from '@cravecart/shared-ui';
import { formatCurrencyPaise, calculateOrderPricing } from '@cravecart/shared-business-logic';
import { useCartStore } from '../store/cartStore';

export default function CartScreen() {
  const router = useRouter();
  const cartStore = useCartStore();

  const [inputCoupon, setInputCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(cartStore.couponCode);

  const restaurant = cartStore.restaurant;
  const items = cartStore.items;

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
        <Text style={styles.emptySub}>Add delicious items from your favorite restaurants!</Text>
        <TouchableOpacity style={styles.exploreBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.exploreBtnText}>Browse Restaurants</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate pricing using shared business logic
  const couponObj = appliedCoupon
    ? {
        id: 'c-1',
        code: appliedCoupon,
        description: 'Applied Coupon',
        discount_type: (appliedCoupon === 'WELCOME50' ? 'percentage' : 'flat') as any,
        discount_value: appliedCoupon === 'WELCOME50' ? 50 : 5000,
        max_discount_paise: appliedCoupon === 'WELCOME50' ? 10000 : null,
        min_order_amount_paise: 0,
        valid_from: '2026-01-01',
        valid_until: '2027-12-31',
        usage_limit_per_user: 1,
        is_active: true,
        created_at: new Date().toISOString(),
      }
    : null;

  const pricing = calculateOrderPricing({
    items: items.map((i) => ({
      unit_price_paise: i.unit_price_paise,
      quantity: i.quantity,
      customization_total_paise: i.customizations.reduce((acc, c) => acc + c.price_paise, 0),
    })),
    baseDeliveryFeePaise: restaurant?.base_delivery_fee_paise || 4000,
    freeDeliveryThresholdPaise: restaurant?.free_delivery_threshold_paise,
    minOrderAmountPaise: restaurant?.min_order_amount_paise,
    coupon: couponObj,
  });

  const handleApplyCoupon = () => {
    const code = inputCoupon.trim().toUpperCase();
    if (!code) return;

    if (['WELCOME50', 'CRAVE20', 'FREEDEL'].includes(code)) {
      setAppliedCoupon(code);
      cartStore.applyCoupon(code);
      Alert.alert('Coupon Applied!', `Saved ${formatCurrencyPaise(pricing.discount_paise)} on this order.`);
    } else {
      Alert.alert('Invalid Coupon', 'Please enter a valid coupon code like WELCOME50 or CRAVE20');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={COLORS.text} size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Your Cart</Text>
        <TouchableOpacity onPress={() => cartStore.clearCart()}>
          <Trash2 color="#EF4444" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* Restaurant Header */}
        <View style={styles.restaurantHeader}>
          <Text style={styles.resName}>{restaurant?.name || 'Restaurant'}</Text>
          <Text style={styles.resAddress}>{restaurant?.address}</Text>
        </View>

        {/* Cart Items List */}
        <View style={styles.section}>
          {items.map((item) => (
            <View key={item.menuItem.id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.menuItem.name}</Text>
                <Text style={styles.itemPrice}>{formatCurrencyPaise(item.line_total_paise)}</Text>
              </View>

              <View style={styles.qtyBox}>
                <TouchableOpacity
                  onPress={() => cartStore.updateQuantity(item.menuItem.id, item.quantity - 1)}
                >
                  <Minus color={COLORS.primary} size={16} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => cartStore.updateQuantity(item.menuItem.id, item.quantity + 1)}
                >
                  <Plus color={COLORS.primary} size={16} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Coupon Code Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Offers & Coupons</Text>
          <View style={styles.couponRow}>
            <Tag color={COLORS.primary} size={20} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.couponInput}
              placeholder="Enter Coupon Code (e.g. WELCOME50)"
              value={inputCoupon}
              onChangeText={setInputCoupon}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCoupon}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
          {appliedCoupon && (
            <View style={styles.appliedBanner}>
              <Check color="#16A34A" size={16} style={{ marginRight: 6 }} />
              <Text style={styles.appliedText}>Code '{appliedCoupon}' Applied</Text>
            </View>
          )}
        </View>

        {/* Bill Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bill Details</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Subtotal</Text>
            <Text style={styles.billValue}>{formatCurrencyPaise(pricing.subtotal_paise)}</Text>
          </View>

          {pricing.discount_paise > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: '#16A34A' }]}>Coupon Discount</Text>
              <Text style={[styles.billValue, { color: '#16A34A' }]}>
                -{formatCurrencyPaise(pricing.discount_paise)}
              </Text>
            </View>
          )}

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValue}>
              {pricing.delivery_fee_paise === 0 ? 'FREE' : formatCurrencyPaise(pricing.delivery_fee_paise)}
            </Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Service Fee</Text>
            <Text style={styles.billValue}>{formatCurrencyPaise(pricing.service_fee_paise)}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Taxes & Charges (5% GST)</Text>
            <Text style={styles.billValue}>{formatCurrencyPaise(pricing.tax_paise)}</Text>
          </View>

          <View style={styles.totalDivider} />

          <View style={styles.billRow}>
            <Text style={styles.grandTotalLabel}>To Pay</Text>
            <Text style={styles.grandTotalValue}>{formatCurrencyPaise(pricing.final_total_paise)}</Text>
          </View>
        </View>

        <View style={styles.guaranteeRow}>
          <ShieldCheck color="#10B981" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.guaranteeText}>100% Hygienic & Safe Food Delivery Guarantee</Text>
        </View>
      </ScrollView>

      {/* Fixed Checkout Bar */}
      <View style={styles.checkoutFooter}>
        <View>
          <Text style={styles.footerLabel}>TOTAL</Text>
          <Text style={styles.footerAmount}>{formatCurrencyPaise(pricing.final_total_paise)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => router.push('/checkout')}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    ...SHADOWS.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  exploreBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  restaurantHeader: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 16,
  },
  resName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  resAddress: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtyText: {
    fontWeight: '800',
    color: COLORS.primary,
    marginHorizontal: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  couponInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  appliedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  appliedText: {
    color: '#16A34A',
    fontWeight: '700',
    fontSize: 13,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  billLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  billValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  grandTotalLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
  },
  guaranteeText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  checkoutFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    ...SHADOWS.md,
  },
  footerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  footerAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  checkoutBtnText: {
    color: '#1E1E1E',
    fontWeight: '800',
    fontSize: 16,
  },
});
