import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, ChevronRight, RefreshCw, Star } from 'lucide-react-native';
import { COLORS, SHADOWS } from '@cravecart/shared-ui';
import { formatCurrencyPaise } from '@cravecart/shared-business-logic';
import { ORDER_STATUS_CONFIG } from '@cravecart/shared-config';
import { fetchCustomerOrders } from '../../services/apiService';
import { useAuthStore } from '../../store/authStore';

export default function CustomerOrdersScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['customer-orders', user?.id],
    queryFn: () => fetchCustomerOrders(user?.id || 'demo-customer-id'),
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Orders</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <RefreshCw color={COLORS.textMuted} size={20} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 40 }} />
      ) : !orders || orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ShoppingBag color={COLORS.textLight} size={64} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySub}>Explore top restaurants and place your first order!</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {orders.map((order) => {
            const statusConfig = (ORDER_STATUS_CONFIG as any)[order.order_status] || {
              label: order.order_status,
              color: '#6B7280',
              bgColor: '#F3F4F6',
            };
            const isActive = !['delivered', 'rejected', 'cancelled'].includes(order.order_status);

            return (
              <TouchableOpacity
                key={order.id}
                style={[styles.orderCard, isActive && styles.activeCard]}
                onPress={() => router.push(`/tracking/${order.id}`)}
                activeOpacity={0.9}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.restaurantName}>
                    {order.restaurant?.name || 'Restaurant'}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.orderMeta}>
                  Order #{order.order_number} • {new Date(order.created_at).toLocaleDateString()}
                </Text>

                <View style={styles.divider} />

                <View style={styles.cardFooter}>
                  <Text style={styles.totalText}>
                    {formatCurrencyPaise(order.final_total_paise)}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.trackText}>{isActive ? 'Track Live' : 'View Details'}</Text>
                    <ChevronRight color={COLORS.primary} size={18} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
    paddingTop: 52,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  orderMeta: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  trackText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 2,
  },
});
