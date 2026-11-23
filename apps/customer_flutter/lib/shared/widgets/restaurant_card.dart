import 'package:flutter/material.dart';
import '../../core/theme/feedo_colors.dart';
import '../../features/restaurant/domain/restaurant_model.dart';
import 'feedo_card.dart';
import 'rating_chip.dart';

class RestaurantCard extends StatelessWidget {
  final RestaurantModel restaurant;
  final bool isFavorite;
  final VoidCallback onFavoriteToggle;
  final VoidCallback onTap;

  const RestaurantCard({
    super.key,
    required this.restaurant,
    required this.isFavorite,
    required this.onFavoriteToggle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return FeedoCard(
      onTap: onTap,
      padding: EdgeInsets.zero,
      margin: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hero Image with Offer Badge and Favorite Icon
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
                child: Image.network(
                  restaurant.heroImageUrl,
                  width: double.infinity,
                  height: 170,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    height: 170,
                    color: isDark ? FeedoColors.surfaceDark : Colors.grey[200],
                    child: const Icon(Icons.restaurant, color: FeedoColors.primaryGold, size: 40),
                  ),
                ),
              ),

              // Gradient scrim for contrast
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
                    gradient: LinearGradient(
                      colors: [
                        Colors.black.withOpacity(0.4),
                        Colors.transparent,
                        Colors.black.withOpacity(0.6),
                      ],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      stops: const [0.0, 0.5, 1.0],
                    ),
                  ),
                ),
              ),

              // Favorite Heart Button
              Positioned(
                top: 10,
                right: 10,
                child: GestureDetector(
                  onTap: onFavoriteToggle,
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.4),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withOpacity(0.2)),
                    ),
                    child: Icon(
                      isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                      color: isFavorite ? const Color(0xFFFF4B6E) : Colors.white,
                      size: 20,
                    ),
                  ),
                ),
              ),

              // Offer Pill on bottom left
              if (restaurant.promoOffer.isNotEmpty)
                Positioned(
                  bottom: 10,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      gradient: FeedoColors.goldGradient,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.3),
                          blurRadius: 6,
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.local_offer_rounded, size: 12, color: FeedoColors.textPrimaryLight),
                        const SizedBox(width: 4),
                        Text(
                          restaurant.promoOffer,
                          style: const TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: FeedoColors.textPrimaryLight,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),

          // Details Section
          Padding(
            padding: const EdgeInsets.all(14.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        restaurant.name,
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    RatingChip(
                      rating: restaurant.rating,
                      count: restaurant.ratingCount,
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  restaurant.cuisines.join(' • '),
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 12,
                    color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      Icons.timer_outlined,
                      size: 14,
                      color: isDark ? FeedoColors.lightGold : FeedoColors.deepGold,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${restaurant.deliveryTimeMinutes} mins',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                      ),
                    ),
                    const SizedBox(width: 10),
                    const Text('•', style: TextStyle(color: Colors.grey)),
                    const SizedBox(width: 10),
                    Icon(
                      Icons.near_me_outlined,
                      size: 14,
                      color: isDark ? FeedoColors.textMutedDark : FeedoColors.textMutedLight,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${restaurant.distanceKm} km',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                      ),
                    ),
                    const SizedBox(width: 10),
                    const Text('•', style: TextStyle(color: Colors.grey)),
                    const SizedBox(width: 10),
                    Text(
                      restaurant.baseDeliveryFee == 0 ? 'Free Delivery' : '₹${restaurant.baseDeliveryFee.toInt()} Delivery',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        fontWeight: restaurant.baseDeliveryFee == 0 ? FontWeight.w700 : FontWeight.w400,
                        color: restaurant.baseDeliveryFee == 0 ? FeedoColors.success : (isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

