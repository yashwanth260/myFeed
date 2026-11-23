import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/cart_item_model.dart';
import '../../restaurant/domain/restaurant_model.dart';
import '../../offers/domain/coupon_model.dart';
import '../../home/data/mock_feedo_data.dart';
import 'package:feedo_customer/core/constants/app_constants.dart';

class CartState {
  final RestaurantModel? restaurant;
  final List<CartItemModel> items;
  final CouponModel? appliedCoupon;
  final String? deliveryInstructions;

  const CartState({
    this.restaurant,
    this.items = const [],
    this.appliedCoupon,
    this.deliveryInstructions,
  });

  int get totalItemCount => items.fold(0, (sum, item) => sum + item.quantity);

  double get subtotal => items.fold(0.0, (sum, item) => sum + item.totalPrice);

  double get deliveryFee {
    if (items.isEmpty) return 0.0;
    if (subtotal >= AppConstants.freeDeliveryThreshold) return 0.0;
    if (appliedCoupon?.code == 'FREEDEL') return 0.0;
    return restaurant?.baseDeliveryFee ?? AppConstants.defaultDeliveryFee;
  }

  double get platformFee => items.isEmpty ? 0.0 : AppConstants.platformFee;

  double get taxes => items.isEmpty ? 0.0 : (subtotal * AppConstants.taxPercentage);

  double get discount {
    if (appliedCoupon == null) return 0.0;
    return appliedCoupon!.calculateDiscount(subtotal);
  }

  double get grandTotal {
    if (items.isEmpty) return 0.0;
    final total = subtotal + deliveryFee + platformFee + taxes - discount;
    return total < 0 ? 0.0 : total;
  }

  CartState copyWith({
    RestaurantModel? restaurant,
    List<CartItemModel>? items,
    CouponModel? appliedCoupon,
    bool clearCoupon = false,
    String? deliveryInstructions,
  }) {
    return CartState(
      restaurant: restaurant ?? this.restaurant,
      items: items ?? this.items,
      appliedCoupon: clearCoupon ? null : (appliedCoupon ?? this.appliedCoupon),
      deliveryInstructions: deliveryInstructions ?? this.deliveryInstructions,
    );
  }
}

final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier();
});

class CartNotifier extends StateNotifier<CartState> {
  CartNotifier() : super(const CartState());

  /// Returns true if item added, false if restaurant mismatch needs confirmation
  bool addItem({
    required RestaurantModel restaurant,
    required MenuItemModel item,
    List<CustomizationOption> options = const [],
    String? instructions,
  }) {
    // If cart has items from another restaurant, ask for reset
    if (state.restaurant != null && state.restaurant!.id != restaurant.id && state.items.isNotEmpty) {
      return false; // Triggers conflict dialog
    }

    final existingIndex = state.items.indexWhere((c) =>
        c.item.id == item.id &&
        _areOptionsEqual(c.selectedOptions, options));

    List<CartItemModel> updatedList;
    if (existingIndex >= 0) {
      final existing = state.items[existingIndex];
      final updated = existing.copyWith(quantity: existing.quantity + 1);
      updatedList = List.from(state.items)..[existingIndex] = updated;
    } else {
      final newItem = CartItemModel(
        id: 'cart_${DateTime.now().millisecondsSinceEpoch}_${item.id}',
        item: item,
        quantity: 1,
        selectedOptions: options,
        specialInstructions: instructions,
      );
      updatedList = [...state.items, newItem];
    }

    state = state.copyWith(
      restaurant: restaurant,
      items: updatedList,
    );
    return true;
  }

  void forceAddItem({
    required RestaurantModel restaurant,
    required MenuItemModel item,
    List<CustomizationOption> options = const [],
  }) {
    clearCart();
    addItem(restaurant: restaurant, item: item, options: options);
  }

  void incrementQuantity(String cartItemId) {
    final index = state.items.indexWhere((i) => i.id == cartItemId);
    if (index >= 0) {
      final item = state.items[index];
      final updated = item.copyWith(quantity: item.quantity + 1);
      final updatedList = List<CartItemModel>.from(state.items)..[index] = updated;
      state = state.copyWith(items: updatedList);
    }
  }

  void decrementQuantity(String cartItemId) {
    final index = state.items.indexWhere((i) => i.id == cartItemId);
    if (index >= 0) {
      final item = state.items[index];
      if (item.quantity > 1) {
        final updated = item.copyWith(quantity: item.quantity - 1);
        final updatedList = List<CartItemModel>.from(state.items)..[index] = updated;
        state = state.copyWith(items: updatedList);
      } else {
        removeItem(cartItemId);
      }
    }
  }

  void removeItem(String cartItemId) {
    final updatedList = state.items.where((i) => i.id != cartItemId).toList();
    if (updatedList.isEmpty) {
      state = const CartState();
    } else {
      state = state.copyWith(items: updatedList);
    }
  }

  bool applyCoupon(String code) {
    final coupon = MockFeedoData.coupons.cast<CouponModel?>().firstWhere(
      (c) => c?.code.toUpperCase() == code.trim().toUpperCase(),
      orElse: () => null,
    );

    if (coupon != null && state.subtotal >= coupon.minOrderAmount) {
      state = state.copyWith(appliedCoupon: coupon);
      return true;
    }
    return false;
  }

  void removeCoupon() {
    state = state.copyWith(clearCoupon: true);
  }

  void setDeliveryInstructions(String notes) {
    state = state.copyWith(deliveryInstructions: notes);
  }

  void clearCart() {
    state = const CartState();
  }

  bool _areOptionsEqual(List<CustomizationOption> a, List<CustomizationOption> b) {
    if (a.length != b.length) return false;
    final idsA = a.map((e) => e.id).toSet();
    final idsB = b.map((e) => e.id).toSet();
    return idsA.containsAll(idsB);
  }
}
