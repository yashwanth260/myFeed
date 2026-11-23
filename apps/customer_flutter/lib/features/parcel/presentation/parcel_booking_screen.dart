import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/gold_app_bar.dart';
import '../../../shared/widgets/feedo_card.dart';
import '../../../shared/widgets/feedo_button.dart';

class ParcelBookingScreen extends ConsumerStatefulWidget {
  const ParcelBookingScreen({super.key});

  @override
  ConsumerState<ParcelBookingScreen> createState() => _ParcelBookingScreenState();
}

class _ParcelBookingScreenState extends ConsumerState<ParcelBookingScreen> {
  final TextEditingController _pickupController = TextEditingController(text: 'Indiranagar 100ft Road, Bengaluru');
  final TextEditingController _dropController = TextEditingController(text: 'Koramangala 4th Block, Bengaluru');
  final TextEditingController _senderPhoneController = TextEditingController(text: '+91 98765 43210');
  final TextEditingController _receiverPhoneController = TextEditingController(text: '+91 98123 45678');
  final TextEditingController _instructionsController = TextEditingController();

  String _selectedCategory = 'Food / Tiffin';
  String _selectedWeight = 'Up to 1 kg';
  bool _isFragile = false;
  bool _isBooking = false;

  @override
  void dispose() {
    _pickupController.dispose();
    _dropController.dispose();
    _senderPhoneController.dispose();
    _receiverPhoneController.dispose();
    _instructionsController.dispose();
    super.dispose();
  }

  final List<Map<String, dynamic>> _parcelCategories = const [
    {'name': 'Food / Tiffin', 'icon': Icons.lunch_dining_rounded},
    {'name': 'Documents', 'icon': Icons.description_rounded},
    {'name': 'Keys & Cards', 'icon': Icons.key_rounded},
    {'name': 'Clothes', 'icon': Icons.checkroom_rounded},
    {'name': 'Electronics', 'icon': Icons.devices_rounded},
    {'name': 'Flowers / Gifts', 'icon': Icons.card_giftcard_rounded},
  ];

  double get _baseFare => 40.0;
  double get _distanceKm => 4.5;
  double get _distanceFare => _distanceKm * 12.0;
  double get _weightAddon {
    if (_selectedWeight == '1 - 5 kg') return 25.0;
    if (_selectedWeight == '5 - 10 kg') return 55.0;
    return 0.0;
  }
  double get _fragileAddon => _isFragile ? 20.0 : 0.0;
  double get _totalFare => _baseFare + _distanceFare + _weightAddon + _fragileAddon;

