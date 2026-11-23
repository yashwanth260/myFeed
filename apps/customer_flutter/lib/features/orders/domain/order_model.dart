import 'package:feedo_customer/features/cart/domain/cart_item_model.dart';

enum OrderProgressStatus {
  placed,
  confirmed,
  preparing,
  outForDelivery,
  delivered,
  cancelled,
}

class RiderInfo {
  final String name;
  final String phone;
  final double rating;
  final String vehicle;
  final String avatarUrl;

  const RiderInfo({
    required this.name,
    required this.phone,
    required this.rating,
    required this.vehicle,
    required this.avatarUrl,
  });
}

class OrderModel {
  final String id;
  final String orderNumber;
  final String restaurantId;
  final String restaurantName;
  final String restaurantImage;
  final List<CartItemModel> items;
  final double subtotal;
  final double deliveryFee;
  final double taxes;
  final double discount;
  final double totalAmount;
  final OrderProgressStatus status;
  final DateTime createdAt;
  final String deliveryAddress;
  final String dropOtp;
  final RiderInfo? rider;
  final int etaMinutes;

  const OrderModel({
    required this.id,
    required this.orderNumber,
    required this.restaurantId,
    required this.restaurantName,
    required this.restaurantImage,
    required this.items,
    required this.subtotal,
    required this.deliveryFee,
    required this.taxes,
    required this.discount,
    required this.totalAmount,
    required this.status,
    required this.createdAt,
    required this.deliveryAddress,
    this.dropOtp = '2048',
    this.rider,
    this.etaMinutes = 25,
  });
}
