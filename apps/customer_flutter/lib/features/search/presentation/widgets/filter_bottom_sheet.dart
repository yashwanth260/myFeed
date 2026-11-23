import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/feedo_colors.dart';
import '../../../home/presentation/home_provider.dart';
import '../../../../shared/widgets/feedo_button.dart';

class FilterBottomSheet extends ConsumerWidget {
  const FilterBottomSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filter = ref.watch(searchFilterProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Filters & Sorting',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                ),
              ),
              TextButton(
                onPressed: () => ref.read(searchFilterProvider.notifier).resetFilters(),
                child: const Text('Reset All', style: TextStyle(color: FeedoColors.deepGold)),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Dietary preference: Veg Only Switch
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(
              'Pure Veg Only',
              style: TextStyle(
                fontFamily: 'Inter',
                fontWeight: FontWeight.w600,
                color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
              ),
            ),
            subtitle: const Text('Show kitchens and dishes that are 100% vegetarian'),
            value: filter.vegOnly,
            activeColor: FeedoColors.primaryGold,
            onChanged: (v) => ref.read(searchFilterProvider.notifier).toggleVegOnly(),
          ),
          const Divider(),

          // Rating Filter
          const SizedBox(height: 8),
          Text(
            'Minimum Rating',
            style: TextStyle(
              fontFamily: 'Poppins',
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [0.0, 4.0, 4.5, 4.8].map((rating) {
              final isSelected = filter.minRating == rating;
              return Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: ChoiceChip(
                  label: Text(rating == 0.0 ? 'Any' : '$rating+ ★'),
                  selected: isSelected,
                  selectedColor: FeedoColors.lightGold.withOpacity(0.4),
                  onSelected: (_) => ref.read(searchFilterProvider.notifier).setMinRating(rating),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 16),
          const Divider(),

          // Delivery Time
          const SizedBox(height: 8),
          Text(
            'Delivery Speed',
            style: TextStyle(
              fontFamily: 'Poppins',
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [null, 20, 30].map((mins) {
              final isSelected = filter.maxDeliveryTime == mins;
              return Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: ChoiceChip(
                  label: Text(mins == null ? 'Any time' : '< $mins mins'),
                  selected: isSelected,
                  selectedColor: FeedoColors.lightGold.withOpacity(0.4),
                  onSelected: (_) => ref.read(searchFilterProvider.notifier).setMaxDeliveryTime(mins),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 24),
          FeedoButton(
            width: double.infinity,
            text: 'Apply Filters',
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
    );
  }
}

