import 'package:flutter/material.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../shared/widgets/gold_app_bar.dart';
import '../../../shared/widgets/feedo_card.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  static const List<Map<String, String>> _notifications = [
    {
      'title': 'Rider is 5 mins away!',
      'body': 'Rahul Kumar is arriving with your Royal Biryani feast. Keep OTP 2048 handy.',
      'time': '10 mins ago',
      'icon': 'moped',
    },
    {
      'title': '👑 Weekend Gold Special',
      'body': 'Get flat 50% off up to ₹100 using code FEEDO50 on all Italian sourdough pizzas.',
      'time': '2 hours ago',
      'icon': 'offer',
    },
    {
      'title': 'Feast Delivered',
      'body': 'Your order from Burger Guild was completed. How was the food? Leave a review for the chef.',
      'time': 'Yesterday',
      'icon': 'check',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
      appBar: const GoldAppBar(titleText: 'Notifications'),
      body: SafeArea(
        child: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: _notifications.length,
          itemBuilder: (context, index) {
            final n = _notifications[index];
            return FeedoCard(
              padding: const EdgeInsets.all(14),
              margin: const EdgeInsets.only(bottom: 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: FeedoColors.lightGold.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      n['icon'] == 'moped'
                          ? Icons.moped_rounded
                          : (n['icon'] == 'offer' ? Icons.local_offer_rounded : Icons.check_circle_rounded),
                      color: FeedoColors.deepGold,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              n['title']!,
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                              ),
                            ),
                            Text(
                              n['time']!,
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 10,
                                color: isDark ? FeedoColors.textMutedDark : FeedoColors.textMutedLight,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          n['body']!,
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 12,
                            color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                            height: 1.35,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

