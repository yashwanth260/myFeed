class OrderItem {
  final String id;
  final String name;
  final int quantity;
  final int pricePaise;

  OrderItem({
    required this.id,
    required this.name,
    required this.quantity,
    required this.pricePaise,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      quantity: json['quantity'] ?? 1,
      pricePaise: json['pricePaise'] ?? json['unitPricePaise'] ?? 0,
    );
  }
}

class RestaurantOrder {
  final String id;
  final String orderNumber;
  final String customerName;
  final String customerPhone;
  final String status; // PENDING, CONFIRMED, PREPARING, READY_FOR_PICKUP, DELIVERED
  final int totalAmountPaise;
  final List<OrderItem> items;
  final DateTime createdAt;

  RestaurantOrder({
    required this.id,
    required this.orderNumber,
    required this.customerName,
    required this.customerPhone,
    required this.status,
    required this.totalAmountPaise,
    required this.items,
    required this.createdAt,
  });

  factory RestaurantOrder.fromJson(Map<String, dynamic> json) {
    var rawItems = (json['items'] as List<dynamic>?) ?? [];
    return RestaurantOrder(
      id: json['id'] ?? '',
      orderNumber: json['orderNumber'] ?? json['order_number'] ?? 'ORD-000',
      customerName: json['customerName'] ?? json['customer_name'] ?? 'Guest Customer',
      customerPhone: json['customerPhone'] ?? '+91 98765 43210',
      status: (json['status'] ?? 'CONFIRMED').toString().toUpperCase(),
      totalAmountPaise: json['totalAmountPaise'] ?? json['final_amount_paise'] ?? 0,
      items: rawItems.map((i) => OrderItem.fromJson(i)).toList(),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  String get formattedTotal => '₹${(totalAmountPaise / 100).toStringAsFixed(2)}';
}

