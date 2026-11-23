import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, CreditCard, Banknote, ShieldCheck } from 'lucide-react-native';
import { COLORS, SHADOWS } from '@cravecart/shared-ui';
import { formatCurrencyPaise, calculateOrderPricing } from '@cravecart/shared-business-logic';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { createOrder } from '../services/apiService';

export default function CheckoutScreen() {
  const router = useRouter();
  const cartStore = useCartStore();
  const user = useAuthStore((s) => s.user);

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  const restaurant = cartStore.restaurant;
  const items = cartStore.items;

  if (!restaurant || items.length === 0) {
    router.replace('/(tabs)');
    return null;
  }

  const pricing = calculateOrderPricing({
    items: items.map((i) => ({
      unit_price_paise: i.unit_price_paise,
      quantity: i.quantity,
      customization_total_paise: i.customizations.reduce((acc, c) => acc + c.price_paise, 0),
    })),
    baseDeliveryFeePaise: restaurant.base_delivery_fee_paise || 4000,
    freeDeliveryThresholdPaise: restaurant.free_delivery_threshold_paise,
    coupon: cartStore.couponCode
      ? ({
          id: 'c-1',
          code: cartStore.couponCode,
          discount_type: 'percentage',
          discount_value: 50,
          max_discount_paise: 10000,
          min_order_amount_paise: 0,
          valid_from: '2026-01-01',
          valid_until: '2027-12-31',
          usage_limit_per_user: 1,
          is_active: true,
          created_at: new Date().toISOString(),
        } as any)
      : null,
  });

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      const addressSnapshot = {
        full_address: '42 MG Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postal_code: '560038',
        delivery_instructions: deliveryInstructions,
      };

      const orderPayload = {
        customer_id: user?.id || 'demo-customer-id',
        restaurant_id: restaurant.id,
        address_snapshot: addressSnapshot,
        payment_method: paymentMethod,
        subtotal_paise: pricing.subtotal_paise,
        discount_paise: pricing.discount_paise,
        delivery_fee_paise: pricing.delivery_fee_paise,
        service_fee_paise: pricing.service_fee_paise,
        tax_paise: pricing.tax_paise,
        final_total_paise: pricing.final_total_paise,
        coupon_code: cartStore.couponCode,
        items,
      };

      const created = await createOrder(orderPayload);
      cartStore.clearCart();

      Alert.alert(
        'Order Placed Successfully! 🎉',
        `Order #${created.order_number} has been sent to ${restaurant.name}.`,
        [
          {
            text: 'Track Order',
            onPress: () => router.replace(`/tracking/${created.id}`),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Order Placement Failed', err.message || 'Failed to place order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={COLORS.text} size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* Delivery Address Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <MapPin color={COLORS.primary} size={20} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Delivery Address</Text>
          </View>
          <Text style={styles.addressName}>Home • 42 MG Road</Text>
          <Text style={styles.addressSub}>Indiranagar, Bengaluru, Karnataka - 560038</Text>

          <TextInput
            style={styles.instructionInput}
            placeholder="Add delivery instructions (e.g. Leave at door, ring bell)..."
            value={deliveryInstructions}
            onChangeText={setDeliveryInstructions}
          />
        </View>

        {/* Payment Method Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'razorpay' && styles.paymentActive]}
            onPress={() => setPaymentMethod('razorpay')}
          >
            <CreditCard color={paymentMethod === 'razorpay' ? COLORS.primary : COLORS.textMuted} size={22} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.payTitle}>Razorpay Online Payment</Text>
              <Text style={styles.paySub}>UPI, Credit/Debit Cards, NetBanking (Test Mode)</Text>
            </View>
            {paymentMethod === 'razorpay' && <View style={styles.radioDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentActive]}
            onPress={() => setPaymentMethod('cod')}
          >
            <Banknote color={paymentMethod === 'cod' ? COLORS.primary : COLORS.textMuted} size={22} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.payTitle}>Cash on Delivery</Text>
              <Text style={styles.paySub}>Pay with cash upon order arrival</Text>
            </View>
            {paymentMethod === 'cod' && <View style={styles.radioDot} />}
          </TouchableOpacity>
        </View>

        {/* Order Summary Snapshot */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary ({items.length} items)</Text>
          <Text style={styles.resName}>{restaurant.name}</Text>

          {items.map((i) => (
            <View key={i.menuItem.id} style={styles.summaryItem}>
              <Text style={styles.summaryItemName}>
                {i.quantity}x {i.menuItem.name}
              </Text>
              <Text style={styles.summaryItemPrice}>{formatCurrencyPaise(i.line_total_paise)}</Text>
            </View>
          ))}

          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>{formatCurrencyPaise(pricing.final_total_paise)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Pay & Place Order Button */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.footerAmount}>{formatCurrencyPaise(pricing.final_total_paise)}</Text>
        </View>
        <TouchableOpacity
          style={styles.payBtn}
          onPress={handlePlaceOrder}
          disabled={placingOrder}
        >
          {placingOrder ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.payBtnText}>
              {paymentMethod === 'razorpay' ? 'Pay & Place Order' : 'Confirm Order'}
            </Text>
          )}
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
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  addressSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  instructionInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.text,
    marginTop: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  paymentActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF5F5',
  },
  payTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  paySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
  },
  resName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryItemName: {
    fontSize: 14,
    color: COLORS.text,
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  footer: {
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
  payBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  payBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
