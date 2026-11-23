import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'models/order.dart';
import 'models/menu_item.dart';
import 'services/api_service.dart';
import 'screens/dashboard_screen.dart';
import 'screens/orders_screen.dart';
import 'screens/menu_screen.dart';
import 'screens/settlements_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const FeedoRestaurantApp());
}

class FeedoRestaurantApp extends StatelessWidget {
  const FeedoRestaurantApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Feedo Restaurant Partner',
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
  final RestaurantApiService _api = RestaurantApiService();
  List<RestaurantOrder> _orders = [];
  List<MenuItem> _menuItems = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final orders = await _api.fetchActiveOrders();
    final menu = await _api.fetchMenuCatalog();
    if (mounted) {
      setState(() {
        _orders = orders;
        _menuItems = menu;
        _isLoading = false;
      });
    }
  }

  void _handleUpdateStatus(String orderId, String nextStatus) {
    _api.updateOrderStatus(orderId, nextStatus);
    setState(() {
      final idx = _orders.indexWhere((o) => o.id == orderId);
      if (idx != -1) {
        if (nextStatus == 'DELIVERED') {
          _orders.removeAt(idx);
        } else {
          final old = _orders[idx];
          _orders[idx] = RestaurantOrder(
            id: old.id,
            orderNumber: old.orderNumber,
            customerName: old.customerName,
            customerPhone: old.customerPhone,
            status: nextStatus,
            totalAmountPaise: old.totalAmountPaise,
            items: old.items,
            createdAt: old.createdAt,
          );
        }
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Order updated to $nextStatus'),
        backgroundColor: AppTheme.primaryDark,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: AppTheme.primaryAmber),
        ),
      );
    }

    final screens = [
      DashboardScreen(orders: _orders, onUpdateStatus: _handleUpdateStatus),
      OrdersScreen(orders: _orders, onUpdateStatus: _handleUpdateStatus),
      MenuScreen(menuItems: _menuItems),
      const SettlementsScreen(),
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
              icon: Icon(Icons.dashboard_outlined),
              activeIcon: Icon(Icons.dashboard),
              label: 'Dashboard',
            ),
            BottomNavigationBarItem(
              icon: Badge(
                label: Text('${_orders.length}'),
                child: const Icon(Icons.receipt_long_outlined),
              ),
              activeIcon: Badge(
                label: Text('${_orders.length}'),
                child: const Icon(Icons.receipt_long),
              ),
              label: 'Orders',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.restaurant_menu_outlined),
              activeIcon: Icon(Icons.restaurant_menu),
              label: 'Menu',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.account_balance_wallet_outlined),
              activeIcon: Icon(Icons.account_balance_wallet),
              label: 'Payouts',
            ),
          ],
        ),
      ),
    );
  }
}

