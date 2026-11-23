import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/order.dart';

class OrdersScreen extends StatefulWidget {
  final List<RestaurantOrder> orders;
  final Function(String, String) onUpdateStatus;

  const OrdersScreen({
    Key? key,
    required this.orders,
    required this.onUpdateStatus,
  }) : super(key: key);

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final incoming = widget.orders.where((o) => o.status == 'CONFIRMED').toList();
    final preparing = widget.orders.where((o) => o.status == 'PREPARING').toList();
    final ready = widget.orders.where((o) => o.status == 'READY_FOR_PICKUP').toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Orders'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppTheme.primaryDark,
          unselectedLabelColor: AppTheme.textMuted,
          indicatorColor: AppTheme.primaryAmber,
          indicatorWeight: 3,
          tabs: [
            Tab(text: 'Incoming (${incoming.length})'),
            Tab(text: 'Kitchen (${preparing.length})'),
            Tab(text: 'Ready (${ready.length})'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOrderList(incoming, 'No incoming orders', 'PREPARING', 'Accept & Prepare'),
          _buildOrderList(preparing, 'No orders currently preparing', 'READY_FOR_PICKUP', 'Ready for Rider'),
          _buildOrderList(ready, 'No orders waiting for pickup', 'DELIVERED', 'Confirm Handover'),
        ],
      ),
    );
  }

  Widget _buildOrderList(List<RestaurantOrder> list, String emptyMsg, String nextStatus, String btnLabel) {
    if (list.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_circle_outline, size: 48, color: AppTheme.textMuted),
            const SizedBox(height: 8),
            Text(emptyMsg, style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      itemBuilder: (ctx, i) {
        final order = list[i];
        return Card(
          margin: const EdgeInsets.only(bottom: 14),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    Text('Order #${order.orderNumber}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                    Text(order.formattedTotal, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: AppTheme.primaryDark)),
                  ],
                ),
                const SizedBox(height: 6),
                Text('Customer: ${order.customerName} (${order.customerPhone})', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                const Divider(height: 20),
                ...order.items.map(
                  (item) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        Text('${item.quantity}x ${item.name}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                        Text('₹${(item.pricePaise / 100).toStringAsFixed(2)}', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryAmber,
                      foregroundColor: AppTheme.primaryDark,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: () => widget.onUpdateStatus(order.id, nextStatus),
                    child: Text(btnLabel, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12)),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

