import 'package:flutter_test/flutter_test.dart';
import 'package:feedo_customer/features/cart/domain/cart_item_model.dart';
import 'package:feedo_customer/features/restaurant/domain/restaurant_model.dart';

void main() {
  group('Cart Calculation Tests', () {
    const sampleItem = MenuItemModel(
      id: 'test_1',
      restaurantId: 'rest_1',
      name: 'Hyderabadi Biryani',
      description: 'Slow-cooked royal biryani',
      price: 350.0,
      imageUrl: '',
      category: 'Biryani',
      dietaryType: DietaryType.nonVeg,
    );

    test('Computes unit price with customization add-ons correctly', () {
      const option1 = CustomizationOption(id: 'opt_1', name: 'Extra Egg', price: 25.0);
      const option2 = CustomizationOption(id: 'opt_2', name: 'Mirchi Ka Salan', price: 35.0);

      final cartItem = CartItemModel(
        id: 'cart_1',
        item: sampleItem,
        quantity: 2,
        selectedOptions: const [option1, option2],
      );

      expect(cartItem.unitPrice, 410.0);
      expect(cartItem.totalPrice, 820.0);
    });

    test('Computes item quantity updates correctly', () {
      final cartItem = CartItemModel(
        id: 'cart_1',
        item: sampleItem,
        quantity: 1,
      );

      final updated = cartItem.copyWith(quantity: 3);
      expect(updated.totalPrice, 1050.0);
    });
  });
}

