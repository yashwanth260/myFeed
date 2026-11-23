import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'models/trip.dart';
import 'services/api_service.dart';
import 'screens/duty_screen.dart';
import 'screens/orders_screen.dart';
import 'screens/earnings_screen.dart';
import 'screens/profile_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const FeedoDeliveryApp());
}

class FeedoDeliveryApp extends StatelessWidget {
  const FeedoDeliveryApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Feedo Delivery Partner',
      theme: AppTheme.lightTheme,
      debugShowCheckedModeBanner: false,
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({Key? key}) : super(key: key);

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;
  final DeliveryApiService _api = DeliveryApiService();
  DeliveryTrip? _activeOffer;
  final List<DeliveryTrip> _activeTrips = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadOffer();
  }

  Future<void> _loadOffer() async {
    final offer = await _api.fetchActiveTripOffer();
    if (mounted) {
      setState(() {
        _activeOffer = offer;
        _isLoading = false;
      });
    }
  }

  void _handleAcceptTrip(DeliveryTrip offer) {
    _api.acceptTrip(offer.id);
    setState(() {
      _activeTrips.add(
        DeliveryTrip(
          id: offer.id,
          orderId: offer.orderId,
          restaurantName: offer.restaurantName,
          restaurantAddress: offer.restaurantAddress,
          customerName: offer.customerName,
          customerAddress: offer.customerAddress,
          customerPhone: offer.customerPhone,
          payoutPaise: offer.payoutPaise,
          distanceKm: offer.distanceKm,
          status: 'ACCEPTED',
          createdAt: DateTime.now(),
        ),
      );
      _activeOffer = null;
      _currentIndex = 1; // Switch to Trips screen
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('🎉 Trip accepted! Head over to store for pickup.'),
        backgroundColor: Color(0xFF1E1E1E),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _handleDeclineTrip() {
    setState(() {
      _activeOffer = null;
    });
  }

  void _handleUpdateTripStatus(String tripId, String nextStatus) {
    _api.updateTripStatus(tripId, nextStatus);
    setState(() {
      final idx = _activeTrips.indexWhere((t) => t.id == tripId);
      if (idx != -1) {
        if (nextStatus == 'DELIVERED') {
          _activeTrips.removeAt(idx);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Delivery completed! ₹65.00 credited to wallet.'),
              backgroundColor: AppTheme.primaryGreen,
              duration: Duration(seconds: 3),
            ),
          );
        } else {
          final old = _activeTrips[idx];
          _activeTrips[idx] = DeliveryTrip(
            id: old.id,
            orderId: old.orderId,
            restaurantName: old.restaurantName,
            restaurantAddress: old.restaurantAddress,
            customerName: old.customerName,
            customerAddress: old.customerAddress,
            customerPhone: old.customerPhone,
            payoutPaise: old.payoutPaise,
            distanceKm: old.distanceKm,
            status: nextStatus,
            createdAt: old.createdAt,
          );
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: AppTheme.primaryGreen),
        ),
      );
    }

    final screens = [
      DutyScreen(
        activeOffer: _activeOffer,
        onAcceptTrip: _handleAcceptTrip,
        onDeclineTrip: _handleDeclineTrip,
      ),
      TripsScreen(
        activeTrips: _activeTrips,
        onUpdateStatus: _handleUpdateTripStatus,
      ),
      const RiderEarningsScreen(),
      const RiderProfileScreen(),
    ];

    return Scaffold(
      body: screens[_currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: const Border(top: BorderSide(color: Color(0xFFF1F5F9))),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -3),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: AppTheme.primaryDark,
          unselectedItemColor: AppTheme.textMuted,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 11),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 10),
          elevation: 0,
          items: [
            const BottomNavigationBarItem(
              icon: Icon(Icons.two_wheeler_outlined),
              activeIcon: Icon(Icons.two_wheeler),
              label: 'Duty / Map',
            ),
            BottomNavigationBarItem(
              icon: Badge(
                isLabelVisible: _activeTrips.isNotEmpty,
                label: Text('${_activeTrips.length}'),
                child: const Icon(Icons.navigation_outlined),
              ),
              activeIcon: Badge(
                isLabelVisible: _activeTrips.isNotEmpty,
                label: Text('${_activeTrips.length}'),
                child: const Icon(Icons.navigation),
              ),
              label: 'My Trips',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.account_balance_wallet_outlined),
              activeIcon: Icon(Icons.account_balance_wallet),
              label: 'Earnings',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}

