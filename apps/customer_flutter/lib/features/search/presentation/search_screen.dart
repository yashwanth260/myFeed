import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../shared/widgets/restaurant_card.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../home/presentation/home_provider.dart';
import 'widgets/filter_bottom_sheet.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();

  final List<String> _popularTags = const [
    'Hyderabadi Biryani',
    'Truffle Burrata Pizza',
    'Smash Burger',
    'Butter Chicken',
    'Cold Pressed Juice',
    'Filter Coffee',
    'Dim Sum',
  ];

  @override
  void initState() {
    super.initState();
    _searchController.text = ref.read(searchFilterProvider).searchQuery;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearch(String query) {
    ref.read(searchFilterProvider.notifier).setSearchQuery(query);
  }

  @override
  Widget build(BuildContext context) {
    final restaurants = ref.watch(filteredRestaurantsProvider);
    final filter = ref.watch(searchFilterProvider);
    final favorites = ref.watch(favoritesProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
      appBar: AppBar(
        titleSpacing: 0,
        title: Container(
          height: 44,
          margin: const EdgeInsets.only(right: 16),
          decoration: BoxDecoration(
            color: isDark ? FeedoColors.surfaceDark : Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isDark ? FeedoColors.borderDark : FeedoColors.borderLight,
            ),
          ),
          child: TextField(
            controller: _searchController,
            autofocus: filter.searchQuery.isEmpty,
            onChanged: _onSearch,
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 14,
              color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
            ),
            decoration: InputDecoration(
              hintText: 'Search dishes, restaurants, cuisines...',
              hintStyle: TextStyle(
                fontFamily: 'Inter',
                fontSize: 13,
                color: isDark ? Colors.grey[500] : Colors.grey[400],
              ),
              prefixIcon: const Icon(Icons.search_rounded, color: FeedoColors.deepGold, size: 20),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear_rounded, size: 18),
                      onPressed: () {
                        _searchController.clear();
                        _onSearch('');
                      },
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 10),
            ),
          ),
        ),
        actions: [
          IconButton(
            icon: Stack(
              children: [
                const Icon(Icons.tune_rounded, color: FeedoColors.deepGold),
                if (filter.vegOnly || filter.minRating > 0 || filter.maxDeliveryTime != null)
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: FeedoColors.error,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            ),
            onPressed: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                builder: (_) => const FilterBottomSheet(),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Recent / Popular Search Tags
            if (_searchController.text.isEmpty) ...[
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Text(
                  'Popular Searches',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _popularTags.map((tag) {
                    return ActionChip(
                      label: Text(tag),
                      avatar: const Icon(Icons.trending_up_rounded, size: 14, color: FeedoColors.deepGold),
                      onPressed: () {
                        _searchController.text = tag;
                        _onSearch(tag);
                      },
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 16),
              const Divider(),
            ],

            // Results count
            if (_searchController.text.isNotEmpty)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                child: Text(
                  'Showing ${restaurants.length} matches for "${_searchController.text}"',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: isDark ? FeedoColors.textMutedDark : FeedoColors.textMutedLight,
                  ),
                ),
              ),

            // Search Results List or Empty State
            Expanded(
              child: restaurants.isEmpty
                  ? EmptyState(
                      icon: Icons.search_off_rounded,
                      title: 'No Matches Found',
                      message: 'We couldn\'t find any restaurants or dishes matching your search. Try different keywords or reset filters.',
                      actionText: 'Reset Filters',
                      onAction: () {
                        _searchController.clear();
                        ref.read(searchFilterProvider.notifier).resetFilters();
                        _onSearch('');
                      },
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: restaurants.length,
                      itemBuilder: (context, index) {
                        final r = restaurants[index];
                        return RestaurantCard(
                          restaurant: r,
                          isFavorite: favorites.contains(r.id),
                          onFavoriteToggle: () => ref.read(favoritesProvider.notifier).toggleFavorite(r.id),
                          onTap: () => context.push('/restaurant/${r.id}'),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

