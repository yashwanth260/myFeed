import 'package:flutter_test/flutter_test.dart';
import 'package:feedo_customer/features/offers/domain/coupon_model.dart';

void main() {
  group('Coupon Discount Tests', () {
    test('Calculates percentage discount bounded by max cap', () {
      const coupon = CouponModel(
        code: 'FEEDO50',
        description: '50% off up to ₹100',
        type: DiscountType.percentage,
        value: 50.0,
        minOrderAmount: 199.0,
        maxDiscount: 100.0,
      );

      // Subtotal below minOrderAmount gets 0 discount
      expect(coupon.calculateDiscount(150.0), 0.0);

      // Subtotal of ₹300 gives 50% = ₹150, but capped at ₹100
      expect(coupon.calculateDiscount(300.0), 100.0);

      // Subtotal of ₹199 gives 50% = ₹99.50
      expect(coupon.calculateDiscount(199.0), 99.50);
    });

    test('Calculates flat discount correctly', () {
      const coupon = CouponModel(
        code: 'WELCOME100',
        description: 'Flat ₹100 off on ₹399',
        type: DiscountType.flat,
        value: 100.0,
        minOrderAmount: 399.0,
      );

      expect(coupon.calculateDiscount(350.0), 0.0);
      expect(coupon.calculateDiscount(450.0), 100.0);
    });
  });
}

