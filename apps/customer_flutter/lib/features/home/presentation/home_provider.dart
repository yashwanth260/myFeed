import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/mock_feedo_data.dart';
import '../domain/category_model.dart';
import '../../restaurant/domain/restaurant_model.dart';
import 'package:feedo_customer/core/theme/theme_provider.dart';
import 'package:feedo_customer/core/storage/local_storage_service.dart';

final categoriesProvider = Provider<List<CategoryModel>>((ref) {
  return MockFeedoData.categories;
});

final allRestaurantsProvider = Provider<List<RestaurantModel>>((ref) {
  return MockFeedoData.restaurants;
});

final selectedCategoryProvider = StateProvider<String?>((ref) => null);

final selectedAddressProvider = StateProvider<String>((ref) {
  final storage = ref.watch(localStorageServiceProvider);
  return storage.selectedAddress ?? 'Indiranagar, 42 MG Road, Bengaluru';
});

// Favorites Provider
final favoritesProvider = StateNotifierProvider<FavoritesNotifier, List<String>>((ref) {
  final storage = ref.watch(localStorageServiceProvider);
  return FavoritesNotifier(storage);
});

class FavoritesNotifier extends StateNotifier<List<String>> {
  final LocalStorageService _storage;

  FavoritesNotifier(this._storage) : super(_storage.favorites);

  void toggleFavorite(String restaurantId) {
    if (state.contains(restaurantId)) {
      state = state.where((id) => id != restaurantId).toList();
    } else {
      state = [...state, restaurantId];
    }
    _storage.setFavorites(state);
  }

  bool isFavorite(String restaurantId) => state.contains(restaurantId);
}

// Filter Options
class SearchFilterState {
  final String searchQuery;
  final bool vegOnly;
  final double minRating;
  final int? maxDeliveryTime;
  final String sortBy; // 'rating', 'deliveryTime', 'costLowToHigh'

  const SearchFilterState({
    this.searchQuery = '',
    this.vegOnly = false,
    this.minRating = 0.0,
    this.maxDeliveryTime,
    this.sortBy = 'rating',
  });

  SearchFilterState copyWith({
    String? searchQuery,
    bool? vegOnly,
    double? minRating,
    int? maxDeliveryTime,
    String? sortBy,
  }) {
    return SearchFilterState(
      searchQuery: searchQuery ?? this.searchQuery,
      vegOnly: vegOnly ?? this.vegOnly,
      minRating: minRating ?? this.minRating,
      maxDeliveryTime: maxDeliveryTime ?? this.maxDeliveryTime,
      sortBy: sortBy ?? this.sortBy,
    );
  }
}

final searchFilterProvider = StateNotifierProvider<SearchFilterNotifier, SearchFilterState>((ref) {
  return SearchFilterNotifier();
});

class SearchFilterNotifier extends StateNotifier<SearchFilterState> {
  SearchFilterNotifier() : super(const SearchFilterState());

  void setSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
  }

  void toggleVegOnly() {
    state = state.copyWith(vegOnly: !state.vegOnly);
  }

  void setMinRating(double rating) {
    state = state.copyWith(minRating: rating);
  }

  void setMaxDeliveryTime(int? minutes) {
    state = state.copyWith(maxDeliveryTime: minutes);
  }

  void setSortBy(String sortBy) {
    state = state.copyWith(sortBy: sortBy);
  }

  void resetFilters() {
    state = SearchFilterState(searchQuery: state.searchQuery);
  }
}

// Filtered Restaurants
final filteredRestaurantsProvider = Provider<List<RestaurantModel>>((ref) {
  final all = ref.watch(allRestaurantsProvider);
  final filter = ref.watch(searchFilterProvider);
  final selectedCat = ref.watch(selectedCategoryProvider);

  return all.where((r) {
    // 1. Category match
    if (selectedCat != null) {
      final matchesCat = r.cuisines.any((c) => c.toLowerCase().contains(selectedCat.toLowerCase())) ||
          r.menuItems.any((m) => m.category.toLowerCase().contains(selectedCat.toLowerCase()));
      if (!matchesCat) return false;
    }

    // 2. Search query match
    if (filter.searchQuery.isNotEmpty) {
      final q = filter.searchQuery.toLowerCase();
      final nameMatches = r.name.toLowerCase().contains(q);
      final cuisineMatches = r.cuisines.any((c) => c.toLowerCase().contains(q));
      final menuMatches = r.menuItems.any((m) => m.name.toLowerCase().contains(q) || m.description.toLowerCase().contains(q));
      if (!nameMatches && !cuisineMatches && !menuMatches) return false;
    }

    // 3. Veg only
    if (filter.vegOnly) {
      final hasVeg = r.menuItems.any((m) => m.dietaryType == DietaryType.veg);
      if (!hasVeg) return false;
    }

    // 4. Min Rating
    if (r.rating < filter.minRating) return false;

    // 5. Max Delivery Time
    if (filter.maxDeliveryTime != null && r.deliveryTimeMinutes > filter.maxDeliveryTime!) {
      return false;
    }

    return true;
  }).toList()
    ..sort((a, b) {
      if (filter.sortBy == 'rating') {
        return b.rating.compareTo(a.rating);
      } else if (filter.sortBy == 'deliveryTime') {
        return a.deliveryTimeMinutes.compareTo(b.deliveryTimeMinutes);
      }
      return 0;
    });
});
