import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../core/localization/language_provider.dart';
import '../../orders/presentation/orders_provider.dart';

class MainShellScreen extends ConsumerWidget {
  final StatefulNavigationShell navigationShell;

  const MainShellScreen({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeOrder = ref.watch(ordersProvider).activeOrder;
    final strings = ref.watch(appStringsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final currentIndex = navigationShell.currentIndex;

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: Container(
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        height: 64,
        decoration: BoxDecoration(
          color: isDark ? FeedoColors.surfaceDark : Colors.white,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(
            color: isDark ? FeedoColors.borderDark : FeedoColors.borderLight,
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black.withOpacity(0.4) : FeedoColors.primaryGold.withOpacity(0.14),
              blurRadius: 20,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _NavItem(
              icon: Icons.home_rounded,
              label: strings.navHome,
              isSelected: currentIndex == 0,
              onTap: () => navigationShell.goBranch(0),
            ),
            _NavItem(
              icon: Icons.search_rounded,
              label: strings.navSearch,
              isSelected: currentIndex == 1,
              onTap: () => navigationShell.goBranch(1),
            ),
            _NavItem(
              icon: Icons.receipt_long_rounded,
              label: strings.navOrders,
              hasBadge: activeOrder != null,
              isSelected: currentIndex == 2,
              onTap: () => navigationShell.goBranch(2),
            ),
            _NavItem(
              icon: Icons.favorite_rounded,
              label: strings.navFavorites,
              isSelected: currentIndex == 3,
              onTap: () => navigationShell.goBranch(3),
            ),
            _NavItem(
              icon: Icons.person_rounded,
              label: strings.navProfile,
              isSelected: currentIndex == 4,
              onTap: () => navigationShell.goBranch(4),
            ),
          ],
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final bool hasBadge;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.isSelected,
    this.hasBadge = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(
                  icon,
                  size: 24,
                  color: isSelected ? FeedoColors.deepGold : Colors.grey[400],
                ),
                if (hasBadge)
                  Positioned(
                    right: -2,
                    top: -2,
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
            const SizedBox(height: 3),
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: isSelected ? 4 : 0,
              height: 4,
              decoration: const BoxDecoration(
                color: FeedoColors.deepGold,
                shape: BoxShape.circle,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

