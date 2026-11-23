import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'feedo_colors.dart';
import 'feedo_typography.dart';

/// Feedo Gold Design System Themes
class FeedoTheme {
  FeedoTheme._();

  static ThemeData get lightTheme {
    final textTheme = FeedoTypography.createTextTheme(
      FeedoColors.textPrimaryLight,
      FeedoColors.textSecondaryLight,
      FeedoColors.textMutedLight,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: FeedoColors.primaryGold,
      scaffoldBackgroundColor: FeedoColors.bgLight,
      colorScheme: const ColorScheme.light(
        primary: FeedoColors.primaryGold,
        secondary: FeedoColors.deepGold,
        surface: FeedoColors.surfaceLight,
        error: FeedoColors.error,
        onPrimary: FeedoColors.textPrimaryLight,
        onSecondary: Colors.white,
        onSurface: FeedoColors.textPrimaryLight,
        onError: Colors.white,
      ),
      textTheme: textTheme,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        scrolledUnderElevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
          statusBarBrightness: Brightness.light,
        ),
        iconTheme: IconThemeData(color: FeedoColors.textPrimaryLight),
      ),
      cardTheme: CardThemeData(
        color: FeedoColors.cardLight,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: FeedoColors.borderLight, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: FeedoColors.surfaceLight,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        elevation: 16,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: Colors.white,
        selectedColor: FeedoColors.lightGold.withOpacity(0.4),
        side: const BorderSide(color: FeedoColors.borderLight, width: 1),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        labelStyle: textTheme.labelMedium,
      ),
      dividerColor: FeedoColors.borderLight.withOpacity(0.6),
    );
  }

  static ThemeData get darkTheme {
    final textTheme = FeedoTypography.createTextTheme(
      FeedoColors.textPrimaryDark,
      FeedoColors.textSecondaryDark,
      FeedoColors.textMutedDark,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: FeedoColors.primaryGold,
      scaffoldBackgroundColor: FeedoColors.bgDark,
      colorScheme: const ColorScheme.dark(
        primary: FeedoColors.primaryGold,
        secondary: FeedoColors.lightGold,
        surface: FeedoColors.surfaceDark,
        error: FeedoColors.error,
        onPrimary: Colors.black,
        onSecondary: Colors.black,
        onSurface: FeedoColors.textPrimaryDark,
        onError: Colors.white,
      ),
      textTheme: textTheme,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        scrolledUnderElevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.light,
          statusBarBrightness: Brightness.dark,
        ),
        iconTheme: IconThemeData(color: FeedoColors.textPrimaryDark),
      ),
      cardTheme: CardThemeData(
        color: FeedoColors.cardDark,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: FeedoColors.borderDark, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: FeedoColors.surfaceDark,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        elevation: 16,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: FeedoColors.cardDark,
        selectedColor: FeedoColors.primaryGold.withOpacity(0.2),
        side: const BorderSide(color: FeedoColors.borderDark, width: 1),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        labelStyle: textTheme.labelMedium,
      ),
      dividerColor: FeedoColors.borderDark,
    );
  }
}
