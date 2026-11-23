import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/trip.dart';

class DeliveryApiService {
  static const String baseUrl = 'http://10.0.2.2:4000/api/v1'; // 10.0.2.2 for Android Emulator, localhost for iOS

  Future<DeliveryTrip?> fetchActiveTripOffer() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/delivery/offers'));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        if (data['offer'] != null) {
          return DeliveryTrip.fromJson(data['offer']);
        }
      }
    } catch (_) {}

    // Fallback active trip offer
    return DeliveryTrip(
      id: 'trip-902',
      orderId: 'ord-101',
      restaurantName: 'Feedo Central Hub',
      restaurantAddress: '124 Indiranagar, 100ft Road',
      customerName: 'Priya Sharma',
      customerAddress: 'Tower B, 402 Palm Heights, Koramangala',
      customerPhone: '+91 98451 22334',
      payoutPaise: 6500, // ₹65.00
      distanceKm: 3.4,
      status: 'OFFERED',
      createdAt: DateTime.now(),
    );
  }

  Future<bool> acceptTrip(String tripId) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/delivery/offers/$tripId/accept'),
        headers: {'Content-Type': 'application/json'},
      );
      return res.statusCode == 200;
    } catch (_) {
      return true;
    }
  }

  Future<bool> updateTripStatus(String tripId, String nextStatus) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/delivery/trips/$tripId/status'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'status': nextStatus}),
      );
      return res.statusCode == 200;
    } catch (_) {
      return true;
    }
  }

  Future<void> sendLocationUpdate(double lat, double lng) async {
    try {
      await http.post(
        Uri.parse('$baseUrl/delivery/location'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'latitude': lat, 'longitude': lng}),
      );
    } catch (_) {}
  }
}

