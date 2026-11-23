# Feedo — Customer Food Delivery Mobile App

> **"Gold-standard food, delivered."**

Feedo is a production-quality, customer-facing food delivery mobile application built with **Flutter 3**, **Material 3**, **Riverpod**, and **GoRouter**, styled with a signature **Gold Theme**.

---

## 🌟 Highlights & Features

1. **Splash & Onboarding**:
   - 3 swipeable onboarding screens highlighting Discover, Order, and Live GPS Tracking.
   - Quick "Skip" and "Get Started" navigation.
2. **Authentication & Session**:
   - Phone number login with OTP verification (`1234` mock OTP).
   - "Continue as Guest" support.
   - Session persistence via `SharedPreferences`.
3. **Interactive Home Feed**:
   - Location picker sheet (Indiranagar, Koramangala, Whitefield, etc.).
   - Search bar with live keyword filtering.
   - Promotional carousel cards with gold gradient styling.
   - 8 category chips (Pizza, Burgers, Biryani, Desserts, Healthy, Chinese, South Indian, Beverages).
   - Dynamic restaurant sections: Popular Near You, Top Rated (4.5+), Fast Delivery (≤ 25m), New on Feedo.
4. **Search & Smart Filters**:
   - Search by restaurant name, cuisine, or dish name.
   - Filter bottom sheet (Veg only, Rating 4.0+, Max delivery time, Sort by rating/time/price).
   - Search history tags and empty states.
5. **Restaurant Details & Menu**:
   - Collapsing sliver header with restaurant metrics, delivery badge, and distance.
   - Sticky category navigation tabs.
   - Dietary badges (Veg 🟢, Non-Veg 🔴, Egg 🟡).
   - Quantity stepper and floating "View Cart" gold badge.
6. **Item Customization**:
   - Bottom sheet for portion sizes, crusts, and extra toppings.
   - Live total price calculation.
7. **Cart & Multi-Restaurant Conflict Guard**:
   - Interactive item list with quantity adjustment and swipe removal.
   - Coupon codes (`FEEDO50`, `GOLD20`, `WELCOME`, `FREEDEL`, etc.) with instant validation.
   - Automatic multi-restaurant conflict modal ("Replace Cart?" alert).
   - Bill breakdown: Subtotal, Delivery Fee (Free on orders ₹499+ or via coupon), Platform Fee, Taxes (5%), and Discounts.
8. **Checkout & Multi-Payment**:
   - Delivery address selector and delivery instructions.
   - Payment methods: UPI (Google Pay, PhonePe, Paytm), Credit/Debit Card, Feedo Gold Wallet, and Cash on Delivery.
9. **Live GPS Order Tracking**:
   - Custom animated canvas map with moving rider marker and route path.
   - Step progress indicator (Placed ➔ Confirmed ➔ Preparing ➔ Out for Delivery ➔ Delivered).
   - Delivery partner details card with quick call and chat action triggers.
   - Drop OTP code display (`4289`).
10. **Orders, Favorites & Profile**:
    - Orders screen with Active and Past orders, reorder trigger, and 5-star rating dialog with feedback tags.
    - Favorites screen with real-time sync.
    - Profile screen with Dark Mode toggle, addresses, payment cards, help & support, and logout.

---

## 🎨 Gold Theme Design System

The application uses dedicated gold design tokens defined in `lib/core/theme/`:

| Token | Hex Value | Usage |
|---|---|---|
| `primaryGold` | `#D4AF37` | Core brand color, primary icons, highlights |
| `lightGold` | `#F5D77A` | Gradient start, borders, subtle badges |
| `deepGold` | `#B8860B` | Gradient end, text contrast, buttons |
| `goldGradient` | `#F5D77A ➔ #D4AF37 ➔ #B8860B` | Primary CTAs, active highlights |
| `bgLight` | `#FFFBF0` | Light mode warm cream background |
| `bgDark` | `#121212` | Dark mode background |
| `surfaceDark` | `#1E1B14` | Dark mode card/sheet surface |
| `textPrimaryLight` | `#1F1A0E` | High contrast body & heading text |

