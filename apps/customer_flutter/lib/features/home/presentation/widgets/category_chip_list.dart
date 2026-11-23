import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/feedo_colors.dart';
import '../home_provider.dart';

class CategoryChipList extends ConsumerWidget {
  const CategoryChipList({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categories = ref.watch(categoriesProvider);
    final selectedCategory = ref.watch(selectedCategoryProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SizedBox(
      height: 94,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: categories.length + 1, // +1 for "All"
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (context, index) {
          if (index == 0) {
            final isSelected = selectedCategory == null;
            return GestureDetector(
              onTap: () => ref.read(selectedCategoryProvider.notifier).state = null,
              child: Column(
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: 58,
                    height: 58,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: isSelected ? FeedoColors.goldGradient : null,
                      color: !isSelected ? (isDark ? FeedoColors.cardDark : Colors.white) : null,
                      border: Border.all(
                        color: isSelected ? FeedoColors.deepGold : (isDark ? FeedoColors.borderDark : FeedoColors.borderLight),
                        width: isSelected ? 1.5 : 1.0,
                      ),
                      boxShadow: isSelected ? [FeedoColors.goldShadow] : null,
                    ),
                    child: Center(
                      child: Text(
                        '✨',
                        style: const TextStyle(fontSize: 22),
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'All',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                      color: isSelected
                          ? (isDark ? FeedoColors.lightGold : FeedoColors.deepGold)
                          : (isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight),
                    ),
                  ),
                ],
              ),
            );
          }

          final cat = categories[index - 1];
          final isSelected = selectedCategory == cat.name;

          return GestureDetector(
            onTap: () {
              ref.read(selectedCategoryProvider.notifier).state = isSelected ? null : cat.name;
            },
            child: Column(
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 58,
                  height: 58,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: isSelected ? FeedoColors.goldGradient : null,
                    color: !isSelected ? (isDark ? FeedoColors.cardDark : Colors.white) : null,
                    border: Border.all(
                      color: isSelected ? FeedoColors.deepGold : (isDark ? FeedoColors.borderDark : FeedoColors.borderLight),
                      width: isSelected ? 1.5 : 1.0,
                    ),
                    boxShadow: isSelected ? [FeedoColors.goldShadow] : null,
                  ),
                  child: Center(
                    child: Text(
                      cat.icon,
                      style: const TextStyle(fontSize: 24),
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  cat.name,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                    color: isSelected
                        ? (isDark ? FeedoColors.lightGold : FeedoColors.deepGold)
                        : (isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

