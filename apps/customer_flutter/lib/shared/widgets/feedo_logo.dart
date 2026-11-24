import 'package:flutter/material.dart';
import '../../core/theme/feedo_colors.dart';

enum FeedoLogoVariant {
  emblemOnly,
  lockup,
  emblemWithText,
}

class FeedoLogo extends StatelessWidget {
  final double size;
  final FeedoLogoVariant variant;
  final bool showShadow;
  final Color? textColor;

  const FeedoLogo({
    super.key,
    this.size = 56,
    this.variant = FeedoLogoVariant.emblemOnly,
    this.showShadow = true,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    if (variant == FeedoLogoVariant.lockup) {
      return Image.asset(
        'assets/images/feedo_logo.png',
        height: size,
        fit: BoxFit.contain,
        errorBuilder: (context, error, stackTrace) => _fallbackEmblem(context),
      );
    }

    if (variant == FeedoLogoVariant.emblemWithText) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildEmblem(context),
          const SizedBox(height: 12),
          Text(
            'FEEDO',
            style: TextStyle(
              fontFamily: 'Poppins',
              fontSize: size * 0.38,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.5,
              color: textColor ?? const Color(0xFF1F1A0E),
            ),
          ),
        ],
      );
    }

    return _buildEmblem(context);
  }

  Widget _buildEmblem(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: showShadow
          ? BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: FeedoColors.primaryGold.withOpacity(0.35),
                  blurRadius: size * 0.3,
                  spreadRadius: 1,
                  offset: Offset(0, size * 0.08),
                ),
              ],
            )
          : null,
      child: Image.asset(
        'assets/images/feedo_emblem.png',
        width: size,
        height: size,
        fit: BoxFit.contain,
        errorBuilder: (context, error, stackTrace) => _fallbackEmblem(context),
      ),
    );
  }

  Widget _fallbackEmblem(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: FeedoColors.goldGradient,
      ),
      child: Center(
        child: Icon(
          Icons.restaurant_menu_rounded,
          size: size * 0.5,
          color: const Color(0xFF1F1A0E),
        ),
      ),
    );
  }
}
