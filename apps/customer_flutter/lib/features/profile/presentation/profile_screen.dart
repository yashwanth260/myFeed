import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../core/theme/theme_provider.dart';
import '../../../shared/widgets/gold_app_bar.dart';
import '../../../shared/widgets/feedo_card.dart';
import '../../../shared/widgets/feedo_button.dart';
import '../../auth/presentation/auth_provider.dart';
import '../../home/presentation/widgets/location_selector_sheet.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).value;
    final isDark = ref.watch(themeModeProvider);

    return Scaffold(
      backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
      appBar: const GoldAppBar(titleText: 'Account Profile'),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // User Info Card
            FeedoCard(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 20),
              child: Row(
                children: [
                  Container(
                    width: 58,
                    height: 58,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: FeedoColors.goldGradient,
                      boxShadow: [FeedoColors.goldShadow],
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      user?.name.isNotEmpty == true ? user!.name[0].toUpperCase() : 'A',
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF1F1A0E),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              user?.name ?? 'Alex Johnson',
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: FeedoColors.lightGold.withOpacity(0.3),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text(
                                '👑 GOLD',
                                style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  color: FeedoColors.deepGold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          user?.email ?? 'alex.johnson@feedo.com',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 12,
                            color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          user?.phone ?? '+91 98765 43210',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 12,
                            color: isDark ? FeedoColors.textMutedDark : FeedoColors.textMutedLight,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.edit_outlined, size: 20, color: FeedoColors.deepGold),
                    onPressed: () => _showEditProfileDialog(context, ref, user?.name ?? '', user?.email ?? ''),
                  ),
                ],
              ),
            ),

            // Settings Section
            _SectionTitle('PREFERENCES & APP THEME'),
            FeedoCard(
              padding: const EdgeInsets.symmetric(vertical: 4),
              margin: const EdgeInsets.only(bottom: 20),
              child: Column(
                children: [
                  SwitchListTile(
                    title: const Text('Dark Mode', style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w600)),
                    subtitle: const Text('Warm charcoal canvas with gold accents', style: TextStyle(fontSize: 11)),
                    value: isDark,
                    activeColor: FeedoColors.primaryGold,
                    secondary: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: FeedoColors.lightGold.withOpacity(0.2),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                        color: FeedoColors.deepGold,
                        size: 20,
                      ),
                    ),
                    onChanged: (val) => ref.read(themeModeProvider.notifier).setTheme(val),
                  ),
                ],
              ),
            ),

            _SectionTitle('ACCOUNT & ORDERS'),
            FeedoCard(
              padding: const EdgeInsets.symmetric(vertical: 4),
              margin: const EdgeInsets.only(bottom: 20),
              child: Column(
                children: [
                  _ProfileTile(
                    icon: Icons.location_on_outlined,
                    title: 'Saved Addresses',
                    subtitle: 'Home, Office & custom locations',
                    onTap: () {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        builder: (_) => const LocationSelectorSheet(),
                      );
                    },
                  ),
                  const Divider(height: 1),
                  _ProfileTile(
                    icon: Icons.local_offer_outlined,
                    title: 'Offers & Coupons',
                    subtitle: 'Available gold vouchers and deals',
                    onTap: () => context.push('/offers'),
                  ),
                  const Divider(height: 1),
                  _ProfileTile(
                    icon: Icons.favorite_border_rounded,
                    title: 'Favorites',
                    subtitle: 'Bookmarked kitchens and dishes',
                    onTap: () => context.push('/favorites'),
                  ),
                ],
              ),
            ),

            _SectionTitle('HELP & LEGAL'),
            FeedoCard(
              padding: const EdgeInsets.symmetric(vertical: 4),
              margin: const EdgeInsets.only(bottom: 24),
              child: Column(
                children: [
                  _ProfileTile(
                    icon: Icons.support_agent_rounded,
                    title: 'Feedo 24/7 Support',
                    subtitle: 'FAQs, chat assistance, order help',
                    onTap: () => _showSupportDialog(context),
                  ),
                  const Divider(height: 1),
                  _ProfileTile(
                    icon: Icons.info_outline_rounded,
                    title: 'About Feedo',
                    subtitle: 'v1.0.0 • Gold-standard food, delivered.',
                    onTap: () => _showAboutDialog(context),
                  ),
                ],
              ),
            ),

            // Logout Button
            FeedoButton(
              text: 'Log Out',
              variant: FeedoButtonVariant.outline,
              icon: const Icon(Icons.logout_rounded, size: 18),
              onPressed: () => _showLogoutDialog(context, ref),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  void _showEditProfileDialog(BuildContext context, WidgetRef ref, String currentName, String currentEmail) {
    final nameController = TextEditingController(text: currentName);
    final emailController = TextEditingController(text: currentEmail);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Edit Profile'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(labelText: 'Full Name'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: emailController,
              decoration: const InputDecoration(labelText: 'Email Address'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          FeedoButton(
            text: 'Save Changes',
            height: 40,
            onPressed: () {
              ref.read(authProvider.notifier).updateProfile(
                    name: nameController.text.trim(),
                    email: emailController.text.trim(),
                  );
              Navigator.pop(ctx);
            },
          ),
        ],
      ),
    );
  }

  void _showSupportDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.support_agent_rounded, color: FeedoColors.deepGold),
            SizedBox(width: 8),
            Text('Feedo Concierge'),
          ],
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('How can we help your dining experience?'),
            SizedBox(height: 14),
            Text('• Phone Support: 1800-419-FEEDO (Toll-Free)'),
            SizedBox(height: 6),
            Text('• WhatsApp Concierge: +91 98765 00000'),
            SizedBox(height: 6),
            Text('• Email: concierge@feedo.com'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.restaurant_menu_rounded, color: FeedoColors.deepGold),
            SizedBox(width: 8),
            Text('About Feedo'),
          ],
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Feedo Customer App v1.0.0 (Production Release)'),
            SizedBox(height: 8),
            Text(
              'Feedo is an elite food delivery experience designed with warm gold aesthetics, precision order tracking, and hand-selected artisanal kitchens.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  void _showLogoutDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Log Out'),
        content: const Text('Are you sure you want to log out of Feedo?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) {
                context.go('/login');
              }
            },
            child: const Text('Log Out', style: TextStyle(color: FeedoColors.error, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;

  const _SectionTitle(this.text);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        text,
        style: TextStyle(
          fontFamily: 'Inter',
          fontSize: 11,
          fontWeight: FontWeight.w800,
          color: isDark ? FeedoColors.lightGold : FeedoColors.deepGold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

class _ProfileTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ProfileTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ListTile(
      onTap: onTap,
      leading: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: FeedoColors.lightGold.withOpacity(0.18),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: FeedoColors.deepGold, size: 20),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontFamily: 'Poppins',
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(
          fontFamily: 'Inter',
          fontSize: 11,
          color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
        ),
      ),
      trailing: const Icon(Icons.chevron_right_rounded, size: 20, color: Colors.grey),
    );
  }
}
