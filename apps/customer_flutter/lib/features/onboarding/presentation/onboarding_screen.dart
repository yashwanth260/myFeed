import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../shared/widgets/feedo_button.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;

  final List<_OnboardingItem> _items = const [
    _OnboardingItem(
      title: 'Discover Gold Standards',
      description: 'Explore premier restaurants, royal biryanis, sourdough crusts and chef curated feasts.',
      icon: Icons.explore_rounded,
    ),
    _OnboardingItem(
      title: 'Seamless Feast Customisation',
      description: 'Tailor every portion size, cheese bursts, and spice levels with instant bill breakdowns.',
      icon: Icons.room_service_rounded,
    ),
    _OnboardingItem(
      title: 'Precision GPS Live Tracking',
      description: 'Follow your dedicated rider in real-time from kitchen wok to your doorstep with verified OTP security.',
      icon: Icons.moped_rounded,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        actions: [
          TextButton(
            onPressed: () => context.go('/login'),
            child: const Text(
              'Skip',
              style: TextStyle(
                fontFamily: 'Inter',
                fontWeight: FontWeight.w700,
                color: FeedoColors.deepGold,
              ),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: _items.length,
                onPageChanged: (i) => setState(() => _currentIndex = i),
                itemBuilder: (context, index) {
                  final item = _items[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 140,
                          height: 140,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: FeedoColors.goldGradient,
                            boxShadow: [FeedoColors.goldShadow],
                          ),
                          child: Icon(
                            item.icon,
                            size: 68,
                            color: const Color(0xFF1F1A0E),
                          ),
                        ),
                        const SizedBox(height: 36),
                        Text(
                          item.title,
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          item.description,
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 14,
                            color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                            height: 1.4,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            // Page Indicators
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(_items.length, (i) {
                final isSelected = i == _currentIndex;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: isSelected ? 24 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: isSelected ? FeedoColors.primaryGold : (isDark ? Colors.grey[800] : Colors.grey[300]),
                    borderRadius: BorderRadius.circular(4),
                  ),
                );
              }),
            ),
            const SizedBox(height: 36),

            // CTA Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
              child: FeedoButton(
                width: double.infinity,
                height: 52,
                text: _currentIndex == _items.length - 1 ? 'Get Started' : 'Continue',
                onPressed: () {
                  if (_currentIndex < _items.length - 1) {
                    _pageController.nextPage(
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                    );
                  } else {
                    context.go('/login');
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnboardingItem {
  final String title;
  final String description;
  final IconData icon;

  const _OnboardingItem({
    required this.title,
    required this.description,
    required this.icon,
  });
}

