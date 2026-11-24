import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/feedo_colors.dart';
import '../home_provider.dart';

class ServiceHubBanner extends ConsumerWidget {
  const ServiceHubBanner({super.key});

  static final List<Map<String, dynamic>> services = [
    {
      'id': 'cat_restaurants',
      'title': 'Restaurants & Food',
      'kannada': 'ಹೋಟೆಲ್ & ಫುಡ್',
      'icon': Icons.restaurant_rounded,
      'image': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80',
      'isTop': true,
      'isParcel': false,
      'filter': 'Restaurants',
    },
    {
      'id': 'cat_grocery',
      'title': 'Grocery',
      'kannada': 'ಕಿರಾಣಿ ಸಾಮಾನುಗಳು',
      'icon': Icons.shopping_cart_rounded,
      'image': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80',
      'isTop': false,
      'isParcel': false,
      'filter': 'Grocery',
    },
    {
      'id': 'cat_fruits_veggies',
      'title': 'Fruits & Vegetables',
      'kannada': 'ಹಣ್ಣು & ತರಕಾರಿ',
      'icon': Icons.eco_rounded,
      'image': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&q=80',
      'isTop': false,
      'isParcel': false,
      'filter': 'Healthy',
    },
    {
      'id': 'cat_meat_chicken',
      'title': 'Meat & Chicken',
      'kannada': 'ಮಾಂಸ & ಚಿಕನ್',
      'icon': Icons.kebab_dining_rounded,
      'image': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&q=80',
      'isTop': false,
      'isParcel': false,
      'filter': 'Fresh Meat',
    },
    {
      'id': 'cat_dairy_milk',
      'title': 'Dairy & Milk',
      'kannada': 'ಹಾಲು & ಹಾಲಿನ ಉತ್ಪನ್ನಗಳು',
      'icon': Icons.local_drink_rounded,
      'image': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&q=80',
      'isTop': false,
      'isParcel': false,
      'filter': 'Dairy',
    },
    {
      'id': 'cat_bakery_sweets',
      'title': 'Bakery & Sweets',
      'kannada': 'ಬೇಕರಿ & ಸಿಹಿತಿಂಡಿಗಳು',
      'icon': Icons.cake_rounded,
      'image': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80',
      'isTop': false,
      'isParcel': false,
      'filter': 'Desserts',
    },
    {
      'id': 'cat_flowers',
      'title': 'Flowers',
      'kannada': 'ಹೂವುಗಳು',
      'icon': Icons.local_florist_rounded,
      'image': 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300&q=80',
      'isTop': false,
      'isParcel': false,
      'filter': 'Flowers',
    },
    {
      'id': 'cat_parcel',
      'title': 'Parcel (City Limits)',
      'kannada': 'ಪಾರ್ಸಲ್ (ಸಿಟಿ ಲಿಮಿಟ್ಸ್)',
      'icon': Icons.inventory_2_rounded,
      'image': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&q=80',
      'isTop': false,
      'isParcel': true,
      'filter': null,
    },
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final selectedCategory = ref.watch(selectedCategoryProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'All Services • ನಮ್ಮ ಸೇವೆಗಳು',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Order food, groceries, fresh dairy or send a parcel',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 11,
                      color: isDark ? FeedoColors.textMutedDark : FeedoColors.textMutedLight,
                    ),
                  ),
                ],
              ),
              if (selectedCategory != null)
                TextButton(
                  onPressed: () => ref.read(selectedCategoryProvider.notifier).state = null,
                  child: const Text('Show All', style: TextStyle(color: FeedoColors.deepGold, fontSize: 12, fontWeight: FontWeight.bold)),
                ),
            ],
          ),
        ),
        ListView.separated(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: services.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (context, index) {
            final item = services[index];
            final isTop = item['isTop'] == true;
            final isParcel = item['isParcel'] == true;
            final isSelected = selectedCategory == item['filter'];

            return GestureDetector(
              onTap: () {
                if (isParcel) {
                  context.push('/parcel');
                } else {
                  final filter = item['filter'] as String;
                  ref.read(selectedCategoryProvider.notifier).state = isSelected ? null : filter;
                }
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                height: 64,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: isSelected
                      ? FeedoColors.lightGold.withOpacity(0.3)
                      : (isDark ? FeedoColors.cardDark : Colors.white),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isTop
                        ? const Color(0xFFE8B931)
                        : (isSelected
                            ? FeedoColors.primaryGold
                            : (isDark ? FeedoColors.borderDark : const Color(0xFFE5E7EB))),
                    width: isTop || isSelected ? 2.0 : 1.0,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: isTop
                          ? FeedoColors.primaryGold.withOpacity(0.18)
                          : Colors.black.withOpacity(0.04),
                      blurRadius: isTop ? 10 : 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    // Icon Badge (Warm Green/Gold circle)
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: isTop ? const Color(0xFFC05621) : const Color(0xFF2E7D32),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.12),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Icon(
                        item['icon'] as IconData,
                        color: Colors.white,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 14),

                    // Titles (English + Kannada)
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item['title'] as String,
                            style: TextStyle(
                              fontFamily: 'Poppins',
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: isDark ? FeedoColors.textPrimaryDark : const Color(0xFF1F2937),
                            ),
                          ),
                          const SizedBox(height: 1),
                          Text(
                            item['kannada'] as String,
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: isDark ? FeedoColors.textMutedDark : const Color(0xFF4B5563),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Right Thumbnail Image
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(
                        item['image'] as String,
                        width: 54,
                        height: 46,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          width: 54,
                          height: 46,
                          color: FeedoColors.lightGold.withOpacity(0.2),
                          child: const Icon(Icons.fastfood, size: 20, color: FeedoColors.deepGold),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),

                    // Chevron Button
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: isTop ? const Color(0xFFC05621) : const Color(0xFF2E7D32),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.chevron_right_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}
