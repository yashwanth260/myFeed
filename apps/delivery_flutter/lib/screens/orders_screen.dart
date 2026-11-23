import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/trip.dart';

class TripsScreen extends StatelessWidget {
  final List<DeliveryTrip> activeTrips;
  final Function(String, String) onUpdateStatus;

  const TripsScreen({
    Key? key,
    required this.activeTrips,
    required this.onUpdateStatus,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Active Trips'),
      ),
      body: activeTrips.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.bike_scooter, size: 48, color: AppTheme.textMuted),
                  SizedBox(height: 8),
                  Text('No active trips in progress', style: TextStyle(color: AppTheme.textMuted)),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: activeTrips.length,
              itemBuilder: (ctx, i) {
                final trip = activeTrips[i];
                final isPickedUp = trip.status == 'PICKED_UP';

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
                            Text('Trip #${trip.id}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                            Text(trip.formattedPayout, style: const TextStyle(fontWeight: FontWeight.w900, color: AppTheme.primaryGreen, fontSize: 15)),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            const Icon(Icons.store, size: 16, color: AppTheme.accentAmber),
                            const SizedBox(width: 6),
                            Expanded(child: Text(trip.restaurantName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13))),
                          ],
                        ),
                        Padding(
                          padding: const EdgeInsets.only(left: 22),
                          child: Text(trip.restaurantAddress, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.location_on, size: 16, color: AppTheme.primaryGreen),
                            const SizedBox(width: 6),
                            Expanded(child: Text(trip.customerName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13))),
                          ],
                        ),
                        Padding(
                          padding: const EdgeInsets.only(left: 22),
                          child: Text(trip.customerAddress, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                        ),
                        const Divider(height: 24),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isPickedUp ? AppTheme.primaryGreen : AppTheme.accentAmber,
                              foregroundColor: isPickedUp ? Colors.white : AppTheme.primaryDark,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                            onPressed: () {
                              if (!isPickedUp) {
                                onUpdateStatus(trip.id, 'PICKED_UP');
                              } else {
                                onUpdateStatus(trip.id, 'DELIVERED');
                              }
                            },
                            child: Text(
                              isPickedUp ? 'Confirm Drop & Verify OTP' : 'Arrived at Store & Pickup',
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}

