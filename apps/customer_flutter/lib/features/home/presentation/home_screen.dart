import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/restaurant_card.dart';
import '../../auth/presentation/auth_provider.dart';
import '../../cart/presentation/cart_provider.dart';
import 'home_provider.dart';
import 'widgets/category_chip_list.dart';
import 'widgets/promo_carousel.dart';
import 'widgets/location_selector_sheet.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).value;
    final selectedAddress = ref.watch(selectedAddressProvider);
    final restaurants = ref.watch(filteredRestaurantsProvider);
    final favorites = ref.watch(favoritesProvider);
    final cart = ref.watch(cartProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
      body: SafeArea(
        child: Stack(
          children: [
            CustomScrollView(
              slivers: [
                // Top Custom Header: Greeting + Location Selector
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Location Pill
                        Expanded(
                          child: GestureDetector(
                            onTap: () {
                              showModalBottomSheet(
                                context: context,
                                isScrollControlled: true,
                                builder: (_) => const LocationSelectorSheet(),
                              );
                            },
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(7),
                                  decoration: BoxDecoration(
                                    color: FeedoColors.lightGold.withOpacity(0.25),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.location_on_rounded, color: FeedoColors.deepGold, size: 18),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Text(
                                            'Deliver to',
                                            style: TextStyle(
                                              fontFamily: 'Inter',
                                              fontSize: 11,
                                              fontWeight: FontWeight.w600,
                                              color: isDark ? FeedoColors.textMutedDark : FeedoColors.textMutedLight,
                                            ),
                                          ),
                                          const Icon(Icons.keyboard_arrow_down_rounded, size: 16, color: FeedoColors.deepGold),
                                        ],
                                      ),
                                      Text(
                                        selectedAddress,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontFamily: 'Poppins',
                                          fontSize: 13,
                                          fontWeight: FontWeight.w700,
                                          color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Notification Icon
                        GestureDetector(
                          onTap: () => context.push('/notifications'),
                          child: Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: isDark ? FeedoColors.surfaceDark : Colors.white,
                              shape: BoxShape.circle,
                              border: Border.all(color: isDark ? FeedoColors.borderDark : FeedoColors.borderLight),
                            ),
                            child: const Icon(Icons.notifications_none_rounded, size: 20),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Greeting line
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    child: Text(
                      'Hello, ${user?.name ?? 'Alex'} 👋',
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                      ),
                    ),
                  ),
                ),

                // Search Bar Trigger
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                    child: GestureDetector(
                      onTap: () => context.push('/search'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
                        decoration: BoxDecoration(
                          color: isDark ? FeedoColors.cardDark : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isDark ? FeedoColors.borderDark : FeedoColors.borderLight,
                            width: 1.2,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: FeedoColors.primaryGold.withOpacity(0.06),
                              blurRadius: 10,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.search_rounded, color: FeedoColors.deepGold, size: 20),
                            const SizedBox(width: 10),
                            Text(
                              'Search "Hyderabadi Biryani", "Pizza"...',
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                                color: isDark ? Colors.grey[500] : Colors.grey[400],
                              ),
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                color: FeedoColors.lightGold.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.tune_rounded, size: 16, color: FeedoColors.deepGold),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),

                // Promo Carousel
                SliverToBoxAdapter(
                  child: PromoCarousel(
                    onPromoTap: (code) {
                      ref.read(cartProvider.notifier).applyCoupon(code);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Coupon $code ready for checkout!'),
                          backgroundColor: FeedoColors.deepGold,
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    },
                  ),
                ),

                // Categories Header
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 18, 16, 10),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Explore Categories',
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Horizontal Category Chips
                const SliverToBoxAdapter(
                  child: CategoryChipList(),
                ),

                // Restaurants Header
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Gold Standard Kitchens (${restaurants.length})',
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Restaurants Feed List
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final r = restaurants[index];
                        final isFav = favorites.contains(r.id);
                        return RestaurantCard(
                          restaurant: r,
                          isFavorite: isFav,
                          onFavoriteToggle: () => ref.read(favoritesProvider.notifier).toggleFavorite(r.id),
                          onTap: () => context.push('/restaurant/${r.id}'),
                        );
                      },
                      childCount: restaurants.length,
                    ),
                  ),
                ),

                // Bottom padding for scrolling clearance
                const SliverToBoxAdapter(
                  child: SizedBox(height: 90),
                ),
              ],
            ),

            // Floating View Cart Pill if cart has items
            if (cart.items.isNotEmpty)
              Positioned(
                bottom: 16,
                left: 16,
                right: 16,
                child: GestureDetector(
                  onTap: () => context.push('/cart'),
                  child: Container(
                    height: 56,
                    padding: const EdgeInsets.symmetric(horizontal: 18),
                    decoration: BoxDecoration(
                      gradient: FeedoColors.goldGradient,
                      borderRadius: BorderRadius.circular(28),
                      boxShadow: [
                        BoxShadow(
                          color: FeedoColors.deepGold.withOpacity(0.35),
                          blurRadius: 18,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(7),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.12),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.shopping_bag_rounded, color: FeedoColors.textPrimaryLight, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${cart.totalItemCount} ${cart.totalItemCount == 1 ? 'ITEM' : 'ITEMS'} ADDED',
                              style: const TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: FeedoColors.textPrimaryLight,
                                letterSpacing: 0.5,
                              ),
                            ),
                            Text(
                              CurrencyFormatter.format(cart.grandTotal),
                              style: const TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: FeedoColors.textPrimaryLight,
                              ),
                            ),
                          ],
                        ),
                        const Spacer(),
                        const Row(
                          children: [
                            Text(
                              'View Cart',
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                color: FeedoColors.textPrimaryLight,
                              ),
                            ),
                            SizedBox(width: 4),
                            Icon(Icons.arrow_forward_rounded, color: FeedoColors.textPrimaryLight, size: 18),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
