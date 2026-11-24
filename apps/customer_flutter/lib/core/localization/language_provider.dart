import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/local_storage_service.dart';
import '../theme/theme_provider.dart';

enum AppLanguage {
  english('en', 'English', 'Default'),
  kannada('kn', 'ಕನ್ನಡ', 'Kannada');

  final String code;
  final String label;
  final String sublabel;

  const AppLanguage(this.code, this.label, this.sublabel);

  static AppLanguage fromCode(String code) {
    if (code == 'kn') return AppLanguage.kannada;
    return AppLanguage.english;
  }
}

final languageProvider = StateNotifierProvider<LanguageNotifier, AppLanguage>((ref) {
  final storage = ref.watch(localStorageServiceProvider);
  return LanguageNotifier(storage);
});

class LanguageNotifier extends StateNotifier<AppLanguage> {
  final LocalStorageService _storage;

  LanguageNotifier(this._storage)
      : super(AppLanguage.fromCode(_storage.selectedLanguage));

  void setLanguage(AppLanguage language) {
    state = language;
    _storage.setSelectedLanguage(language.code);
    _storage.setHasChosenLanguage(true);
  }

  void toggleLanguage() {
    if (state == AppLanguage.english) {
      setLanguage(AppLanguage.kannada);
    } else {
      setLanguage(AppLanguage.english);
    }
  }

  bool get isKannada => state == AppLanguage.kannada;
}

class AppStrings {
  final AppLanguage language;

  AppStrings(this.language);

  bool get isKn => language == AppLanguage.kannada;

  // 1. Language Selection Screen
  String get selectLanguageTitle => isKn ? 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ' : 'Choose Your Language';
  String get selectLanguageSub => isKn
      ? 'ಫೀಡೋವನ್ನು ನಿಮ್ಮ ಮೆಚ್ಚಿನ ಭಾಷೆಯಲ್ಲಿ ಅನುಭವಿಸಿ'
      : 'Select your preferred language to experience Feedo';
  String get englishOption => 'English';
  String get englishOptionDesc => 'Browse all food, orders & services in English';
  String get kannadaOption => 'ಕನ್ನಡ';
  String get kannadaOptionDesc => 'ಕರ್ನಾಟಕದ ಜನಪ್ರಿಯ ಭಾಷೆ • ಎಲ್ಲಾ ಸೇವೆಗಳು ಕನ್ನಡದಲ್ಲಿ';
  String get continueBtn => isKn ? 'ಮುಂದುವರಿಯಿರಿ' : 'Continue';
  String get changeLanguageTitle => isKn ? 'ಭಾಷೆ ಬದಲಾಯಿಸಿ' : 'Change Language';

  // 2. Onboarding
  String get skip => isKn ? 'ಬಿಟ್ಟುಬಿಡಿ' : 'Skip';
  String get getStarted => isKn ? 'ಪ್ರಾರಂಭಿಸಿ' : 'Get Started';
  String get next => isKn ? 'ಮುಂದೆ' : 'Next';
  String get onbTitle1 => isKn ? 'ರುಚಿಕರ ಆಹಾರ ಅನ್ವೇಷಿಸಿ' : 'Discover Gold Standards';
  String get onbDesc1 => isKn
      ? 'ಉತ್ತಮ ರೆಸ್ಟೋರೆಂಟ್‌ಗಳು, ರಾಯಲ್ ಬಿರಿಯಾನಿ ಮತ್ತು ಶೆಫ್-ಕ್ಯುರೇಟೆಡ್ ಊಟಗಳು.'
      : 'Explore premier restaurants, royal biryanis, sourdough crusts and chef curated feasts.';
  String get onbTitle2 => isKn ? 'ಸುಲಭ ಆರ್ಡರ್ & ಕಸ್ಟಮೈಸೇಶನ್' : 'Seamless Feast Customisation';
  String get onbDesc2 => isKn
      ? 'ಪ್ರತಿ ತಿನಿಸಿನ ಪ್ರಮಾಣ, ಚೀಸ್ ಬರ್ಸ್ಟ್ ಮತ್ತು ಮಸಾಲೆ ಹಂತಗಳನ್ನು ನಿಮ್ಮಿಷ್ಟದಂತೆ ಆಯ್ಕೆಮಾಡಿ.'
      : 'Tailor every portion size, cheese bursts, and spice levels with instant bill breakdowns.';
  String get onbTitle3 => isKn ? 'ಲೈವ್ ಜಿಪಿಎಸ್ ಟ್ರ್ಯಾಕಿಂಗ್' : 'Precision GPS Live Tracking';
  String get onbDesc3 => isKn
      ? 'ಅಡುಗೆ ಮನೆಯಿಂದ ನಿಮ್ಮ ಮನೆಬಾಗಿಲಿಗೆ ಬರುವವರೆಗೂ ನಿಮ್ಮ ರೈಡರ್ ಅನ್ನು ಲೈವ್ ಆಗಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.'
      : 'Follow your dedicated rider in real-time from kitchen wok to your doorstep with verified OTP security.';

