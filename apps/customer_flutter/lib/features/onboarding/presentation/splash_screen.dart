import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/theme_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    _scaleAnimation = Tween<double>(begin: 0.7, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.2, 1.0, curve: Curves.easeIn)),
    );

    _controller.forward();

    Future.delayed(const Duration(milliseconds: 2200), () {
      if (mounted) {
        final storage = ref.read(localStorageServiceProvider);
        if (!storage.hasChosenLanguage) {
          context.go('/language');
        } else if (storage.isLoggedIn) {
          context.go('/home');
        } else {
          context.go('/onboarding');
        }
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFFFF9E6), Color(0xFFFBEBC2), Color(0xFFE6C468)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Center(
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return FadeTransition(
                opacity: _fadeAnimation,
                child: ScaleTransition(
                  scale: _scaleAnimation,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Gold Bowl / Pin Logo Mark
                      Container(
                        width: 90,
                        height: 90,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: FeedoColors.goldGradient,
                          boxShadow: [
                            BoxShadow(
                              color: FeedoColors.deepGold.withOpacity(0.4),
                              blurRadius: 24,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.restaurant_menu_rounded,
                            size: 46,
                            color: Color(0xFF1F1A0E),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Brand Wordmark
                      const Text(
                        AppConstants.appName,
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 40,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF1F1A0E),
                          letterSpacing: -1,
                        ),
                      ),
                      const SizedBox(height: 6),

                      // Tagline
                      const Text(
                        AppConstants.appTagline,
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF6B5E3C),
                          letterSpacing: 0.2,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

