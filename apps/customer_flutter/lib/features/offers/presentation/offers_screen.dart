import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../shared/widgets/gold_app_bar.dart';
import '../../../shared/widgets/feedo_card.dart';
import '../../../shared/widgets/feedo_button.dart';
import '../../home/data/mock_feedo_data.dart';
import '../../cart/presentation/cart_provider.dart';

class OffersScreen extends ConsumerWidget {
  const OffersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final coupons = MockFeedoData.coupons;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
      appBar: const GoldAppBar(titleText: 'Offers & Coupons'),
      body: SafeArea(
        child: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: coupons.length,
          itemBuilder: (context, index) {
            final c = coupons[index];
            return FeedoCard(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: FeedoColors.lightGold.withOpacity(0.25),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: FeedoColors.primaryGold.withOpacity(0.6)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.local_offer_rounded, size: 14, color: FeedoColors.deepGold),
                            const SizedBox(width: 6),
                            Text(
                              c.code,
                              style: const TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                                color: FeedoColors.deepGold,
                                letterSpacing: 1.0,
                              ),
                            ),
                          ],
                        ),
                      ),
                      TextButton.icon(
                        icon: const Icon(Icons.copy_rounded, size: 14, color: FeedoColors.deepGold),
                        label: const Text('Copy', style: TextStyle(color: FeedoColors.deepGold, fontWeight: FontWeight.bold)),
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: c.code));
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Code ${c.code} copied to clipboard!'),
                              duration: const Duration(seconds: 1),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    c.description,
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Valid on orders above ₹${c.minOrderAmount.toInt()}',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      color: isDark ? FeedoColors.textMutedDark : FeedoColors.textMutedLight,
                    ),
                  ),
                  const SizedBox(height: 12),
                  FeedoButton(
                    text: 'Apply & Go to Cart',
                    height: 38,
                    variant: FeedoButtonVariant.secondary,
                    onPressed: () {
                      ref.read(cartProvider.notifier).applyCoupon(c.code);
                      context.push('/cart');
                    },
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

