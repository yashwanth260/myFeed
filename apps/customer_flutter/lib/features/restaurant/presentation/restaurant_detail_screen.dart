import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/rating_chip.dart';
import '../../../shared/widgets/food_item_tile.dart';
import '../../home/data/mock_feedo_data.dart';
import '../../home/presentation/home_provider.dart';
import '../../cart/presentation/cart_provider.dart';
import '../../cart/domain/cart_item_model.dart';
import '../domain/restaurant_model.dart';
import 'widgets/customization_bottom_sheet.dart';

class RestaurantDetailScreen extends ConsumerStatefulWidget {
  final String restaurantId;

  const RestaurantDetailScreen({super.key, required this.restaurantId});

  @override
  ConsumerState<RestaurantDetailScreen> createState() => _RestaurantDetailScreenState();
}

class _RestaurantDetailScreenState extends ConsumerState<RestaurantDetailScreen> {
  String? _selectedCategory;

  RestaurantModel? get _restaurant {
    try {
      return MockFeedoData.restaurants.firstWhere((r) => r.id == widget.restaurantId);
    } catch (_) {
      return MockFeedoData.restaurants.first;
    }
  }

  @override
  Widget build(BuildContext context) {
    final restaurant = _restaurant;
    if (restaurant == null) {
      return const Scaffold(body: Center(child: Text('Restaurant not found')));
    }

    final favorites = ref.watch(favoritesProvider);
    final isFav = favorites.contains(restaurant.id);
    final cart = ref.watch(cartProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Get unique categories for this restaurant
    final categories = restaurant.menuItems.map((m) => m.category).toSet().toList();
    final currentCat = _selectedCategory ?? (categories.isNotEmpty ? categories.first : null);

    final displayItems = currentCat == null
        ? restaurant.menuItems
        : restaurant.menuItems.where((m) => m.category == currentCat).toList();

    return Scaffold(
      backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              // Collapsible Hero Header Image
              SliverAppBar(
                expandedHeight: 220,
                pinned: true,
                backgroundColor: isDark ? FeedoColors.surfaceDark : FeedoColors.bgLight,
                leading: Container(
                  margin: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.5),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
                    onPressed: () => context.pop(),
                  ),
                ),
                actions: [
                  Container(
                    margin: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.5),
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: Icon(
                        isFav ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                        color: isFav ? const Color(0xFFFF4B6E) : Colors.white,
                        size: 20,
                      ),
                      onPressed: () => ref.read(favoritesProvider.notifier).toggleFavorite(restaurant.id),
                    ),
                  ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      Image.network(
                        restaurant.heroImageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(color: Colors.grey[800]),
                      ),
                      DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.black.withOpacity(0.6),
                              Colors.transparent,
                              Colors.black.withOpacity(0.7),
                            ],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Restaurant Info Card
              SliverToBoxAdapter(
                child: Container(
                  margin: const EdgeInsets.all(16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? FeedoColors.cardDark : Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isDark ? FeedoColors.borderDark : FeedoColors.borderLight,
                      width: 1.2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: FeedoColors.primaryGold.withOpacity(0.08),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              restaurant.name,
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                                color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                              ),
                            ),
                          ),
                          RatingChip(
                            rating: restaurant.rating,
                            count: restaurant.ratingCount,
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        restaurant.cuisines.join(' • '),
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 13,
                          color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Divider(),
                      const SizedBox(height: 8),

                      // Delivery & Distance Chips
                      Row(
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.timer_outlined, size: 16, color: FeedoColors.deepGold),
                              const SizedBox(width: 4),
                              Text(
                                '${restaurant.deliveryTimeMinutes} mins',
                                style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(width: 16),
                          Row(
                            children: [
                              const Icon(Icons.near_me_outlined, size: 16, color: FeedoColors.deepGold),
                              const SizedBox(width: 4),
                              Text(
                                '${restaurant.distanceKm} km away',
                                style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                                ),
                              ),
                            ],
                          ),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: FeedoColors.success.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              restaurant.baseDeliveryFee == 0 ? 'FREE DELIVERY' : '₹${restaurant.baseDeliveryFee.toInt()} Delivery',
                              style: const TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: FeedoColors.success,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              // Category Tabs (Sticky)
              SliverPersistentHeader(
                pinned: true,
                delegate: _CategoryTabHeaderDelegate(
                  categories: categories,
                  selectedCategory: currentCat,
                  onSelect: (cat) => setState(() => _selectedCategory = cat),
                  isDark: isDark,
                ),
              ),

              // Menu Items Header
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Text(
                    currentCat ?? 'Recommended',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                    ),
                  ),
                ),
              ),

              // Menu List
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final item = displayItems[index];

                    // Check if already in cart
                    final cartItem = cart.items.cast<CartItemModel?>().firstWhere(
                          (c) => c?.item.id == item.id,
                          orElse: () => null,
                        );
                    final quantity = cartItem?.quantity ?? 0;

                    return FoodItemTile(
                      item: item,
                      quantity: quantity,
                      onAdd: () {
                        if (item.customizationGroups.isNotEmpty) {
                          showModalBottomSheet(
                            context: context,
                            isScrollControlled: true,
                            builder: (_) => CustomizationBottomSheet(
                              restaurant: restaurant,
                              item: item,
                            ),
                          );
                        } else {
                          final added = ref.read(cartProvider.notifier).addItem(
                                restaurant: restaurant,
                                item: item,
                              );
                          if (!added) {
                            _showCartConflictModal(context, restaurant, item);
                          }
                        }
                      },
                      onIncrement: () {
                        if (cartItem != null) {
                          ref.read(cartProvider.notifier).incrementQuantity(cartItem.id);
                        }
                      },
                      onDecrement: () {
                        if (cartItem != null) {
                          ref.read(cartProvider.notifier).decrementQuantity(cartItem.id);
                        }
                      },
                      onTap: () {
                        if (item.customizationGroups.isNotEmpty) {
                          showModalBottomSheet(
                            context: context,
                            isScrollControlled: true,
                            builder: (_) => CustomizationBottomSheet(
                              restaurant: restaurant,
                              item: item,
                            ),
                          );
                        }
                      },
                    );
                  },
                  childCount: displayItems.length,
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          ),

          // Floating View Cart bar
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
    );
  }

  void _showCartConflictModal(BuildContext context, RestaurantModel restaurant, MenuItemModel item) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Start New Cart?'),
        content: const Text(
          'Your cart currently contains items from another kitchen. Would you like to clear them and start a new order?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              ref.read(cartProvider.notifier).forceAddItem(
                    restaurant: restaurant,
                    item: item,
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

class _CategoryTabHeaderDelegate extends SliverPersistentHeaderDelegate {
  final List<String> categories;
  final String? selectedCategory;
  final ValueChanged<String> onSelect;
  final bool isDark;

  _CategoryTabHeaderDelegate({
    required this.categories,
    required this.selectedCategory,
    required this.onSelect,
    required this.isDark,
  });

  @override
  double get minExtent => 52;
  @override
  double get maxExtent => 52;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final cat = categories[index];
          final isSelected = selectedCategory == cat;
          return ChoiceChip(
            label: Text(cat),
            selected: isSelected,
            selectedColor: FeedoColors.lightGold.withOpacity(0.4),
            onSelected: (_) => onSelect(cat),
          );
        },
      ),
    );
  }

  @override
  bool shouldRebuild(covariant _CategoryTabHeaderDelegate oldDelegate) {
    return oldDelegate.selectedCategory != selectedCategory || oldDelegate.isDark != isDark;
  }
}
