import 'package:flutter/material.dart';
import '../../core/theme/feedo_colors.dart';

class FeedoCard extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final double borderRadius;
  final Color? color;
  final Border? border;
  final List<BoxShadow>? boxShadow;

  const FeedoCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding,
    this.margin,
    this.borderRadius = 16.0,
    this.color,
    this.border,
    this.boxShadow,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final cardBorder = border ??
        Border.all(
          color: isDark ? FeedoColors.borderDark : FeedoColors.borderLight,
          width: 1.0,
        );

    final cardShadow = boxShadow ??
        [
          BoxShadow(
            color: isDark
                ? Colors.black.withOpacity(0.3)
                : FeedoColors.primaryGold.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ];

    return Container(
      margin: margin ?? EdgeInsets.zero,
      decoration: BoxDecoration(
        color: color ?? (isDark ? FeedoColors.cardDark : FeedoColors.cardLight),
        borderRadius: BorderRadius.circular(borderRadius),
        border: cardBorder,
        boxShadow: cardShadow,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(borderRadius),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(borderRadius),
          child: Padding(
            padding: padding ?? const EdgeInsets.all(16.0),
            child: child,
          ),
        ),
      ),
    );
  }
}

