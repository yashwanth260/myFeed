import '../constants/app_constants.dart';

/// Formatter for displaying prices with currency symbol
class CurrencyFormatter {
  CurrencyFormatter._();

  static String format(double amount) {
    if (amount % 1 == 0) {
      return '${AppConstants.currencySymbol}${amount.toInt()}';
    }
    return '${AppConstants.currencySymbol}${amount.toStringAsFixed(2)}';
  }
}

