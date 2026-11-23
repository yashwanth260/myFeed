import 'package:flutter/material.dart';
import '../../core/theme/feedo_colors.dart';

enum FeedoButtonVariant { primary, secondary, outline }

class FeedoButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final FeedoButtonVariant variant;
  final Widget? icon;
  final bool isLoading;
  final double? width;
  final double height;

  const FeedoButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = FeedoButtonVariant.primary,
    this.icon,
    this.isLoading = false,
    this.width,
    this.height = 48,
  });

  @override
  State<FeedoButton> createState() => _FeedoButtonState();
}

class _FeedoButtonState extends State<FeedoButton> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.97).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails details) {
    if (widget.onPressed != null && !widget.isLoading) {
      _controller.forward();
    }
  }

  void _onTapUp(TapUpDetails details) {
    if (widget.onPressed != null && !widget.isLoading) {
      _controller.reverse();
    }
  }

  void _onTapCancel() {
    if (widget.onPressed != null && !widget.isLoading) {
      _controller.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    BoxDecoration decoration;
    Color textColor;

    switch (widget.variant) {
      case FeedoButtonVariant.primary:
        decoration = BoxDecoration(
          gradient: widget.onPressed != null ? FeedoColors.goldGradient : null,
          color: widget.onPressed == null ? (isDark ? Colors.grey[800] : Colors.grey[300]) : null,
          borderRadius: BorderRadius.circular(24),
          boxShadow: widget.onPressed != null ? [FeedoColors.goldShadow] : null,
        );
        textColor = FeedoColors.textPrimaryLight;
        break;
      case FeedoButtonVariant.secondary:
        decoration = BoxDecoration(
          color: isDark ? FeedoColors.surfaceDark : FeedoColors.lightGold.withOpacity(0.2),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: FeedoColors.primaryGold.withOpacity(0.4), width: 1),
        );
        textColor = isDark ? FeedoColors.lightGold : FeedoColors.deepGold;
        break;
      case FeedoButtonVariant.outline:
        decoration = BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: FeedoColors.primaryGold, width: 1.5),
        );
        textColor = isDark ? FeedoColors.lightGold : FeedoColors.deepGold;
        break;
    }

    return GestureDetector(
      onTapDown: _onTapDown,
      onTapUp: _onTapUp,
      onTapCancel: _onTapCancel,
      onTap: widget.isLoading ? null : widget.onPressed,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: Container(
          width: widget.width,
          height: widget.height,
          decoration: decoration,
          alignment: Alignment.center,
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: widget.isLoading
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.2,
                    valueColor: AlwaysStoppedAnimation<Color>(FeedoColors.textPrimaryLight),
                  ),
                )
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (widget.icon != null) ...[
                      widget.icon!,
                      const SizedBox(width: 8),
                    ],
                    Text(
                      widget.text,
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: textColor,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}