  // 3. Navigation Shell
  String get navHome => isKn ? 'ಮುಖಪುಟ' : 'Home';
  String get navSearch => isKn ? 'ಹುಡುಕಿ' : 'Search';
  String get navOrders => isKn ? 'ಆರ್ಡರ್‌ಗಳು' : 'Orders';
  String get navFavorites => isKn ? 'ಮೆಚ್ಚಿನವು' : 'Favorites';
  String get navProfile => isKn ? 'ಪ್ರೊಫೈಲ್' : 'Profile';

  // 4. Home Screen
  String get deliverTo => isKn ? 'ಡೆಲಿವರಿ ವಿಳಾಸ' : 'Deliver to';
  String get searchPlaceholder => isKn ? 'ಆಹಾರ, ಹೋಟೆಲ್‌ಗಳು ಅಥವಾ ದಿನಸಿ ಹುಡುಕಿ...' : 'Search restaurants, dishes, groceries...';
  String get whatLookingFor => isKn ? 'ನಿಮಗೆ ಏನು ಬೇಕು?' : 'What are you craving?';
  String get allKitchens => isKn ? '✨ ಎಲ್ಲಾ ಹೋಟೆಲ್‌ಗಳು' : '✨ All Kitchens';
  String get popularNearYou => isKn ? '🔥 ಜನಪ್ರಿಯ' : '🔥 Popular near you';
  String get topRated => isKn ? '⭐ ಉನ್ನತ ರೇಟಿಂಗ್' : '⭐ Top rated';
  String get fastDelivery => isKn ? '⚡ ವೇಗದ ಡೆಲಿವರಿ' : '⚡ Fast delivery';
  String get newOnFeedo => isKn ? '💎 ಫೀಡೋದಲ್ಲಿ ಹೊಸತು' : '💎 New on Feedo';
  String get viewAll => isKn ? 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ' : 'View all';
  String get parcelBannerTitle => isKn ? 'ನಗರ ಪಾರ್ಸಲ್ ಡೆಲಿವರಿ' : 'City Parcel Express';
  String get parcelBannerSub => isKn
      ? 'ದಾಖಲೆಗಳು, ಉಡುಗೊರೆಗಳು & ಪ್ಯಾಕೇಜ್‌ಗಳನ್ನು ನಗರದೊಳಗೆ ತಕ್ಷಣ ಕಳುಹಿಸಿ'
      : 'Send packages, documents & essentials across town';
  String get sendParcelBtn => isKn ? 'ಪಾರ್ಸಲ್ ಕಳುಹಿಸಿ' : 'Send Parcel';

  // 5. Service Verticals (Flyer)
  String get srvRestaurants => isKn ? 'ಹೋಟೆಲ್ & ಫುಡ್' : 'Restaurants & Food';
  String get srvGrocery => isKn ? 'ಕಿರಾಣಿ ಸಾಮಾನುಗಳು' : 'Grocery';
  String get srvFruitsVeg => isKn ? 'ಹಣ್ಣು & ತರಕಾರಿ' : 'Fruits & Vegetables';
  String get srvMeat => isKn ? 'ಮಾಂಸ & ಚಿಕನ್' : 'Meat & Chicken';
  String get srvDairy => isKn ? 'ಹಾಲು & ಹಾಲಿನ ಉತ್ಪನ್ನಗಳು' : 'Dairy & Milk';
  String get srvBakery => isKn ? 'ಬೇಕರಿ & ಸಿಹಿತಿಂಡಿಗಳು' : 'Bakery & Sweets';
  String get srvFlowers => isKn ? 'ಹೂವುಗಳು' : 'Flowers';
  String get srvParcel => isKn ? 'ಪಾರ್ಸಲ್ (ಸಿಟಿ ಲಿಮಿಟ್ಸ್)' : 'Parcel (City Limits)';

  // 6. Parcel Booking
  String get parcelTitle => isKn ? 'ನಗರ ಪಾರ್ಸಲ್ ಬುಕಿಂಗ್' : 'City Parcel Booking';
  String get parcelSubtitle => isKn
      ? 'ನಗರದ ಮಿತಿಯೊಳಗೆ ಸುರಕ್ಷಿತ ಮತ್ತು ತ್ವರಿತ ಡೆಲಿವರಿ'
      : 'Fast, secure doorstep delivery within city limits';
  String get pickupAddress => isKn ? 'ಪಿಕಪ್ ವಿಳಾಸ' : 'Pickup Address';
  String get deliveryAddress => isKn ? 'ಡೆಲಿವರಿ ವಿಳಾಸ' : 'Delivery Address';
  String get packageCategory => isKn ? 'ಪ್ಯಾಕೇಜ್ ವಿಧ' : 'Package Category';
  String get weightTier => isKn ? 'ಅಂದಾಜು ತೂಕ' : 'Approx Weight';
  String get fragileItem => isKn ? 'ಸೂಕ್ಷ್ಮ ಅಥವಾ ಮುರಿಯುವ ವಸ್ತು' : 'Fragile / delicate item';
  String get instructions => isKn ? 'ರೈಡರ್‌ಗೆ ಸೂಚನೆಗಳು' : 'Instructions for rider';
  String get fareBreakdown => isKn ? 'ಶುಲ್ಕದ ವಿವರ' : 'Fare Breakdown';
  String get baseFare => isKn ? 'ಮೂಲ ಶುಲ್ಕ' : 'Base Fare';
  String get distanceCharge => isKn ? 'ದೂರದ ಶುಲ್ಕ' : 'Distance Charge';
  String get totalEstimatedFare => isKn ? 'ಅಂದಾಜು ಒಟ್ಟು ಶುಲ್ಕ' : 'Estimated Total Fare';
  String get bookParcelDelivery => isKn ? 'ಪಾರ್ಸಲ್ ಬುಕ್ ಮಾಡಿ' : 'Book Parcel Delivery';

