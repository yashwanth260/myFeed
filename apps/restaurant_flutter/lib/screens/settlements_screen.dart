import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class SettlementsScreen extends StatelessWidget {
  const SettlementsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settlements & Earnings'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E1E1E), Color(0xFF334155)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Pending Payout', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 6),
                  const Text('₹12,450.00', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Auto-settles tonight 11:59 PM', style: TextStyle(color: AppTheme.primaryAmber, fontSize: 11, fontWeight: FontWeight.w700)),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryAmber,
                          foregroundColor: AppTheme.primaryDark,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Instant payout triggered to registered HDFC bank account')),
                          );
                        },
                        child: const Text('Withdraw Now', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text('Recent Bank Dispatches', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.primaryDark)),
            const SizedBox(height: 12),
            _buildPayoutTile('HDFC Bank •• 4912', 'Yesterday', '₹8,920.00', 'COMPLETED'),
            _buildPayoutTile('HDFC Bank •• 4912', '10 Nov 2026', '₹14,150.00', 'COMPLETED'),
            _buildPayoutTile('HDFC Bank •• 4912', '09 Nov 2026', '₹11,600.00', 'COMPLETED'),
          ],
        ),
      ),
    );
  }

  Widget _buildPayoutTile(String bank, String date, String amount, String status) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.between,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(bank, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
              const SizedBox(height: 2),
              Text(date, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(amount, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
              const SizedBox(height: 2),
              const Text('PROCESSED', style: TextStyle(color: AppTheme.statusGreen, fontSize: 10, fontWeight: FontWeight.w800)),
            ],
          ),
        ],
      ),
    );
  }
}

