enum DiscountType { percentage, flat }

class CouponModel {
  final String code;
  final String description;
  final DiscountType type;
  final double value;
  final double minOrderAmount;
  final double? maxDiscount;

  const CouponModel({
    required this.code,
    required this.description,
    required this.type,
    required this.value,
    this.minOrderAmount = 149.0,
    this.maxDiscount,
  });

  double calculateDiscount(double subtotal) {
    if (subtotal < minOrderAmount) return 0.0;
    if (type == DiscountType.flat) {
      return value > subtotal ? subtotal : value;
    }
    final rawDiscount = subtotal * (value / 100.0);
    if (maxDiscount != null && rawDiscount > maxDiscount!) {
      return maxDiscount!;
    }
    return rawDiscount;
  }
}

