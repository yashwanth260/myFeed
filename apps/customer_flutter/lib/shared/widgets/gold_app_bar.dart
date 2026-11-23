import 'package:flutter/material.dart';
import '../../core/theme/feedo_colors.dart';

class GoldAppBar extends StatelessWidget implements PreferredSizeWidget {
  final Widget? title;
  final String? titleText;
  final List<Widget>? actions;
  final Widget? leading;
  final bool centerTitle;
  final bool showBottomBorder;

  const GoldAppBar({
    super.key,
    this.title,
    this.titleText,
    this.actions,
    this.leading,
    this.centerTitle = false,
    this.showBottomBorder = false,
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AppBar(
      elevation: 0,
      centerTitle: centerTitle,
      backgroundColor: isDark ? FeedoColors.surfaceDark : FeedoColors.bgLight,
      leading: leading ?? (Navigator.canPop(context) ? const BackButton() : null),
      title: title ??
          (titleText != null
              ? Text(
                  titleText!,
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontWeight: FontWeight.w700,
                    fontSize: 18,
                    color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                  ),
                )
              : null),
      actions: actions,
      bottom: showBottomBorder
          ? PreferredSize(
              preferredSize: const Size.fromHeight(1.0),
              child: Container(
                color: isDark ? FeedoColors.borderDark : FeedoColors.borderLight,
                height: 1.0,
              ),
            )
          : null,
    );
  }
}

