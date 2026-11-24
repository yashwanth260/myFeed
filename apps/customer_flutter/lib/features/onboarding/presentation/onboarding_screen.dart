import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../core/localization/language_provider.dart';
import '../../../shared/widgets/feedo_button.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final strings = ref.watch(appStringsProvider);
    final currentLang = ref.watch(languageProvider);

    final items = [
      _OnboardingItem(
        title: strings.onbTitle1,
        description: strings.onbDesc1,
        icon: Icons.explore_rounded,
      ),
      _OnboardingItem(
        title: strings.onbTitle2,
        description: strings.onbDesc2,
        icon: Icons.room_service_rounded,
      ),
      _OnboardingItem(
        title: strings.onbTitle3,
        description: strings.onbDesc3,
        icon: Icons.moped_rounded,
      ),
    ];

    return Scaffold(
      backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: InkWell(
          onTap: () => ref.read(languageProvider.notifier).toggleLanguage(),
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF262114) : const Color(0xFFFFF3D6),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: FeedoColors.primaryGold.withOpacity(0.5), width: 1),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.language_rounded, size: 14, color: FeedoColors.deepGold),
                const SizedBox(width: 5),
                Text(
                  currentLang == AppLanguage.kannada ? 'ಕನ್ನಡ' : 'EN',
                  style: const TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: FeedoColors.deepGold,
                  ),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => context.go('/login'),
            child: Text(
              strings.skip,
              style: const TextStyle(
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
                itemCount: items.length,
                onPageChanged: (i) => setState(() => _currentIndex = i),
                itemBuilder: (context, index) {
                  final item = items[index];
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
              children: List.generate(items.length, (i) {
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
                text: _currentIndex == items.length - 1 ? strings.getStarted : strings.continueBtn,
                onPressed: () {
                  if (_currentIndex < items.length - 1) {
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
