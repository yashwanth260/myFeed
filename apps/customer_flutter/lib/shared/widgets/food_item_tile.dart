import 'package:flutter/material.dart';
import '../../core/theme/feedo_colors.dart';
import '../../core/utils/currency_formatter.dart';
import '../../features/restaurant/domain/restaurant_model.dart';
import 'veg_badge.dart';
import 'quantity_stepper.dart';

class FoodItemTile extends StatelessWidget {
  final MenuItemModel item;
  final int quantity;
  final VoidCallback onAdd;
  final VoidCallback onIncrement;
  final VoidCallback onDecrement;
  final VoidCallback? onTap;

  const FoodItemTile({
    super.key,
    required this.item,
    this.quantity = 0,
    required this.onAdd,
    required this.onIncrement,
    required this.onDecrement,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isDark ? FeedoColors.borderDark : FeedoColors.borderLight.withOpacity(0.5),
              width: 1,
            ),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      VegBadge(dietaryType: item.dietaryType),
                      if (item.isBestseller) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: FeedoColors.primaryGold.withOpacity(0.18),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'BESTSELLER',
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              color: FeedoColors.deepGold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    item.name,
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        CurrencyFormatter.format(item.price),
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: isDark ? FeedoColors.lightGold : FeedoColors.textPrimaryLight,
                        ),
                      ),
                      if (item.originalPrice != null) ...[
                        const SizedBox(width: 6),
                        Text(
                          CurrencyFormatter.format(item.originalPrice!),
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: isDark ? FeedoColors.textMutedDark : FeedoColors.textMutedLight,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    item.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                      height: 1.3,
                    ),
                  ),
                  if (item.customizationGroups.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    const Text(
                      'Customisable',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: FeedoColors.deepGold,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 14),

            // Image & Add Button
            Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.bottomCenter,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Image.network(
                    item.imageUrl,
                    width: 110,
                    height: 100,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      width: 110,
                      height: 100,
                      color: isDark ? FeedoColors.surfaceDark : Colors.grey[200],
                      child: const Icon(Icons.fastfood_rounded, color: FeedoColors.primaryGold),
                    ),
                  ),
                ),
                Positioned(
                  bottom: -12,
                  child: quantity > 0
                      ? QuantityStepper(
                          quantity: quantity,
                          onIncrement: onIncrement,
                          onDecrement: onDecrement,
                          width: 95,
                          height: 34,
                        )
                      : GestureDetector(
                          onTap: onAdd,
                          child: Container(
                            width: 95,
                            height: 34,
                            decoration: BoxDecoration(
                              color: isDark ? FeedoColors.surfaceDark : Colors.white,
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: FeedoColors.primaryGold, width: 1.5),
                              boxShadow: [
                                BoxShadow(
                                  color: FeedoColors.primaryGold.withOpacity(0.18),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            alignment: Alignment.center,
                            child: const Text(
                              'ADD',
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                                color: FeedoColors.deepGold,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                        ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

