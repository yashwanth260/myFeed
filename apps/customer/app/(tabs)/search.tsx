import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Search, Star, Clock, Filter, Leaf, ShoppingBag } from 'lucide-react-native';
import { COLORS, SHADOWS } from '@cravecart/shared-ui';
import { formatCurrencyPaise } from '@cravecart/shared-business-logic';
import { fetchRestaurants } from '../../services/apiService';
import { PRODUCTS_BY_TYPE } from './index';

export default function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<'all' | 'food' | 'meat' | 'mart'>('all');
  const [vegOnly, setVegOnly] = useState(false);
  const [minRating, setMinRating] = useState(false);

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants-explore', query],
    queryFn: () => fetchRestaurants(query),
  });

  const filteredRestaurants = (restaurants || []).filter((r) => {
    if (minRating && r.rating < 4.5) return false;
    return true;
  });

  // Pull items from all or selected section
  const allProducts = [
    ...(selectedSection === 'all' || selectedSection === 'food' ? PRODUCTS_BY_TYPE.food : []),
    ...(selectedSection === 'all' || selectedSection === 'meat' ? PRODUCTS_BY_TYPE.meat : []),
    ...(selectedSection === 'all' || selectedSection === 'mart' ? PRODUCTS_BY_TYPE.mart : []),
  ];

  const filteredProducts = allProducts.filter((p) => {
    if (vegOnly && p.dietaryType !== 'veg') return false;
    if (minRating && p.rating < 4.7) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore & Search</Text>

      <View style={styles.searchBox}>
        <Search color={COLORS.textMuted} size={20} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.input}
          placeholder="Search food, meat cuts, mart essentials..."
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Main Section Filter Tabs */}
      <View style={styles.sectionTabRow}>
        {[
          { id: 'all', label: 'All Items' },
          { id: 'food', label: 'Food Item' },
          { id: 'meat', label: 'Feedo Meat' },
          { id: 'mart', label: 'Feedo Mart' },
        ].map((tab) => {
          const isActive = selectedSection === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.sectionTabBtn, isActive && styles.sectionTabBtnActive]}
              onPress={() => setSelectedSection(tab.id as any)}
              activeOpacity={0.8}
            >
              <Text style={[styles.sectionTabText, isActive && styles.sectionTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Filter Row: Veg & Rating */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <TouchableOpacity
          style={[styles.filterChip, vegOnly && styles.filterChipActive]}
          onPress={() => setVegOnly(!vegOnly)}
        >
          <Leaf color={vegOnly ? '#FFF' : '#10B981'} size={15} style={{ marginRight: 5 }} />
          <Text style={[styles.filterText, vegOnly && styles.filterTextActive]}>Pure Veg</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, minRating && styles.filterChipActive]}
          onPress={() => setMinRating(!minRating)}
        >
          <Star color={minRating ? '#FFF' : '#F59E0B'} size={15} style={{ marginRight: 5 }} />
          <Text style={[styles.filterText, minRating && styles.filterTextActive]}>Top Rated (4.7+)</Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Products Section */}
        <Text style={styles.sectionHeader}>
          Matching Products ({filteredProducts.length})
        </Text>

        {filteredProducts.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.productCard}
            onPress={() => router.push('/')}
            activeOpacity={0.88}
          >
            <Image source={{ uri: p.imageUrl }} style={styles.productImg} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.productTitle}>{p.name}</Text>
                <View style={styles.ratingBadge}>
                  <Star color="#FFF" size={11} fill="#FFF" style={{ marginRight: 2 }} />
                  <Text style={styles.ratingText}>{p.rating}</Text>
                </View>
              </View>
              <Text style={styles.categoryTag}>{p.category} • {p.deliveryTime}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.actualPrice}>{formatCurrencyPaise(p.pricePaise)}</Text>
                <Text style={styles.strikethroughPrice}>{formatCurrencyPaise(p.originalPricePaise)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Restaurants / Hubs */}
        <Text style={[styles.sectionHeader, { marginTop: 20 }]}>
          Kitchens & Delivery Hubs
        </Text>

        {filteredRestaurants.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={styles.card}
            onPress={() => router.push(`/restaurant/${r.id}`)}
          >
            <Image source={{ uri: r.logo_url }} style={styles.cardImage} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.cardTitle}>{r.name}</Text>
                <View style={styles.ratingBadge}>
                  <Star color="#FFF" size={11} fill="#FFF" style={{ marginRight: 2 }} />
                  <Text style={styles.ratingText}>{r.rating}</Text>
                </View>
              </View>
              <Text style={styles.cuisines}>{r.cuisine_types.join(', ')}</Text>
              <Text style={styles.meta}>
                {r.estimated_prep_time_minutes} mins • Delivery {formatCurrencyPaise(r.base_delivery_fee_paise)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E1E1E',
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1E1E1E',
  },
  sectionTabRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  sectionTabBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTabBtnActive: {
    backgroundColor: '#FFC727',
    borderColor: '#FFC727',
  },
  sectionTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  sectionTabTextActive: {
    color: '#1E1E1E',
    fontWeight: '900',
  },
  filterScroll: {
    maxHeight: 38,
    marginBottom: 14,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#1E1E1E',
    borderColor: '#1E1E1E',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1E1E1E',
    marginBottom: 10,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  productImg: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1E1E',
    flex: 1,
    marginRight: 6,
  },
  categoryTag: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  actualPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1E1E1E',
  },
  strikethroughPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5E7E',
    textDecorationLine: 'line-through',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1E1E',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 10,
  },
  cuisines: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  meta: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
});
