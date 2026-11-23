import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/order_model.dart';
import '../../cart/domain/cart_item_model.dart';
import '../../restaurant/domain/restaurant_model.dart';
import '../../home/data/mock_feedo_data.dart';

class OrdersState {
  final OrderModel? activeOrder;
  final List<OrderModel> pastOrders;

  const OrdersState({
    this.activeOrder,
    this.pastOrders = const [],
  });

  OrdersState copyWith({
    OrderModel? activeOrder,
    bool clearActiveOrder = false,
    List<OrderModel>? pastOrders,
  }) {
    return OrdersState(
      activeOrder: clearActiveOrder ? null : (activeOrder ?? this.activeOrder),
      pastOrders: pastOrders ?? this.pastOrders,
    );
  }
}

final ordersProvider = StateNotifierProvider<OrdersNotifier, OrdersState>((ref) {
  return OrdersNotifier();
});

class OrdersNotifier extends StateNotifier<OrdersState> {
  OrdersNotifier()
      : super(OrdersState(
          activeOrder: MockFeedoData.sampleActiveOrder,
          pastOrders: MockFeedoData.samplePastOrders,
        ));

  OrderModel placeOrder({
    required RestaurantModel restaurant,
    required List<CartItemModel> items,
    required double subtotal,
    required double deliveryFee,
    required double taxes,
    required double discount,
    required double totalAmount,
    required String address,
  }) {
    final orderNum = 'FD-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}-${(1000 + DateTime.now().millisecond)}';
    final newOrder = OrderModel(
      id: 'ord_${DateTime.now().millisecondsSinceEpoch}',
      orderNumber: orderNum,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantImage: restaurant.heroImageUrl,
      items: items,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      taxes: taxes,
      discount: discount,
      totalAmount: totalAmount,
      status: OrderProgressStatus.placed,
      createdAt: DateTime.now(),
      deliveryAddress: address,
      dropOtp: '2048',
      etaMinutes: 28,
      rider: const RiderInfo(
        name: 'Rahul Kumar',
        phone: '+91 98765 43210',
        rating: 4.9,
        vehicle: 'Hero Electric (KA-03-EK-9481)',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
      ),
    );

    state = state.copyWith(activeOrder: newOrder);
    return newOrder;
  }

  void advanceActiveOrderStatus() {
    final active = state.activeOrder;
    if (active == null) return;

    OrderProgressStatus nextStatus;
    switch (active.status) {
      case OrderProgressStatus.placed:
        nextStatus = OrderProgressStatus.confirmed;
        break;
      case OrderProgressStatus.confirmed:
        nextStatus = OrderProgressStatus.preparing;
        break;
      case OrderProgressStatus.preparing:
        nextStatus = OrderProgressStatus.outForDelivery;
        break;
      case OrderProgressStatus.outForDelivery:
        nextStatus = OrderProgressStatus.delivered;
        break;
      case OrderProgressStatus.delivered:
      case OrderProgressStatus.cancelled:
        return;
    }

    final updated = OrderModel(
      id: active.id,
      orderNumber: active.orderNumber,
      restaurantId: active.restaurantId,
      restaurantName: active.restaurantName,
      restaurantImage: active.restaurantImage,
      items: active.items,
      subtotal: active.subtotal,
      deliveryFee: active.deliveryFee,
      taxes: active.taxes,
      discount: active.discount,
      totalAmount: active.totalAmount,
      status: nextStatus,
      createdAt: active.createdAt,
      deliveryAddress: active.deliveryAddress,
      dropOtp: active.dropOtp,
      rider: active.rider,
      etaMinutes: nextStatus == OrderProgressStatus.delivered ? 0 : 8,
    );

    if (nextStatus == OrderProgressStatus.delivered) {
      state = state.copyWith(
        clearActiveOrder: true,
        pastOrders: [updated, ...state.pastOrders],
      );
    } else {
      state = state.copyWith(activeOrder: updated);
    }
  }

  void addReview(String orderId, double rating, String comment) {
    // In-memory review recorded
  }
}