  void _bookParcel() async {
    setState(() => _isBooking = true);
    await Future.delayed(const Duration(milliseconds: 1400));
    if (!mounted) return;
    setState(() => _isBooking = false);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: FeedoColors.goldGradient,
                boxShadow: [FeedoColors.goldShadow],
              ),
              child: const Icon(Icons.check_circle_rounded, color: Color(0xFF1F1A0E), size: 40),
            ),
            const SizedBox(height: 18),
            const Text(
              'Courier Dispatched!',
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 20,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Rider Ravi Kumar is arriving in 8 mins for pickup.',
              textAlign: TextAlign.center,
              style: TextStyle(fontFamily: 'Inter', fontSize: 13, color: Colors.grey),
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: FeedoColors.lightGold.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                'Tracking ID: FD-PARCEL-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
                style: const TextStyle(fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.bold, color: FeedoColors.deepGold),
              ),
            ),
            const SizedBox(height: 20),
            FeedoButton(
              text: 'Track Courier ➔',
              onPressed: () {
                Navigator.pop(ctx);
                context.go('/tracking/FD-PARCEL-8801');
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
      appBar: const GoldAppBar(titleText: 'Parcel (City Limits) • ಪಾರ್ಸಲ್'),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Banner
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF2C5E3B),
                    const Color(0xFF1E462B),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.15),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.inventory_2_rounded, color: Colors.white, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'City Limits Instant Courier',
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Send food, keys, documents or gifts anywhere in 30 mins',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 11,
                            color: Color(0xFFD4E8DA),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Pickup & Drop Addresses Card
            FeedoCard(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Route Addresses',
                    style: TextStyle(fontFamily: 'Poppins', fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Column(
                        children: [
                          const Icon(Icons.radio_button_checked, color: FeedoColors.deepGold, size: 20),
                          Container(width: 2, height: 40, color: FeedoColors.primaryGold.withOpacity(0.4)),
                          const Icon(Icons.location_on, color: FeedoColors.error, size: 22),
                        ],
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          children: [
                            TextField(
                              controller: _pickupController,
                              style: const TextStyle(fontFamily: 'Inter', fontSize: 13),
                              decoration: InputDecoration(
                                labelText: 'Pickup Location (ಪಿಕಪ್ ಸ್ಥಳ)',
                                labelStyle: const TextStyle(fontSize: 12),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              ),
                            ),
                            const SizedBox(height: 12),
                            TextField(
                              controller: _dropController,
                              style: const TextStyle(fontFamily: 'Inter', fontSize: 13),
                              decoration: InputDecoration(
                                labelText: 'Drop Location (ಡ್ರಾಪ್ ಸ್ಥಳ)',
                                labelStyle: const TextStyle(fontSize: 12),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _senderPhoneController,
                          style: const TextStyle(fontSize: 12),
                          decoration: InputDecoration(
                            labelText: 'Sender Contact',
                            prefixIcon: const Icon(Icons.phone, size: 16),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _receiverPhoneController,
                          style: const TextStyle(fontSize: 12),
                          decoration: InputDecoration(
                            labelText: 'Receiver Contact',
                            prefixIcon: const Icon(Icons.phone, size: 16),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Item Category Chips
            FeedoCard(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'What are you sending? (ವಸ್ತು ಯಾವುದು?)',
                    style: TextStyle(fontFamily: 'Poppins', fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _parcelCategories.map((cat) {
                      final isSelected = _selectedCategory == cat['name'];
                      return ChoiceChip(
                        avatar: Icon(cat['icon'] as IconData, size: 16, color: isSelected ? Colors.black : FeedoColors.deepGold),
                        label: Text(cat['name'] as String),
                        selected: isSelected,
                        selectedColor: FeedoColors.primaryGold,
                        onSelected: (_) => setState(() => _selectedCategory = cat['name'] as String),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 14),
                  const Divider(),
                  const SizedBox(height: 8),
                  const Text(
                    'Package Weight (ತೂಕ)',
                    style: TextStyle(fontFamily: 'Poppins', fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: ['Up to 1 kg', '1 - 5 kg', '5 - 10 kg'].map((weight) {
                      final isSelected = _selectedWeight == weight;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8.0),
                        child: ChoiceChip(
                          label: Text(weight),
                          selected: isSelected,
                          selectedColor: FeedoColors.primaryGold,
                          onSelected: (_) => setState(() => _selectedWeight = weight),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 10),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Handle with Fragile Care (ಎಚ್ಚರಿಕೆ)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    subtitle: const Text('Special insulated protective courier handling (+₹20)', style: TextStyle(fontSize: 11)),
                    value: _isFragile,
                    activeColor: FeedoColors.primaryGold,
                    onChanged: (v) => setState(() => _isFragile = v),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _instructionsController,
                    style: const TextStyle(fontSize: 12),
                    decoration: InputDecoration(
                      labelText: 'Special Delivery Instructions (ಸೂಚನೆಗಳು)',
                      hintText: 'e.g. Call before arrival, leave with security guard...',
                      prefixIcon: const Icon(Icons.note_alt_outlined, size: 16),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    ),
                  ),
                ],
              ),
            ),

            // Fare Summary & Book CTA
            FeedoCard(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Fare Breakdown (ದರ ವಿವರ)',
                    style: TextStyle(fontFamily: 'Poppins', fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  _fareRow('Base City Fare (ಮೂಲ ದರ)', CurrencyFormatter.format(_baseFare)),
                  const SizedBox(height: 6),
                  _fareRow('Distance Fare ($_distanceKm km @ ₹12/km)', CurrencyFormatter.format(_distanceFare)),
                  if (_weightAddon > 0) ...[
                    const SizedBox(height: 6),
                    _fareRow('Weight Tier Add-on ($_selectedWeight)', CurrencyFormatter.format(_weightAddon)),
                  ],
                  if (_isFragile) ...[
                    const SizedBox(height: 6),
                    _fareRow('Fragile Handling Care', CurrencyFormatter.format(_fragileAddon)),
                  ],
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total Payable (ಒಟ್ಟು ಮೊತ್ತ)',
                        style: TextStyle(fontFamily: 'Poppins', fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        CurrencyFormatter.format(_totalFare),
                        style: const TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: FeedoColors.deepGold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  FeedoButton(
                    text: 'Book Instant Parcel Courier',
                    isLoading: _isBooking,
                    onPressed: _bookParcel,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _fareRow(String title, String amount) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: const TextStyle(fontFamily: 'Inter', fontSize: 12, color: Colors.grey)),
        Text(amount, style: const TextStyle(fontFamily: 'Inter', fontSize: 13, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
