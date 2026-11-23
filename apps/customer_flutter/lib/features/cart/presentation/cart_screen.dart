import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/gold_app_bar.dart';
import '../../../shared/widgets/feedo_card.dart';
import '../../../shared/widgets/feedo_button.dart';
import '../../../shared/widgets/quantity_stepper.dart';
import '../../../shared/widgets/veg_badge.dart';
import '../../../shared/widgets/empty_state.dart';
import 'cart_provider.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  final TextEditingController _couponController = TextEditingController();
  final TextEditingController _instructionsController = TextEditingController();
  String? _couponError;

  @override
  void dispose() {
    _couponController.dispose();
    _instructionsController.dispose();
    super.dispose();
  }

  void _applyCoupon() {
    final code = _couponController.text.trim();
    if (code.isEmpty) return;
    final success = ref.read(cartProvider.notifier).applyCoupon(code);
    if (!success) {
      setState(() => _couponError = 'Invalid code or minimum order amount not met');
    } else {
      setState(() => _couponError = null);
      _couponController.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Coupon $code applied successfully!'),
          backgroundColor: FeedoColors.deepGold,
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (cart.items.isEmpty) {
      return Scaffold(
        backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
        appBar: const GoldAppBar(titleText: 'Your Cart'),
        body: EmptyState(
          icon: Icons.shopping_basket_outlined,
          title: 'Your Cart is Empty',
          message: 'Explore our gold-standard restaurants and add your favorite dishes to feast!',
          actionText: 'Browse Restaurants',
          onAction: () => context.go('/home'),
        ),
      );
    }

    return Scaffold(
      backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
      appBar: GoldAppBar(
        titleText: 'Your Cart',
        actions: [
          TextButton(
            onPressed: () => ref.read(cartProvider.notifier).clearCart(),
            child: const Text('Clear', style: TextStyle(color: FeedoColors.error, fontWeight: FontWeight.w700)),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                children: [
                  // Restaurant Header Banner
                  if (cart.restaurant != null)
                    FeedoCard(
                      padding: const EdgeInsets.all(14),
                      margin: const EdgeInsets.only(bottom: 16),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.network(
                              cart.restaurant!.heroImageUrl,
                              width: 50,
                              height: 50,
                              fit: BoxFit.cover,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  cart.restaurant!.name,
                                  style: TextStyle(
                                    fontFamily: 'Poppins',
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Delivery in ${cart.restaurant!.deliveryTimeMinutes} mins',
                                  style: TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 12,
                                    color: isDark ? FeedoColors.lightGold : FeedoColors.deepGold,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Cart Items Card
                  FeedoCard(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    margin: const EdgeInsets.only(bottom: 16),
                    child: Column(
                      children: [
                        ...cart.items.map((cartItem) {
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                VegBadge(dietaryType: cartItem.item.dietaryType, size: 14),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        cartItem.item.name,
                                        style: TextStyle(
                                          fontFamily: 'Poppins',
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                          color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                                        ),
                                      ),
                                      if (cartItem.selectedOptions.isNotEmpty) ...[
                                        const SizedBox(height: 2),
                                        Text(
                                          cartItem.selectedOptions.map((o) => o.name).join(', '),
                                          style: TextStyle(
                                            fontFamily: 'Inter',
                                            fontSize: 11,
                                            color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                                          ),
                                        ),
                                      ],
                                      const SizedBox(height: 4),
                                      Text(
                                        CurrencyFormatter.format(cartItem.totalPrice),
                                        style: TextStyle(
                                          fontFamily: 'Inter',
                                          fontSize: 13,
                                          fontWeight: FontWeight.w700,
                                          color: isDark ? FeedoColors.lightGold : FeedoColors.textPrimaryLight,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                QuantityStepper(
                                  quantity: cartItem.quantity,
                                  onIncrement: () => ref.read(cartProvider.notifier).incrementQuantity(cartItem.id),
                                  onDecrement: () => ref.read(cartProvider.notifier).decrementQuantity(cartItem.id),
                                  width: 88,
                                  height: 32,
                                ),
                              ],
                            ),
                          );
                        }),

                        const Divider(height: 1),
                        InkWell(
                          onTap: () {
                            if (cart.restaurant != null) {
                              context.push('/restaurant/${cart.restaurant!.id}');
                            }
                          },
                          child: const Padding(
                            padding: EdgeInsets.symmetric(vertical: 12),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.add_circle_outline, size: 16, color: FeedoColors.deepGold),
                                SizedBox(width: 6),
                                Text(
                                  'Add more dishes',
                                  style: TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: FeedoColors.deepGold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Coupon Section Card
                  FeedoCard(
                    padding: const EdgeInsets.all(14),
                    margin: const EdgeInsets.only(bottom: 16),
                    child: cart.appliedCoupon != null
                        ? Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: FeedoColors.success.withOpacity(0.15),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.verified_rounded, color: FeedoColors.success, size: 20),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Code "${cart.appliedCoupon!.code}" applied',
                                      style: TextStyle(
                                        fontFamily: 'Poppins',
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                        color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                                      ),
                                    ),
                                    Text(
                                      'You saved ${CurrencyFormatter.format(cart.discount)}',
                                      style: const TextStyle(
                                        fontFamily: 'Inter',
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: FeedoColors.success,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.close_rounded, size: 20),
                                onPressed: () => ref.read(cartProvider.notifier).removeCoupon(),
                              ),
                            ],
                          )
                        : Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: TextField(
                                      controller: _couponController,
                                      textCapitalization: TextCapitalization.characters,
                                      decoration: InputDecoration(
                                        hintText: 'Enter promo code (e.g. FEEDO50)',
                                        isDense: true,
                                        border: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(12),
                                          borderSide: const BorderSide(color: FeedoColors.borderLight),
                                        ),
                                        prefixIcon: const Icon(Icons.local_offer_outlined, color: FeedoColors.deepGold, size: 18),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  FeedoButton(
                                    text: 'Apply',
                                    height: 44,
                                    onPressed: _applyCoupon,
                                  ),
                                ],
                              ),
                              if (_couponError != null) ...[
                                const SizedBox(height: 6),
                                Text(
                                  _couponError!,
                                  style: const TextStyle(color: FeedoColors.error, fontSize: 11),
                                ),
                              ],
                            ],
                          ),
                  ),

                  // Bill Breakdown Card
                  FeedoCard(
                    padding: const EdgeInsets.all(16),
                    margin: const EdgeInsets.only(bottom: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Bill Summary',
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                          ),
                        ),
                        const SizedBox(height: 12),
                        _BillRow(label: 'Item Subtotal', amount: cart.subtotal),
                        _BillRow(
                          label: 'Delivery Fee',
                          amount: cart.deliveryFee,
                          isFree: cart.deliveryFee == 0,
                        ),
                        _BillRow(label: 'Platform Fee', amount: cart.platformFee),
                        _BillRow(label: 'GST & Restaurant Taxes (5%)', amount: cart.taxes),
                        if (cart.discount > 0)
                          _BillRow(
                            label: 'Gold Promo Discount',
                            amount: -cart.discount,
                            isDiscount: true,
                          ),
                        const Divider(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'To Pay',
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                              ),
                            ),
                            Text(
                              CurrencyFormatter.format(cart.grandTotal),
                              style: const TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: FeedoColors.deepGold,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Checkout Footer
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? FeedoColors.surfaceDark : Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 10,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: FeedoButton(
                width: double.infinity,
                height: 52,
                text: 'Proceed to Checkout • ${CurrencyFormatter.format(cart.grandTotal)}',
                onPressed: () => context.push('/checkout'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BillRow extends StatelessWidget {
  final String label;
  final double amount;
  final bool isFree;
  final bool isDiscount;

  const _BillRow({
    required this.label,
    required this.amount,
    this.isFree = false,
    this.isDiscount = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 13,
              color: isDiscount ? FeedoColors.success : (isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight),
              fontWeight: isDiscount ? FontWeight.w600 : FontWeight.w400,
            ),
          ),
          Text(
            isFree ? 'FREE' : (isDiscount ? '-${CurrencyFormatter.format(amount.abs())}' : CurrencyFormatter.format(amount)),
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 13,
              fontWeight: (isFree || isDiscount) ? FontWeight.w700 : FontWeight.w600,
              color: (isFree || isDiscount)
                  ? FeedoColors.success
                  : (isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight),
            ),
          ),
        ],
      ),
    );
  }
}

