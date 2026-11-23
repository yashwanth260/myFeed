import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/feedo_colors.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../restaurant/domain/restaurant_model.dart';
import '../../../cart/presentation/cart_provider.dart';
import '../../../../shared/widgets/feedo_button.dart';
import '../../../../shared/widgets/veg_badge.dart';

class CustomizationBottomSheet extends ConsumerStatefulWidget {
  final RestaurantModel restaurant;
  final MenuItemModel item;

  const CustomizationBottomSheet({
    super.key,
    required this.restaurant,
    required this.item,
  });

  @override
  ConsumerState<CustomizationBottomSheet> createState() => _CustomizationBottomSheetState();
}

class _CustomizationBottomSheetState extends ConsumerState<CustomizationBottomSheet> {
  final Map<String, CustomizationOption> _selectedOptions = {};
  final TextEditingController _notesController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Default select first required options
    for (final group in widget.item.customizationGroups) {
      if (group.isRequired && group.options.isNotEmpty) {
        _selectedOptions[group.id] = group.options.first;
      }
    }
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  double get _currentPrice {
    double total = widget.item.price;
    for (final opt in _selectedOptions.values) {
      total += opt.price;
    }
    return total;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              VegBadge(dietaryType: widget.item.dietaryType, size: 18),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.item.name,
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      CurrencyFormatter.format(_currentPrice),
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: FeedoColors.deepGold,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(),

          // Groups Scroll
          Expanded(
            child: ListView(
              children: [
                ...widget.item.customizationGroups.map((group) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              group.title,
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                              ),
                            ),
                            if (group.isRequired)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: FeedoColors.error.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: const Text(
                                  'REQUIRED',
                                  style: TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 9,
                                    fontWeight: FontWeight.w800,
                                    color: FeedoColors.error,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                      ...group.options.map((opt) {
                        final isSelected = _selectedOptions[group.id]?.id == opt.id;
                        return InkWell(
                          onTap: () {
                            setState(() {
                              _selectedOptions[group.id] = opt;
                            });
                          },
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8.0),
                            child: Row(
                              children: [
                                Radio<String>(
                                  value: opt.id,
                                  groupValue: _selectedOptions[group.id]?.id,
                                  activeColor: FeedoColors.primaryGold,
                                  onChanged: (_) {
                                    setState(() => _selectedOptions[group.id] = opt);
                                  },
                                ),
                                Expanded(
                                  child: Text(
                                    opt.name,
                                    style: TextStyle(
                                      fontFamily: 'Inter',
                                      fontSize: 14,
                                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w400,
                                      color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                                    ),
                                  ),
                                ),
                                if (opt.price > 0)
                                  Text(
                                    '+${CurrencyFormatter.format(opt.price)}',
                                    style: TextStyle(
                                      fontFamily: 'Inter',
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: isDark ? FeedoColors.lightGold : FeedoColors.deepGold,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        );
                      }),
                      const SizedBox(height: 12),
                    ],
                  );
                }),

                // Special Instructions
                const Text(
                  'Special Cooking Instructions (Optional)',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _notesController,
                  maxLines: 2,
                  decoration: InputDecoration(
                    hintText: 'e.g. Less spicy, extra napkins, cutlery...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: FeedoColors.borderLight),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),

          // Bottom Action
          const SizedBox(height: 12),
          FeedoButton(
            width: double.infinity,
            height: 52,
            text: 'Add to Cart • ${CurrencyFormatter.format(_currentPrice)}',
            onPressed: () {
              final added = ref.read(cartProvider.notifier).addItem(
                    restaurant: widget.restaurant,
                    item: widget.item,
                    options: _selectedOptions.values.toList(),
                    instructions: _notesController.text.trim().isNotEmpty ? _notesController.text.trim() : null,
                  );

              Navigator.pop(context);

              if (!added) {
                // Show conflict modal
                _showDifferentRestaurantDialog(context);
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('${widget.item.name} added to cart!'),
                    backgroundColor: FeedoColors.deepGold,
                    duration: const Duration(seconds: 1),
                  ),
                );
              }
            },
          ),
        ],
      ),
    );
  }

  void _showDifferentRestaurantDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Start New Cart?'),
        content: const Text(
          'Your cart contains items from a different kitchen. Would you like to discard them and start a fresh order from this restaurant?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              ref.read(cartProvider.notifier).forceAddItem(
                    restaurant: widget.restaurant,
                    item: widget.item,
                    options: _selectedOptions.values.toList(),
                  );
              Navigator.pop(ctx);
            },
            child: const Text('Start New Cart', style: TextStyle(color: FeedoColors.deepGold, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
