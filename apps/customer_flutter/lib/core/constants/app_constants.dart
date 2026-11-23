import 'api_config.dart';

/// Application Constants for Feedo Customer App
class AppConstants {
  AppConstants._();

  static const String appName = 'Feedo';
  static const String appTagline = 'Gold-standard food, delivered.';
  static const String currencySymbol = '₹';

  // API Configuration
  static String get apiBaseUrl => ApiConfig.baseUrl;
  static String get wsUrl => ApiConfig.wsUrl;

  // Demo Credentials & Seeds
  static const String demoOtp = '1234';
  static const String defaultPhone = '+91 98765 43210';
  static const String defaultEmail = 'alex.johnson@feedo.com';
  static const String defaultName = 'Alex Johnson';

  // Pricing rules
  static const double freeDeliveryThreshold = 499.0;
  static const double defaultDeliveryFee = 35.0;
  static const double platformFee = 5.0;
  static const double taxPercentage = 0.05; // 5% GST
}

