import 'package:flutter/material.dart';

class RatingChip extends StatelessWidget {
  final double rating;
  final int? count;
  final double size;

  const RatingChip({
    super.key,
    required this.rating,
    this.count,
    this.size = 12.0,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3.5),
      decoration: BoxDecoration(
        color: const Color(0xFF2E7D32), // Emerald Green rating badge
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            rating.toStringAsFixed(1),
            style: TextStyle(
              fontFamily: 'Inter',
              color: Colors.white,
              fontSize: size,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(width: 2.5),
          Icon(
            Icons.star_rounded,
            color: Colors.white,
            size: size + 2,
          ),
          if (count != null) ...[
            const SizedBox(width: 3),
            Text(
              '($count)',
              style: TextStyle(
                fontFamily: 'Inter',
                color: Colors.white.withOpacity(0.85),
                fontSize: size - 2,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
