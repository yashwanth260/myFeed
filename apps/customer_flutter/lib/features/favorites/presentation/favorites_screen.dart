import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../shared/widgets/gold_app_bar.dart';
import '../../../shared/widgets/restaurant_card.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../home/presentation/home_provider.dart';

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favorites = ref.watch(favoritesProvider);
    final allRestaurants = ref.watch(allRestaurantsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final favoriteRestaurants = allRestaurants.where((r) => favorites.contains(r.id)).toList();

    return Scaffold(
      backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
      appBar: const GoldAppBar(titleText: 'Your Favorites'),
      body: SafeArea(
        child: favoriteRestaurants.isEmpty
            ? EmptyState(
                icon: Icons.favorite_border_rounded,
                title: 'No Favorites Saved',
                message: 'Tap the heart icon on any restaurant or dish to easily find your favorites here.',
                actionText: 'Explore Kitchens',
                onAction: () => context.go('/home'),
              )
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: favoriteRestaurants.length,
                itemBuilder: (context, index) {
                  final r = favoriteRestaurants[index];
                  return RestaurantCard(
                    restaurant: r,
                    isFavorite: true,
                    onFavoriteToggle: () => ref.read(favoritesProvider.notifier).toggleFavorite(r.id),
                    onTap: () => context.push('/restaurant/${r.id}'),
                  );
                },
              ),
      ),
    );
  }
}

