import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { User, MapPin, CreditCard, Bell, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { COLORS, SHADOWS } from '@cravecart/shared-ui';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../services/supabase';

export default function CustomerProfileScreen() {
  const router = useRouter();
  const { profile, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    clearAuth();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* User Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <User color="#FFF" size={36} />
        </View>
        <Text style={styles.name}>{profile?.full_name || 'Alex Johnson'}</Text>
        <Text style={styles.phone}>{profile?.phone_number || '+91 9876543210'}</Text>
      </View>

      {/* Options List */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.row}>
          <MapPin color={COLORS.primary} size={20} style={{ marginRight: 14 }} />
          <Text style={styles.rowLabel}>Saved Addresses</Text>
          <ChevronRight color={COLORS.textLight} size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <CreditCard color={COLORS.primary} size={20} style={{ marginRight: 14 }} />
          <Text style={styles.rowLabel}>Payment Methods</Text>
          <ChevronRight color={COLORS.textLight} size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Bell color={COLORS.primary} size={20} style={{ marginRight: 14 }} />
          <Text style={styles.rowLabel}>Notifications</Text>
          <ChevronRight color={COLORS.textLight} size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <HelpCircle color={COLORS.primary} size={20} style={{ marginRight: 14 }} />
          <Text style={styles.rowLabel}>Help & Support</Text>
          <ChevronRight color={COLORS.textLight} size={20} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut color="#EF4444" size={20} style={{ marginRight: 10 }} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
    paddingTop: 52,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...SHADOWS.md,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  phone: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
    ...SHADOWS.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    height: 52,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
});
