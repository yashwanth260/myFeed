import 'package:feedo_customer/features/restaurant/domain/restaurant_model.dart';

class CartItemModel {
  final String id;
  final MenuItemModel item;
  final int quantity;
  final List<CustomizationOption> selectedOptions;
  final String? specialInstructions;

  const CartItemModel({
    required this.id,
    required this.item,
    required this.quantity,
    this.selectedOptions = const [],
    this.specialInstructions,
  });

  double get unitPrice {
    double total = item.price;
    for (final opt in selectedOptions) {
      total += opt.price;
    }
    return total;
  }

  double get totalPrice => unitPrice * quantity;

  CartItemModel copyWith({
    int? quantity,
    List<CustomizationOption>? selectedOptions,
    String? specialInstructions,
  }) {
    return CartItemModel(
      id: id,
      item: item,
      quantity: quantity ?? this.quantity,
      selectedOptions: selectedOptions ?? this.selectedOptions,
      specialInstructions: specialInstructions ?? this.specialInstructions,
    );
  }
}
