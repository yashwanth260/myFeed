import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/trip.dart';

class DutyScreen extends StatefulWidget {
  final DeliveryTrip? activeOffer;
  final Function(DeliveryTrip) onAcceptTrip;
  final VoidCallback onDeclineTrip;

  const DutyScreen({
    Key? key,
    required this.activeOffer,
    required this.onAcceptTrip,
    required this.onDeclineTrip,
  }) : super(key: key);

  @override
  State<DutyScreen> createState() => _DutyScreenState();
}

class _DutyScreenState extends State<DutyScreen> {
  bool isOnline = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppTheme.primaryGreen.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.two_wheeler, size: 20, color: AppTheme.primaryGreen),
            ),
            const SizedBox(width: 8),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Feedo Rider', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
                Text('Rahul Kumar • Hero Splendor', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
              ],
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: isOnline ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                Icon(Icons.circle, size: 8, color: isOnline ? AppTheme.primaryGreen : AppTheme.statusRed),
                const SizedBox(width: 4),
                Text(
                  isOnline ? 'ONLINE' : 'OFFLINE',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                    color: isOnline ? const Color(0xFF166534) : const Color(0xFF991B1B),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Map Background placeholder representation
          Container(
            color: const Color(0xFFE2E8F0),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.map, size: 64, color: Colors.blueGrey.shade300),
                  const SizedBox(height: 8),
                  Text(
                    isOnline ? 'GPS Active • Seeking Nearby Orders in Indiranagar' : 'You are currently offline',
                    style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF475569)),
                  ),
                ],
              ),
            ),
          ),

          // Top Earnings Float Chip
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 16, offset: const Offset(0, 4)),
                ],
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Today Trips', style: TextStyle(fontSize: 10, color: AppTheme.textMuted, fontWeight: FontWeight.w600)),
                      Text('8 Trips Completed', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800)),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('Today Earnings', style: TextStyle(fontSize: 10, color: AppTheme.textMuted, fontWeight: FontWeight.w600)),
                      Text('₹640.00', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppTheme.primaryDark)),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Bottom Offer Bottom Sheet / Go Online Bar
          Positioned(
            bottom: 16,
            left: 16,
            right: 16,
            child: widget.activeOffer != null && isOnline
                ? _buildActiveOfferCard(widget.activeOffer!)
                : _buildDutyToggleCard(),
          ),
        ],
      ),
    );
  }

  Widget _buildDutyToggleCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 20, offset: const Offset(0, 6)),
        ],
      ),
      child: Column(
        children: [
          Text(
            isOnline ? '🟢 You are on duty and visible to nearby kitchens' : '🔴 Tap below to go on duty and start earning',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF334155)),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: isOnline ? AppTheme.statusRed : AppTheme.primaryGreen,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: () {
                setState(() => isOnline = !isOnline);
              },
              child: Text(
                isOnline ? 'Go Offline / End Shift' : 'Go Online / Start Shift',
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveOfferCard(DeliveryTrip offer) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.25), blurRadius: 25, offset: const Offset(0, 8)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.primaryGreen,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text('NEW DISPATCH OFFER', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900)),
              ),
              Text(offer.formattedPayout, style: const TextStyle(color: AppTheme.accentAmber, fontSize: 20, fontWeight: FontWeight.w900)),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              const Icon(Icons.store, color: AppTheme.accentAmber, size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Pickup: ${offer.restaurantName}',
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.location_on, color: AppTheme.primaryGreen, size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Drop: ${offer.customerAddress}',
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white70,
                    side: const BorderSide(color: Colors.white24),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: widget.onDeclineTrip,
                  child: const Text('Pass'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryGreen,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: () => widget.onAcceptTrip(offer),
                  child: const Text('Accept Trip • 3.4 km', style: TextStyle(fontWeight: FontWeight.w900)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

