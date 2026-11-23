import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../shared/widgets/gold_app_bar.dart';
import '../../../shared/widgets/feedo_card.dart';
import '../../../shared/widgets/feedo_button.dart';
import '../../../shared/widgets/mock_map_widget.dart';
import '../../orders/presentation/orders_provider.dart';
import '../../orders/domain/order_model.dart';

class OrderTrackingScreen extends ConsumerWidget {
  final String orderId;

  const OrderTrackingScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersState = ref.watch(ordersProvider);
    final order = ordersState.activeOrder;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (order == null) {
      return Scaffold(
        backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
        appBar: const GoldAppBar(titleText: 'Order Tracking'),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.check_circle_outline, size: 60, color: FeedoColors.success),
              const SizedBox(height: 16),
              const Text(
                'No Active Deliveries',
                style: TextStyle(fontFamily: 'Poppins', fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text('All orders have been delivered to your doorstep!'),
              const SizedBox(height: 20),
              FeedoButton(
                text: 'View Past Orders',
                onPressed: () => context.go('/orders'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
      appBar: GoldAppBar(
        titleText: 'Track Order',
        actions: [
          IconButton(
            icon: const Icon(Icons.help_outline_rounded),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Feedo Support is available 24/7 on WhatsApp.')),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Status ETA Banner Card
            FeedoCard(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: FeedoColors.lightGold.withOpacity(0.25),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          _getStatusTitle(order.status).toUpperCase(),
                          style: const TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: FeedoColors.deepGold,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        order.status == OrderProgressStatus.delivered
                            ? 'Delivered Successfully!'
                            : 'Arriving in ${order.etaMinutes} mins',
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Order #${order.orderNumber}',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 12,
                          color: isDark ? FeedoColors.textMutedDark : FeedoColors.textMutedLight,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: FeedoColors.goldGradient,
                    ),
                    child: const Icon(Icons.moped_rounded, color: Color(0xFF1F1A0E), size: 26),
                  ),
                ],
              ),
            ),

            // Mock Animated Live GPS Map
            MockMapWidget(
              restaurantName: order.restaurantName,
              customerAddress: order.deliveryAddress,
            ),
            const SizedBox(height: 16),

            // Drop OTP Verification Banner
            FeedoCard(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              margin: const EdgeInsets.only(bottom: 16),
              color: isDark ? FeedoColors.surfaceDark : FeedoColors.lightGold.withOpacity(0.18),
              child: Row(
                children: [
                  const Icon(Icons.lock_clock_rounded, color: FeedoColors.deepGold, size: 22),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Delivery PIN (Share upon arrival)',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: FeedoColors.deepGold,
                          ),
                        ),
                        Text(
                          order.dropOtp,
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 4,
                            color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                          ),
                        ),
                      ],
                    ),
                  ),
                  FeedoButton(
                    text: 'Simulate Step ➔',
                    height: 38,
                    variant: FeedoButtonVariant.secondary,
                    onPressed: () {
                      ref.read(ordersProvider.notifier).advanceActiveOrderStatus();
                    },
                  ),
                ],
              ),
            ),

            // Stepper Progress Card
            FeedoCard(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Order Journey',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _StepTile(
                    title: 'Order Placed',
                    subtitle: 'We have received your order',
                    isDone: true,
                    isActive: order.status == OrderProgressStatus.placed,
                  ),
                  _StepTile(
                    title: 'Kitchen Confirmed',
                    subtitle: 'Restaurant accepted your order',
                    isDone: order.status.index >= OrderProgressStatus.confirmed.index,
                    isActive: order.status == OrderProgressStatus.confirmed,
                  ),
                  _StepTile(
                    title: 'Preparing Feast',
                    subtitle: 'Chef is cooking your gold standard dishes',
                    isDone: order.status.index >= OrderProgressStatus.preparing.index,
                    isActive: order.status == OrderProgressStatus.preparing,
                  ),
                  _StepTile(
                    title: 'Out for Delivery',
                    subtitle: 'Rider picked up and on the way',
                    isDone: order.status.index >= OrderProgressStatus.outForDelivery.index,
                    isActive: order.status == OrderProgressStatus.outForDelivery,
                  ),
                  _StepTile(
                    title: 'Delivered',
                    subtitle: 'Enjoy your hot meal!',
                    isDone: order.status == OrderProgressStatus.delivered,
                    isActive: order.status == OrderProgressStatus.delivered,
                    isLast: true,
                  ),
                ],
              ),
            ),

            // Rider Card
            if (order.rider != null)
              FeedoCard(
                padding: const EdgeInsets.all(14),
                margin: const EdgeInsets.only(bottom: 16),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 22,
                      backgroundImage: NetworkImage(order.rider!.avatarUrl),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            order.rider!.name,
                            style: TextStyle(
                              fontFamily: 'Poppins',
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                            ),
                          ),
                          Text(
                            '${order.rider!.rating} ★ • ${order.rider!.vehicle}',
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 11,
                              color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.call_rounded, color: FeedoColors.deepGold),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Calling rider ${order.rider!.name} at ${order.rider!.phone}...')),
                        );
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.chat_bubble_outline_rounded, color: FeedoColors.deepGold),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Opening live chat with rider...')),
                        );
                      },
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  String _getStatusTitle(OrderProgressStatus status) {
    switch (status) {
      case OrderProgressStatus.placed:
        return 'Order Placed';
      case OrderProgressStatus.confirmed:
        return 'Confirmed by Kitchen';
      case OrderProgressStatus.preparing:
        return 'Kitchen Cooking';
      case OrderProgressStatus.outForDelivery:
        return 'Rider on the Way';
      case OrderProgressStatus.delivered:
        return 'Delivered';
      case OrderProgressStatus.cancelled:
        return 'Cancelled';
    }
  }
}

class _StepTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool isDone;
  final bool isActive;
  final bool isLast;

  const _StepTile({
    required this.title,
    required this.subtitle,
    required this.isDone,
    required this.isActive,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isDone ? FeedoColors.deepGold : (isDark ? Colors.grey[800] : Colors.grey[300]),
                border: Border.all(
                  color: isActive ? FeedoColors.primaryGold : Colors.transparent,
                  width: 2,
                ),
              ),
              child: isDone
                  ? const Icon(Icons.check, size: 13, color: Colors.white)
                  : null,
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 36,
                color: isDone ? FeedoColors.deepGold : (isDark ? Colors.grey[800] : Colors.grey[300]),
              ),
          ],
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 13,
                  fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
                  color: isDone
                      ? (isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight)
                      : (isDark ? Colors.grey[600] : Colors.grey[400]),
                ),
              ),
              Text(
                subtitle,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 11,
                  color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ],
    );
  }
}
