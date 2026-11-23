import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class RiderProfileScreen extends StatelessWidget {
  const RiderProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rider Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Center(
              child: Column(
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryGreen.withOpacity(0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.primaryGreen, width: 2),
                    ),
                    child: const Center(
                      child: Text('RK', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 24, color: AppTheme.primaryDark)),
                    ),
                  ),
                  const SizedBox(height: 10),
                  const Text('Rahul Kumar', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 2),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.star, size: 14, color: Colors.amber),
                      SizedBox(width: 4),
                      Text('4.92 Rating (842 Trips)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.textMuted)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            _buildProfileItem(Icons.verified, 'KYC & Driving License', 'Verified Active (DL-04201889)', AppTheme.statusGreen),
            _buildProfileItem(Icons.two_wheeler, 'Registered Vehicle', 'Hero Splendor Plus (KA-04-EK-9812)', AppTheme.primaryDark),
            _buildProfileItem(Icons.shield, 'Accidental Life Cover', 'Active up to ₹5,00,000', AppTheme.primaryGreen),
            _buildProfileItem(Icons.emergency, 'Emergency SOS Contacts', 'Feedo Patrol & 112 Active', AppTheme.statusRed),
            _buildProfileItem(Icons.help_outline, 'Rider Support Helpdesk', '24x7 Live Partner Support', AppTheme.primaryDark),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileItem(IconData icon, String title, String subtitle, Color iconColor) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: AppTheme.textMuted, size: 20),
        ],
      ),
    );
  }
}

