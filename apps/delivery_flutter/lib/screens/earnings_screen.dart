import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class RiderEarningsScreen extends StatelessWidget {
  const RiderEarningsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rider Earnings & Wallet'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Weekly Payout Balance', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 6),
                  const Text('₹4,850.00', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Trips Completed', style: TextStyle(color: Colors.white60, fontSize: 10)),
                          Text('46 Trips', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800)),
                        ],
                      ),
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Customer Tips', style: TextStyle(color: Colors.white60, fontSize: 10)),
                          Text('₹420.00', style: TextStyle(color: AppTheme.accentAmber, fontSize: 13, fontWeight: FontWeight.w800)),
                        ],
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryGreen,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Instant UPI cashout dispatched to 9845122334@paytm')),
                          );
                        },
                        child: const Text('Cashout UPI', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text('Daily Shift History', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.primaryDark)),
            const SizedBox(height: 12),
            _buildDayTile('Today, 11 Nov', '8 Trips Completed • 4.2 hrs', '₹640.00'),
            _buildDayTile('Yesterday, 10 Nov', '12 Trips Completed • 6.5 hrs', '₹1,120.00'),
            _buildDayTile('Sunday, 09 Nov', '14 Trips Completed • 7.1 hrs', '₹1,340.00'),
            _buildDayTile('Saturday, 08 Nov', '12 Trips Completed • 6.0 hrs', '₹1,150.00'),
          ],
        ),
      ),
    );
  }

  Widget _buildDayTile(String date, String desc, String amount) {
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
              Text(date, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
              const SizedBox(height: 2),
              Text(desc, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
            ],
          ),
          Text(amount, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: AppTheme.primaryDark)),
        ],
      ),
    );
  }
}

