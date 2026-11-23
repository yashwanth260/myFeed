import 'package:flutter/material.dart';
import '../../core/theme/feedo_colors.dart';
import 'feedo_button.dart';

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;
  final String? actionText;
  final VoidCallback? onAction;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.actionText,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32.0, vertical: 48.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: FeedoColors.lightGold.withOpacity(0.18),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 40,
                color: FeedoColors.deepGold,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 13,
                color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                height: 1.4,
              ),
              textAlign: TextAlign.center,
            ),
            if (actionText != null && onAction != null) ...[
              const SizedBox(height: 24),
              FeedoButton(
                text: actionText!,
                onPressed: onAction,
                variant: FeedoButtonVariant.primary,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

