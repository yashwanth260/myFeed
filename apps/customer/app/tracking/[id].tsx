import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Clock, MapPin, Phone, Star, ShieldCheck } from 'lucide-react-native';
import { COLORS, SHADOWS } from '@cravecart/shared-ui';
import { formatCurrencyPaise } from '@cravecart/shared-business-logic';
import { ORDER_STATUS_CONFIG } from '@cravecart/shared-config';
import { fetchOrderDetails } from '../../services/apiService';
import { supabase } from '../../services/supabase';

const TRACKING_STEPS = [
  { status: 'pending', title: 'Order Placed', desc: 'Sent to restaurant for confirmation' },
  { status: 'confirmed', title: 'Accepted', desc: 'Restaurant confirmed your order' },
  { status: 'preparing', title: 'Preparing Food', desc: 'Chef is cooking your meal' },
  { status: 'ready_for_pickup', title: 'Ready for Pickup', desc: 'Waiting for delivery partner' },
  { status: 'out_for_delivery', title: 'Out for Delivery', desc: 'Rider is on the way to you' },
  { status: 'delivered', title: 'Delivered', desc: 'Enjoy your food!' },
];

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['order-tracking', id],
    queryFn: () => fetchOrderDetails(id as string),
    refetchInterval: 5000, // Poll every 5s for updates
  });

  // Supabase Realtime Subscription
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`order-status-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (isLoading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  const currentStatusIndex = TRACKING_STEPS.findIndex((s) => s.status === order.order_status);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={COLORS.text} size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Track Order</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Order Status Banner */}
        <View style={styles.statusCard}>
          <Text style={styles.orderNum}>Order #{order.order_number}</Text>
          <Text style={styles.resName}>{order.restaurant?.name || 'Restaurant'}</Text>
          <Text style={styles.etaText}>Estimated Delivery in ~25-35 Mins</Text>
        </View>

        {/* Status Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.cardHeaderTitle}>Live Order Timeline</Text>

          {TRACKING_STEPS.map((step, idx) => {
            const isDone = idx <= currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;

            return (
              <View key={step.status} style={styles.timelineRow}>
                <View style={styles.timelineCol}>
                  <View
                    style={[
                      styles.circle,
                      isDone && styles.circleDone,
                      isCurrent && styles.circleCurrent,
                    ]}
                  >
                    {isDone ? (
                      <CheckCircle2 color="#FFF" size={16} />
                    ) : (
                      <View style={styles.circleInner} />
                    )}
                  </View>

                  {idx < TRACKING_STEPS.length - 1 && (
                    <View style={[styles.line, isDone && styles.lineDone]} />
                  )}
                </View>

                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, isDone && styles.stepTitleDone]}>
                    {step.title}
                  </Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Delivery Partner Details Card */}
        {['out_for_delivery', 'picked_up'].includes(order.order_status) && (
          <View style={styles.driverCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.driverAvatar}>
                <Text style={styles.avatarInit}>RK</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.driverName}>Rahul Kumar</Text>
                <Text style={styles.driverSub}>Delivery Partner • CraveCart Express</Text>
              </View>
              <TouchableOpacity style={styles.callBtn}>
                <Phone color="#10B981" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Review Action if Delivered */}
        {order.order_status === 'delivered' && (
          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={() => router.push(`/review/${order.id}`)}
          >
            <Star color="#FFF" size={20} fill="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.reviewBtnText}>Rate & Review Your Meal</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'center',
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
  statusCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
    ...SHADOWS.md,
  },
  orderNum: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '700',
  },
  resName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  etaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
    ...SHADOWS.sm,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 20,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineCol: {
    alignItems: 'center',
    marginRight: 16,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: {
    backgroundColor: '#16A34A',
  },
  circleCurrent: {
    backgroundColor: COLORS.primary,
  },
  circleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#94A3B8',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  lineDone: {
    backgroundColor: '#16A34A',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  stepTitleDone: {
    color: COLORS.text,
  },
  stepDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  driverCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    ...SHADOWS.sm,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInit: {
    color: '#065F46',
    fontWeight: '800',
    fontSize: 16,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  driverSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewBtn: {
    backgroundColor: '#16A34A',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  reviewBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
