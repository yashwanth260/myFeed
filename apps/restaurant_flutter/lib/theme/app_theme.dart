import 'package:flutter/material.dart';

class AppTheme {
  // Feedo Restaurant Partner Brand Colors
  static const Color primaryAmber = Color(0xFFFFC727);
  static const Color primaryDark = Color(0xFF1E1E1E);
  static const Color surfaceCard = Color(0xFFFFFFFF);
  static const Color background = Color(0xFFF8FAFC);
  static const Color accentOrange = Color(0xFFF97316);
  static const Color statusGreen = Color(0xFF10B981);
  static const Color statusRed = Color(0xFFEF4444);
  static const Color textMuted = Color(0xFF64748B);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: background,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryAmber,
        primary: primaryAmber,
        secondary: accentOrange,
        surface: surfaceCard,
        background: background,
      ),
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: primaryDark),
        titleTextStyle: TextStyle(
          color: primaryDark,
          fontSize: 18,
          fontWeight: FontWeight.w900,
        ),
      ),
      cardTheme: CardTheme(
        color: surfaceCard,
        elevation: 2,
        shadowColor: Colors.black.withOpacity(0.06),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
    );
  }
}

