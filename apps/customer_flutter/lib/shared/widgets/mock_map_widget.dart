import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../core/theme/feedo_colors.dart';

class MockMapWidget extends StatefulWidget {
  final double height;
  final String restaurantName;
  final String customerAddress;

  const MockMapWidget({
    super.key,
    this.height = 260,
    required this.restaurantName,
    required this.customerAddress,
  });

  @override
  State<MockMapWidget> createState() => _MockMapWidgetState();
}

class _MockMapWidgetState extends State<MockMapWidget> with SingleTickerProviderStateMixin {
  late AnimationController _animController;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 14),
    )..repeat();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      height: widget.height,
      width: double.infinity,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF181611) : const Color(0xFFF9F6ED),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? FeedoColors.borderDark : FeedoColors.borderLight,
          width: 1,
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          // Custom Painted Map Background
          AnimatedBuilder(
            animation: _animController,
            builder: (context, child) {
              return CustomPaint(
                size: Size.infinite,
                painter: _MapCanvasPainter(
                  progress: _animController.value,
                  isDark: isDark,
                ),
              );
            },
          ),

          // Restaurant Pin
          const Positioned(
            top: 40,
            left: 36,
            child: _LocationMarker(
              label: 'Kitchen',
              icon: Icons.storefront_rounded,
              color: FeedoColors.deepGold,
            ),
          ),

          // Customer Pin
          const Positioned(
            bottom: 40,
            right: 40,
            child: _LocationMarker(
              label: 'You',
              icon: Icons.home_rounded,
              color: FeedoColors.success,
            ),
          ),

          // Compass & GPS overlay pills
          Positioned(
            top: 12,
            right: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: isDark ? FeedoColors.surfaceDark.withOpacity(0.9) : Colors.white.withOpacity(0.9),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: FeedoColors.borderLight),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.gps_fixed, size: 12, color: FeedoColors.deepGold),
                  SizedBox(width: 4),
                  Text(
                    'Live Simulation',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: FeedoColors.deepGold,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LocationMarker extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;

  const _LocationMarker({
    required this.label,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.75),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            label,
            style: const TextStyle(
              fontFamily: 'Inter',
              color: Colors.white,
              fontSize: 10,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        const SizedBox(height: 2),
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(0.4),
                blurRadius: 8,
                spreadRadius: 2,
              ),
            ],
            border: Border.all(color: Colors.white, width: 2),
          ),
          child: Icon(icon, color: Colors.white, size: 16),
        ),
      ],
    );
  }
}

class _MapCanvasPainter extends CustomPainter {
  final double progress;
  final bool isDark;

  _MapCanvasPainter({required this.progress, required this.isDark});

  @override
  void paint(Canvas canvas, Size size) {
    final roadColor = isDark ? const Color(0xFF2B261D) : const Color(0xFFEDE4CE);
    final blockColor = isDark ? const Color(0xFF1E1A13) : const Color(0xFFF7F2E6);

    // Draw City Block Grids
    final blockPaint = Paint()..color = blockColor;
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), blockPaint);

    final roadPaint = Paint()
      ..color = roadColor
      ..strokeWidth = 14
      ..style = PaintingStyle.stroke;

    // Grid Roads
    final h1 = Path()..moveTo(0, size.height * 0.3)..lineTo(size.width, size.height * 0.3);
    final h2 = Path()..moveTo(0, size.height * 0.7)..lineTo(size.width, size.height * 0.7);
    final v1 = Path()..moveTo(size.width * 0.35, 0)..lineTo(size.width * 0.35, size.height);
    final v2 = Path()..moveTo(size.width * 0.75, 0)..lineTo(size.width * 0.75, size.height);

    canvas.drawPath(h1, roadPaint);
    canvas.drawPath(h2, roadPaint);
    canvas.drawPath(v1, roadPaint);
    canvas.drawPath(v2, roadPaint);

    // Diagonal main avenue
    final avenue = Path()
      ..moveTo(0, size.height * 0.1)
      ..cubicTo(size.width * 0.4, size.height * 0.2, size.width * 0.6, size.height * 0.8, size.width, size.height * 0.9);
    canvas.drawPath(avenue, roadPaint..strokeWidth = 18);

    // Delivery Route (Dotted Gold Path)
    final routePath = Path();
    final start = Offset(50, 65);
    final control1 = Offset(size.width * 0.35, 65);
    final control2 = Offset(size.width * 0.35, size.height * 0.7);
    final end = Offset(size.width - 55, size.height - 55);

    routePath.moveTo(start.dx, start.dy);
    routePath.lineTo(control1.dx, control1.dy);
    routePath.lineTo(control2.dx, control2.dy);
    routePath.lineTo(end.dx, end.dy);

    final routePaint = Paint()
      ..color = FeedoColors.primaryGold
      ..strokeWidth = 4.0
      ..style = PaintingStyle.stroke;

    canvas.drawPath(routePath, routePaint);

    // Moving Delivery Rider Position along path
    final pathMetrics = routePath.computeMetrics().toList();
    if (pathMetrics.isNotEmpty) {
      final metric = pathMetrics.first;
      final distance = metric.length * progress;
      final tangent = metric.getTangentForOffset(distance);

      if (tangent != null) {
        final pos = tangent.position;

        // Pulse wave around rider
        final pulsePaint = Paint()
          ..color = FeedoColors.lightGold.withOpacity(0.4)
          ..style = PaintingStyle.fill;
        canvas.drawCircle(pos, 16 + (math.sin(progress * 20) * 4), pulsePaint);

        // Rider Icon Circle
        final riderBgPaint = Paint()
          ..color = FeedoColors.deepGold
          ..style = PaintingStyle.fill;
        canvas.drawCircle(pos, 12, riderBgPaint);

        final whiteBorder = Paint()
          ..color = Colors.white
          ..strokeWidth = 2
          ..style = PaintingStyle.stroke;
        canvas.drawCircle(pos, 12, whiteBorder);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _MapCanvasPainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.isDark != isDark;
  }
}
