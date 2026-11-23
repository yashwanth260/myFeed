class DeliveryTrip {
  final String id;
  final String orderId;
  final String restaurantName;
  final String restaurantAddress;
  final String customerName;
  final String customerAddress;
  final String customerPhone;
  final int payoutPaise;
  final double distanceKm;
  final String status; // OFFERED, ACCEPTED, PICKED_UP, DELIVERED
  final DateTime createdAt;

  DeliveryTrip({
    required this.id,
    required this.orderId,
    required this.restaurantName,
    required this.restaurantAddress,
    required this.customerName,
    required this.customerAddress,
    required this.customerPhone,
    required this.payoutPaise,
    required this.distanceKm,
    required this.status,
    required this.createdAt,
  });

  factory DeliveryTrip.fromJson(Map<String, dynamic> json) {
    return DeliveryTrip(
      id: json['id'] ?? '',
      orderId: json['orderId'] ?? json['order_id'] ?? '',
      restaurantName: json['restaurantName'] ?? json['restaurant_name'] ?? 'The Golden Grill',
      restaurantAddress: json['restaurantAddress'] ?? '124 Indiranagar, 100ft Road',
      customerName: json['customerName'] ?? json['customer_name'] ?? 'Priya Sharma',
      customerAddress: json['customerAddress'] ?? json['delivery_address'] ?? '42 Palm Avenue, Koramangala',
      customerPhone: json['customerPhone'] ?? '+91 98451 22334',
      payoutPaise: json['payoutPaise'] ?? 6500,
      distanceKm: (json['distanceKm'] ?? 3.2).toDouble(),
      status: (json['status'] ?? 'OFFERED').toString().toUpperCase(),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  String get formattedPayout => '₹${(payoutPaise / 100).toStringAsFixed(2)}';
}

