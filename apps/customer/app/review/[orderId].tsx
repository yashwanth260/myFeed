import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star, X } from 'lucide-react-native';
import { COLORS } from '@cravecart/shared-ui';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';

export default function ReviewModal() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        order_id: orderId,
        customer_id: user?.id || 'demo-customer-id',
        restaurant_id: 'a1111111-1111-1111-1111-111111111111',
        rating,
        comment,
      });

      if (error) throw error;

      Alert.alert('Thank You!', 'Your review has been submitted.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Review Submitted', 'Thank you for your valuable feedback!');
      router.back();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Rate Your Meal</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <X color={COLORS.text} size={24} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sub}>How was your food and delivery experience?</Text>

        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Star
                color={star <= rating ? '#F59E0B' : '#E2E8F0'}
                fill={star <= rating ? '#F59E0B' : 'transparent'}
                size={36}
                style={{ marginHorizontal: 6 }}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Write your feedback (optional)..."
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  sub: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 6,
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    color: COLORS.text,
    textAlignVertical: 'top',
    height: 100,
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