  // 7. Cart & Checkout
  String get yourCart => isKn ? 'ನಿಮ್ಮ ಕಾರ್ಟ್' : 'Your Cart';
  String get emptyCart => isKn ? 'ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ' : 'Your cart is empty';
  String get addItemsNotice => isKn ? 'ರುಚಿಕರ ಆಹಾರವನ್ನು ಸೇರಿಸಿ!' : 'Add delicious items to get started!';
  String get itemTotal => isKn ? 'ಐಟಂ ಒಟ್ಟು' : 'Item Total';
  String get deliveryFee => isKn ? 'ಡೆಲಿವರಿ ಶುಲ್ಕ' : 'Delivery Fee';
  String get platformFee => isKn ? 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಶುಲ್ಕ' : 'Platform Fee';
  String get taxes => isKn ? 'ತೆರಿಗೆಗಳು (ಜಿಎಸ್‌ಟಿ)' : 'Taxes (GST)';
  String get discount => isKn ? 'ರಿಯಾಯಿತಿ' : 'Discount';
  String get toPay => isKn ? 'ಪಾವತಿಸಬೇಕಾದ ಒಟ್ಟು ಮೊತ್ತ' : 'To Pay';
  String get proceedToCheckout => isKn ? 'ಚೆಕ್‌ಔಟ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ' : 'Proceed to Checkout';
  String get placeOrder => isKn ? 'ಆರ್ಡರ್ ಖಚಿತಪಡಿಸಿ' : 'Place Order';
  String get selectPayment => isKn ? 'ಪಾವತಿ ವಿಧಾನ ಆಯ್ಕೆಮಾಡಿ' : 'Select Payment Method';

  // 8. Orders & Tracking
  String get activeOrders => isKn ? 'ಚಾಲ್ತಿ ಆರ್ಡರ್‌ಗಳು' : 'Active Orders';
  String get pastOrders => isKn ? 'ಹಿಂದಿನ ಆರ್ಡರ್‌ಗಳು' : 'Past Orders';
  String get trackOrder => isKn ? 'ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' : 'Track Order';
  String get reorder => isKn ? 'ಮತ್ತೆ ಆರ್ಡರ್ ಮಾಡಿ' : 'Reorder';
  String get rateOrder => isKn ? 'ರೇಟ್ ಮಾಡಿ' : 'Rate & Review';
  String get orderPlaced => isKn ? 'ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ' : 'Order Placed';
  String get orderConfirmed => isKn ? 'ದೃಢೀಕರಿಸಲಾಗಿದೆ' : 'Confirmed';
  String get preparingFood => isKn ? 'ತಯಾರಿಸಲಾಗುತ್ತಿದೆ' : 'Preparing';
  String get outForDelivery => isKn ? 'ಡೆಲಿವರಿಗೆ ಹೊರಟಿದೆ' : 'Out for Delivery';
  String get delivered => isKn ? 'ತಲುಪಿಸಲಾಗಿದೆ' : 'Delivered';

  // 9. Profile & Settings
  String get accountProfile => isKn ? 'ಖಾತೆ ಪ್ರೊಫೈಲ್' : 'Account Profile';
  String get appLanguage => isKn ? 'ಆ್ಯಪ್ ಭಾಷೆ' : 'App Language';
  String get currentLangDesc => isKn ? 'ಕನ್ನಡ (Kannada) • ಸಕ್ರಿಯವಾಗಿದೆ' : 'English • Active';
  String get darkTheme => isKn ? 'ಡಾರ್ಕ್ ಥೀಮ್' : 'Dark Theme';
  String get savedAddresses => isKn ? 'ಉಳಿಸಿದ ವಿಳಾಸಗಳು' : 'Saved Addresses';
  String get helpSupport => isKn ? 'ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ' : 'Help & Support';
  String get logout => isKn ? 'ಲಾಗ್ ಔಟ್' : 'Log Out';
}

final appStringsProvider = Provider<AppStrings>((ref) {
  final lang = ref.watch(languageProvider);
  return AppStrings(lang);
});