Typography uses **Poppins** for headings and **Inter** for body text.

---

## 📁 Project Architecture

The app adheres to Clean Architecture and feature-driven modularity:

```
apps/customer_flutter/
├── lib/
│   ├── app.dart                        # FeedoApp widget with Riverpod theme listener
│   ├── main.dart                       # App entry point, SharedPreferences initialization
│   ├── core/
│   │   ├── constants/                  # App constants, fee rules, promo codes
│   │   ├── router/                     # GoRouter configuration with StatefulShellRoute
│   │   ├── storage/                    # LocalStorageService (session, cart, favorites, theme)
│   │   ├── theme/                      # FeedoColors, FeedoTypography, FeedoTheme, themeProvider
│   │   └── utils/                      # CurrencyFormatter (INR ₹ formatting)
│   ├── features/
│   │   ├── auth/                       # UserModel, authProvider, LoginScreen, OtpScreen
│   │   ├── cart/                       # CartItemModel, cartProvider, CartScreen
│   │   ├── checkout/                   # CheckoutScreen with payment options
│   │   ├── favorites/                  # FavoritesScreen
│   │   ├── home/                       # CategoryModel, MockFeedoData, homeProvider, HomeScreen, MainShellScreen
│   │   ├── notifications/              # NotificationsScreen
│   │   ├── offers/                     # CouponModel, OffersScreen
│   │   ├── onboarding/                 # SplashScreen, OnboardingScreen
│   │   ├── orders/                     # OrderModel, ordersProvider, OrdersScreen, RateReviewDialog
│   │   ├── profile/                    # ProfileScreen with Dark Mode toggle
│   │   ├── restaurant/                 # RestaurantModel, MenuItemModel, RestaurantDetailScreen, CustomizationBottomSheet
│   │   ├── search/                     # SearchScreen, FilterBottomSheet
│   │   └── tracking/                   # OrderTrackingScreen with animated canvas map
│   └── shared/
│       └── widgets/                    # Reusable components (FeedoButton, FeedoCard, FoodItemTile, MockMapWidget, etc.)
└── test/
    ├── cart_total_test.dart            # Unit test for price and customization math
    ├── coupon_logic_test.dart          # Unit test for coupon percentage and cap validation
    └── widget_test.dart                # Widget test for FeedoButton render and tap
```

---

## 🚀 Running the App Locally

### Prerequisites
- Flutter SDK 3.24+ / 3.44+
- Chrome (for Web testing) or Android / iOS Emulator

### Commands
```bash
# Navigate to the customer app directory
cd apps/customer_flutter

# Install dependencies
flutter pub get

# Run static analysis
flutter analyze

# Run unit and widget tests
flutter test

# Run on Chrome
flutter run -d chrome

# Run on connected mobile device or emulator
flutter run
```

---

## 🔌 Swapping Mock Data for Real Backend API

Currently, data is served through `MockFeedoData` behind Riverpod providers. To integrate with the NestJS backend API:

1. **Add `http` or `dio`** to `pubspec.yaml`:
   ```yaml
   dependencies:
     dio: ^5.7.0
   ```
2. **Implement API Client**:
   Create `lib/core/network/api_client.dart` pointing to `http://localhost:3000/api/v1` (or `http://10.0.2.2:3000/api/v1` for Android emulator).
3. **Swap Provider implementations**:
   In `lib/features/home/presentation/home_provider.dart`:
   ```dart
   final allRestaurantsProvider = FutureProvider<List<RestaurantModel>>((ref) async {
     final response = await ref.watch(apiClientProvider).get('/restaurants');
     return (response.data['data'] as List).map((json) => RestaurantModel.fromJson(json)).toList();
   });
   ```
4. **WebSockets for Live Tracking**:
   Connect `Socket.IO` to `order_tracking_screen.dart` to receive live rider coordinates emitted by the NestJS Gateway (`tracking:location_update`).
