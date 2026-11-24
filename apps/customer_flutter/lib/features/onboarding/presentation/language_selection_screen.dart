import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../core/localization/language_provider.dart';
import '../../../shared/widgets/feedo_button.dart';

class LanguageSelectionScreen extends ConsumerStatefulWidget {
  final bool fromProfile;

  const LanguageSelectionScreen({super.key, this.fromProfile = false});

  @override
  ConsumerState<LanguageSelectionScreen> createState() => _LanguageSelectionScreenState();
}

class _LanguageSelectionScreenState extends ConsumerState<LanguageSelectionScreen> {
  late AppLanguage _selectedLanguage;

  @override
  void initState() {
    super.initState();
    _selectedLanguage = ref.read(languageProvider);
  }

  void _onConfirm() {
    ref.read(languageProvider.notifier).setLanguage(_selectedLanguage);

    if (widget.fromProfile) {
      context.pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _selectedLanguage == AppLanguage.kannada
                ? 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಯಶಸ್ವಿಯಾಗಿ ಬದಲಾಯಿಸಲಾಗಿದೆ.'
                : 'Language switched to English successfully.',
          ),
          backgroundColor: FeedoColors.deepGold,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } else {
      context.go('/onboarding');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isKnSelected = _selectedLanguage == AppLanguage.kannada;

    return Scaffold(
      backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
      appBar: widget.fromProfile
          ? AppBar(
              backgroundColor: Colors.transparent,
              elevation: 0,
              leading: IconButton(
                icon: Icon(
                  Icons.arrow_back_ios_new_rounded,
                  color: isDark ? Colors.white : const Color(0xFF1F1A0E),
                ),
                onPressed: () => context.pop(),
              ),
            )
          : null,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 20),

              // Brand Icon Mark
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: FeedoColors.goldGradient,
                  boxShadow: [
                    BoxShadow(
                      color: FeedoColors.primaryGold.withOpacity(0.35),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Center(
                  child: Text(
                    'F',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 42,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF1F1A0E),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Main Titles
              Text(
                isKnSelected ? 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ' : 'Choose Your Language',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                isKnSelected
                    ? 'ಮುಂದುವರಿಯಲು ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆರಿಸಿ'
                    : 'Select your preferred language to get started with Feedo',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 13,
                  color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                ),
              ),

              const SizedBox(height: 36),

              // Option 1: English
              _buildLanguageCard(
                language: AppLanguage.english,
                title: 'English',
                subtitle: 'Browse all dishes, orders & features in English',
                badgeText: 'EN',
                isDark: isDark,
              ),

              const SizedBox(height: 16),

              // Option 2: Kannada
              _buildLanguageCard(
                language: AppLanguage.kannada,
                title: 'ಕನ್ನಡ (Kannada)',
                subtitle: 'ಕರ್ನಾಟಕದ ಜನಪ್ರಿಯ ಭಾಷೆ • ಎಲ್ಲಾ ಸೇವೆಗಳು ಕನ್ನಡದಲ್ಲಿ',
                badgeText: 'ಕ',
                isDark: isDark,
              ),

              const Spacer(),

              // Confirmation Action Button
              FeedoButton(
                text: isKnSelected ? 'ಮುಂದುವರಿಯಿರಿ' : 'Continue',
                onPressed: _onConfirm,
                icon: const Icon(Icons.arrow_forward_rounded, size: 18, color: Color(0xFF1F1A0E)),
              ),

              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLanguageCard({
    required AppLanguage language,
    required String title,
    required String subtitle,
    required String badgeText,
    required bool isDark,
  }) {
    final isSelected = _selectedLanguage == language;

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedLanguage = language;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark ? const Color(0xFF2A2312) : const Color(0xFFFFF9E6))
              : (isDark ? FeedoColors.surfaceDark : Colors.white),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? FeedoColors.primaryGold : (isDark ? FeedoColors.borderDark : FeedoColors.borderLight),
            width: isSelected ? 2.0 : 1.0,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: FeedoColors.primaryGold.withOpacity(0.2),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Row(
          children: [
            // Avatar badge
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: isSelected
                    ? FeedoColors.goldGradient
                    : LinearGradient(
                        colors: isDark
                            ? [const Color(0xFF332D1C), const Color(0xFF262114)]
                            : [const Color(0xFFF6F0E0), const Color(0xFFEDE4CC)],
                      ),
              ),
              child: Center(
                child: Text(
                  badgeText,
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: isSelected ? const Color(0xFF1F1A0E) : FeedoColors.deepGold,
                  ),
                ),
              ),
            ),

            const SizedBox(width: 16),

            // Texts
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 16,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                      color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                    ),
                  ),
                ],
              ),
            ),

            // Radio Circle
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? FeedoColors.deepGold : (isDark ? Colors.white30 : Colors.black26),
                  width: 2,
                ),
                color: isSelected ? FeedoColors.primaryGold : Colors.transparent,
              ),
              child: isSelected
                  ? const Center(
                      child: Icon(
                        Icons.check,
                        size: 16,
                        color: Color(0xFF1F1A0E),
                      ),
                    )
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}
