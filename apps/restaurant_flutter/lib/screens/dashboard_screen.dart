import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/order.dart';

class DashboardScreen extends StatefulWidget {
  final List<RestaurantOrder> orders;
  final Function(String, String) onUpdateStatus;

  const DashboardScreen({
    Key? key,
    required this.orders,
    required this.onUpdateStatus,
  }) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool isStoreOnline = true;

  @override
  Widget build(BuildContext context) {
    final pendingCount = widget.orders.where((o) => o.status == 'CONFIRMED').length;
    final preparingCount = widget.orders.where((o) => o.status == 'PREPARING').length;
    final readyCount = widget.orders.where((o) => o.status == 'READY_FOR_PICKUP').length;
    final totalRevenuePaise = widget.orders.fold<int>(0, (sum, o) => sum + o.totalAmountPaise);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppTheme.primaryAmber,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.restaurant, size: 18, color: AppTheme.primaryDark),
            ),
            const SizedBox(width: 8),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Feedo Partner', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
                Text('The Golden Grill • Hub #1', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
              ],
            ),
          ],
        ),
        actions: [
          Switch(
            value: isStoreOnline,
            activeColor: AppTheme.statusGreen,
            onChanged: (val) {
              setState(() => isStoreOnline = val);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(val ? '🟢 Kitchen is now accepting orders!' : '🔴 Kitchen marked offline'),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status banner
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isStoreOnline ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isStoreOnline ? const Color(0xFFA7F3D0) : const Color(0xFFFECACA),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    isStoreOnline ? Icons.check_circle : Icons.pause_circle,
                    color: isStoreOnline ? AppTheme.statusGreen : AppTheme.statusRed,
                    size: 20,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      isStoreOnline
                          ? 'Taking Orders • Auto-Accept Enabled'
                          : 'Kitchen Paused • No New Orders',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                        color: isStoreOnline ? const Color(0xFF065F46) : const Color(0xFF991B1B),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Metrics Cards Grid
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    'Today Sales',
                    '₹${(totalRevenuePaise / 100).toStringAsFixed(0)}',
                    Icons.currency_rupee,
                    const Color(0xFFFEF3C7),
                    AppTheme.accentOrange,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    'Active Orders',
                    '${widget.orders.length}',
                    Icons.receipt_long,
                    const Color(0xFFE0E7FF),
                    const Color(0xFF4F46E5),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    'To Prepare',
                    '$pendingCount',
                    Icons.soup_kitchen,
                    const Color(0xFFFFEDD5),
                    const Color(0xFFEA580C),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    'Ready for Pickup',
                    '$readyCount',
                    Icons.two_wheeler,
                    const Color(0xFFD1FAE5),
                    AppTheme.statusGreen,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Live incoming alert
            const Text(
              'Live Orders Queue',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppTheme.primaryDark),
            ),
            const SizedBox(height: 12),

            if (widget.orders.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: Column(
                    children: [
                      Icon(Icons.inbox, size: 40, color: AppTheme.textMuted),
                      SizedBox(height: 8),
                      Text('No active orders right now', style: TextStyle(color: AppTheme.textMuted)),
                    ],
                  ),
                ),
              )
            else
              ...widget.orders.map((o) => _buildOrderTile(o)),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, IconData icon, Color bg, Color iconColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, size: 18, color: iconColor),
          ),
          const SizedBox(height: 12),
          Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildOrderTile(RestaurantOrder order) {
    Color badgeColor = AppTheme.statusGreen;
    String badgeText = 'Incoming';
    String actionBtnText = 'Start Preparing';
    String nextStatus = 'PREPARING';

    if (order.status == 'PREPARING') {
      badgeColor = AppTheme.accentOrange;
      badgeText = 'In Kitchen';
      actionBtnText = 'Mark Ready';
      nextStatus = 'READY_FOR_PICKUP';
    } else if (order.status == 'READY_FOR_PICKUP') {
      badgeColor = const Color(0xFF6366F1);
      badgeText = 'Ready';
      actionBtnText = 'Handover to Rider';
      nextStatus = 'DELIVERED';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Text('#${order.orderNumber}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: badgeColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  badgeText,
                  style: TextStyle(color: badgeColor, fontSize: 10, fontWeight: FontWeight.w800),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${order.customerName} • ${order.items.map((i) => "${i.quantity}x ${i.name}").join(", ")}',
            style: const TextStyle(fontSize: 12, color: Color(0xFF334155)),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Text(order.formattedTotal, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryAmber,
                  foregroundColor: AppTheme.primaryDark,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () => widget.onUpdateStatus(order.id, nextStatus),
                child: Text(actionBtnText, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

