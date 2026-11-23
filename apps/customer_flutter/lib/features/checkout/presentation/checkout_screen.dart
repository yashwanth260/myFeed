import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/gold_app_bar.dart';
import '../../../shared/widgets/feedo_card.dart';
import '../../../shared/widgets/feedo_button.dart';
import '../../home/presentation/home_provider.dart';
import '../../home/presentation/widgets/location_selector_sheet.dart';
import '../../cart/presentation/cart_provider.dart';
import '../../orders/presentation/orders_provider.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  String _selectedPaymentMethod = 'UPI';
  bool _isAsap = true;
  bool _isPlacingOrder = false;

  final List<Map<String, dynamic>> _paymentOptions = const [
    {
      'id': 'UPI',
      'title': 'Instant UPI (Recommended)',
      'subtitle': 'Google Pay, PhonePe, Paytm, CRED',
      'icon': Icons.bolt_rounded,
      'isFast': true,
    },
    {
      'id': 'CARD',
      'title': 'Credit / Debit Cards',
      'subtitle': 'Visa, Mastercard, RuPay',
      'icon': Icons.credit_card_rounded,
      'isFast': false,
    },
    {
      'id': 'WALLET',
      'title': 'Feedo Gold Wallet',
      'subtitle': 'Balance: ₹500.00',
      'icon': Icons.account_balance_wallet_rounded,
      'isFast': true,
    },
    {
      'id': 'COD',
      'title': 'Cash on Delivery (COD)',
      'subtitle': 'Pay cash or QR at doorstep',
      'icon': Icons.money_rounded,
      'isFast': false,
    },
  ];

  Future<void> _placeOrder() async {
    final cart = ref.read(cartProvider);
    if (cart.items.isEmpty || cart.restaurant == null) return;

    setState(() => _isPlacingOrder = true);

    await Future.delayed(const Duration(milliseconds: 1400));

    final selectedAddress = ref.read(selectedAddressProvider);
    final newOrder = ref.read(ordersProvider.notifier).placeOrder(
          restaurant: cart.restaurant!,
          items: cart.items,
          subtotal: cart.subtotal,
          deliveryFee: cart.deliveryFee,
          taxes: cart.taxes,
          discount: cart.discount,
          totalAmount: cart.grandTotal,
          address: selectedAddress,
        );

    ref.read(cartProvider.notifier).clearCart();

    if (mounted) {
      setState(() => _isPlacingOrder = false);
      _showSuccessDialog(newOrder.id);
    }
  }

  void _showSuccessDialog(String orderId) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 10),
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: FeedoColors.goldGradient,
                boxShadow: [FeedoColors.goldShadow],
              ),
              child: const Icon(Icons.check_rounded, color: Color(0xFF1F1A0E), size: 40),
            ),
            const SizedBox(height: 20),
            const Text(
              'Feast Confirmed!',
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 20,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'The kitchen has received your order and started preparing with gold standards.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 13,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 24),
            FeedoButton(
              width: double.infinity,
              text: 'Track Live Order',
              onPressed: () {
                Navigator.pop(ctx);
                context.go('/tracking/$orderId');
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final address = ref.watch(selectedAddressProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
      appBar: const GoldAppBar(titleText: 'Checkout'),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Address Confirmation
                  FeedoCard(
                    padding: const EdgeInsets.all(14),
                    margin: const EdgeInsets.only(bottom: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'DELIVERY ADDRESS',
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: FeedoColors.deepGold,
                                letterSpacing: 0.5,
                              ),
                            ),
                            TextButton(
                              onPressed: () {
                                showModalBottomSheet(
                                  context: context,
                                  isScrollControlled: true,
                                  builder: (_) => const LocationSelectorSheet(),
                                );
                              },
                              child: const Text('Change', style: TextStyle(color: FeedoColors.deepGold, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.location_on_rounded, color: FeedoColors.deepGold, size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                address,
                                style: TextStyle(
                                  fontFamily: 'Poppins',
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Delivery Time Selection
                  FeedoCard(
                    padding: const EdgeInsets.all(14),
                    margin: const EdgeInsets.only(bottom: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'DELIVERY SPEED',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: FeedoColors.deepGold,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: ChoiceChip(
                                label: const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.bolt_rounded, size: 16, color: FeedoColors.deepGold),
                                    SizedBox(width: 4),
                                    Text('Priority (25 mins)'),
                                  ],
                                ),
                                selected: _isAsap,
                                selectedColor: FeedoColors.lightGold.withOpacity(0.4),
                                onSelected: (_) => setState(() => _isAsap = true),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: ChoiceChip(
                                label: const Text('Schedule Later'),
                                selected: !_isAsap,
                                selectedColor: FeedoColors.lightGold.withOpacity(0.4),
                                onSelected: (_) => setState(() => _isAsap = false),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Payment Options
                  FeedoCard(
                    padding: const EdgeInsets.all(14),
                    margin: const EdgeInsets.only(bottom: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'PAYMENT METHOD',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: FeedoColors.deepGold,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 8),
                        ..._paymentOptions.map((opt) {
                          final isSelected = _selectedPaymentMethod == opt['id'];
                          return InkWell(
                            onTap: () => setState(() => _selectedPaymentMethod = opt['id']),
                            borderRadius: BorderRadius.circular(12),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              child: Row(
                                children: [
                                  Radio<String>(
                                    value: opt['id'],
                                    groupValue: _selectedPaymentMethod,
                                    activeColor: FeedoColors.primaryGold,
                                    onChanged: (v) => setState(() => _selectedPaymentMethod = v!),
                                  ),
                                  Icon(opt['icon'], color: isSelected ? FeedoColors.deepGold : Colors.grey, size: 22),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          opt['title'],
                                          style: TextStyle(
                                            fontFamily: 'Poppins',
                                            fontSize: 13,
                                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                            color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                                          ),
                                        ),
                                        Text(
                                          opt['subtitle'],
                                          style: TextStyle(
                                            fontFamily: 'Inter',
                                            fontSize: 11,
                                            color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (opt['isFast'])
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: FeedoColors.success.withOpacity(0.12),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: const Text(
                                        'FAST',
                                        style: TextStyle(
                                          fontFamily: 'Inter',
                                          fontSize: 9,
                                          fontWeight: FontWeight.w800,
                                          color: FeedoColors.success,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Bottom Confirm Button
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
                text: 'Pay ${CurrencyFormatter.format(cart.grandTotal)} & Confirm',
                isLoading: _isPlacingOrder,
                onPressed: _placeOrder,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

