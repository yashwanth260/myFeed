import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/gold_app_bar.dart';
import '../../../shared/widgets/feedo_card.dart';
import '../../../shared/widgets/feedo_button.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../cart/presentation/cart_provider.dart';
import '../../home/data/mock_feedo_data.dart';
import 'orders_provider.dart';
import 'widgets/rate_review_dialog.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersState = ref.watch(ordersProvider);
    final active = ordersState.activeOrder;
    final past = ordersState.pastOrders;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
        appBar: GoldAppBar(
          titleText: 'Your Orders',
          actions: [
            if (active != null)
              Container(
                margin: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: FeedoColors.success.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  '1 Active',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: FeedoColors.success,
                  ),
                ),
              ),
          ],
        ),
        body: Column(
          children: [
            TabBar(
              indicatorColor: FeedoColors.primaryGold,
              labelColor: isDark ? FeedoColors.lightGold : FeedoColors.deepGold,
              unselectedLabelColor: Colors.grey,
              labelStyle: const TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w700),
              tabs: const [
                Tab(text: 'Active Delivery'),
                Tab(text: 'Order History'),
              ],
            ),
            Expanded(
              child: TabBarView(
                children: [
                  // Active Tab
                  active == null
                      ? EmptyState(
                          icon: Icons.delivery_dining_outlined,
                          title: 'No Active Orders',
                          message: 'All your previous feasts have been delivered. Hungry for something gold?',
                          actionText: 'Browse Menu',
                          onAction: () => context.go('/home'),
                        )
                      : ListView(
                          padding: const EdgeInsets.all(16),
                          children: [
                            FeedoCard(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        active.restaurantName,
                                        style: TextStyle(
                                          fontFamily: 'Poppins',
                                          fontSize: 16,
                                          fontWeight: FontWeight.w700,
                                          color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: FeedoColors.primaryGold.withOpacity(0.2),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: const Text(
                                          'ON THE WAY',
                                          style: TextStyle(
                                            fontFamily: 'Inter',
                                            fontSize: 9,
                                            fontWeight: FontWeight.w800,
                                            color: FeedoColors.deepGold,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    active.items.map((i) => '${i.quantity}x ${i.item.name}').join(', '),
                                    style: TextStyle(
                                      fontFamily: 'Inter',
                                      fontSize: 12,
                                      color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        'Total: ${CurrencyFormatter.format(active.totalAmount)}',
                                        style: const TextStyle(
                                          fontFamily: 'Poppins',
                                          fontSize: 15,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                      FeedoButton(
                                        text: 'Track Order',
                                        height: 40,
                                        onPressed: () => context.push('/tracking/${active.id}'),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),

                  // Past Orders Tab
                  past.isEmpty
                      ? EmptyState(
                          icon: Icons.history_rounded,
                          title: 'No Past Orders Yet',
                          message: 'Your completed feasts and past bills will appear here.',
                          actionText: 'Order Something Delicious',
                          onAction: () => context.go('/home'),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: past.length,
                          itemBuilder: (context, index) {
                            final o = past[index];
                            return FeedoCard(
                              padding: const EdgeInsets.all(16),
                              margin: const EdgeInsets.only(bottom: 14),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      ClipRRect(
                                        borderRadius: BorderRadius.circular(8),
                                        child: Image.network(
                                          o.restaurantImage,
                                          width: 44,
                                          height: 44,
                                          fit: BoxFit.cover,
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              o.restaurantName,
                                              style: TextStyle(
                                                fontFamily: 'Poppins',
                                                fontSize: 15,
                                                fontWeight: FontWeight.w700,
                                                color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                                              ),
                                            ),
                                            Text(
                                              DateFormat('dd MMM yyyy, hh:mm a').format(o.createdAt),
                                              style: TextStyle(
                                                fontFamily: 'Inter',
                                                fontSize: 11,
                                                color: isDark ? FeedoColors.textMutedDark : FeedoColors.textMutedLight,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Text(
                                        'Delivered',
                                        style: TextStyle(
                                          fontFamily: 'Inter',
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                          color: FeedoColors.success,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Divider(height: 20),
                                  Text(
                                    o.items.map((i) => '${i.quantity}x ${i.item.name}').join(', '),
                                    style: TextStyle(
                                      fontFamily: 'Inter',
                                      fontSize: 12,
                                      color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        CurrencyFormatter.format(o.totalAmount),
                                        style: TextStyle(
                                          fontFamily: 'Poppins',
                                          fontSize: 15,
                                          fontWeight: FontWeight.w800,
                                          color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                                        ),
                                      ),
                                      Row(
                                        children: [
                                          OutlinedButton(
                                            onPressed: () {
                                              showDialog(
                                                context: context,
                                                builder: (_) => RateReviewDialog(
                                                  orderNumber: o.orderNumber,
                                                  restaurantName: o.restaurantName,
                                                ),
                                              );
                                            },
                                            style: OutlinedButton.styleFrom(
                                              side: const BorderSide(color: FeedoColors.primaryGold),
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                                              minimumSize: const Size(60, 36),
                                            ),
                                            child: const Text('Review', style: TextStyle(fontSize: 12, color: FeedoColors.deepGold)),
                                          ),
                                          const SizedBox(width: 8),
                                          FeedoButton(
                                            text: 'Reorder',
                                            height: 36,
                                            onPressed: () {
                                              // Find restaurant and add item
                                              final r = MockFeedoData.restaurants.firstWhere(
                                                (rest) => rest.id == o.restaurantId,
                                                orElse: () => MockFeedoData.restaurants.first,
                                              );
                                              for (var cartItem in o.items) {
                                                ref.read(cartProvider.notifier).addItem(
                                                      restaurant: r,
                                                      item: cartItem.item,
                                                    );
                                              }
                                              context.push('/cart');
                                            },
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ],
                              ),
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
}
