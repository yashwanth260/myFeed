import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/feedo_colors.dart';
import '../home_provider.dart';

class LocationSelectorSheet extends ConsumerWidget {
  const LocationSelectorSheet({super.key});

  static const List<Map<String, String>> savedAddresses = [
    {
      'label': 'Home',
      'icon': 'home',
      'address': '42 MG Road, Indiranagar, Bengaluru 560038',
    },
    {
      'label': 'Work',
      'icon': 'work',
      'address': 'Prestige Tech Cloud, Marathahalli, Bengaluru 560087',
    },
    {
      'label': 'Current Location',
      'icon': 'gps',
      'address': '100ft Road, Defence Colony, Indiranagar, Bengaluru',
    },
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentAddress = ref.watch(selectedAddressProvider);
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
                'Select Delivery Location',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 16),

          ...savedAddresses.map((addr) {
            final isSelected = currentAddress == addr['address'];
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: isSelected
                    ? (isDark ? FeedoColors.cardDark : FeedoColors.lightGold.withOpacity(0.15))
                    : (isDark ? FeedoColors.surfaceDark : Colors.white),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected ? FeedoColors.primaryGold : (isDark ? FeedoColors.borderDark : FeedoColors.borderLight),
                  width: isSelected ? 1.5 : 1.0,
                ),
              ),
              child: ListTile(
                onTap: () {
                  ref.read(selectedAddressProvider.notifier).state = addr['address']!;
                  Navigator.pop(context);
                },
                leading: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: FeedoColors.lightGold.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    addr['icon'] == 'home'
                        ? Icons.home_rounded
                        : (addr['icon'] == 'work' ? Icons.work_rounded : Icons.my_location_rounded),
                    color: FeedoColors.deepGold,
                    size: 20,
                  ),
                ),
                title: Text(
                  addr['label']!,
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                  ),
                ),
                subtitle: Text(
                  addr['address']!,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 12,
                    color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                  ),
                ),
                trailing: isSelected
                    ? const Icon(Icons.check_circle_rounded, color: FeedoColors.deepGold)
                    : null,
              ),
            );
          }),
          const SizedBox(height: 10),
        ],
      ),
    );
  }
}

