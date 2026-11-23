import 'package:flutter/material.dart';
import '../../core/theme/feedo_colors.dart';
import '../../features/restaurant/domain/restaurant_model.dart';

class VegBadge extends StatelessWidget {
  final DietaryType dietaryType;
  final double size;

  const VegBadge({
    super.key,
    required this.dietaryType,
    this.size = 15.0,
  });

  @override
  Widget build(BuildContext context) {
    Color borderColor;
    Color dotColor;

    switch (dietaryType) {
      case DietaryType.veg:
        borderColor = FeedoColors.veg;
        dotColor = FeedoColors.veg;
        break;
      case DietaryType.nonVeg:
        borderColor = FeedoColors.nonVeg;
        dotColor = FeedoColors.nonVeg;
        break;
      case DietaryType.egg:
        borderColor = FeedoColors.egg;
        dotColor = FeedoColors.egg;
        break;
    }

    return Container(
      width: size,
      height: size,
      padding: EdgeInsets.all(size * 0.18),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: borderColor, width: 1.4),
        borderRadius: BorderRadius.circular(size * 0.25),
      ),
      child: Center(
        child: Container(
          decoration: BoxDecoration(
            color: dotColor,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }
}

