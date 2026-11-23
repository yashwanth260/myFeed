import 'package:flutter/material.dart';

/// Feedo Gold Design System Color Palette
/// Strict compliance with Gold Theme specifications.
class FeedoColors {
  FeedoColors._();

  // Primary Gold Accents
  static const Color primaryGold = Color(0xFFD4AF37);
  static const Color lightGold = Color(0xFFF5D77A);
  static const Color deepGold = Color(0xFFB8860B);
  static const Color goldMuted = Color(0xFFE8D394);

  // Gold Gradient (Primary CTA, Hero Cards, Badges)
  static const LinearGradient goldGradient = LinearGradient(
    colors: [lightGold, primaryGold, deepGold],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient softGoldGradient = LinearGradient(
    colors: [Color(0xFFFFF7DD), Color(0xFFFBF1CE)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient darkGoldGradient = LinearGradient(
    colors: [Color(0xFF2C2411), Color(0xFF1E1A0F)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Light Mode Surfaces
  static const Color bgLight = Color(0xFFFFFBF0); // Warm Cream Canvas
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color borderLight = Color(0xFFF0E3BC);

  // Dark Mode Surfaces
  static const Color bgDark = Color(0xFF121212);
  static const Color surfaceDark = Color(0xFF1E1B14);
  static const Color cardDark = Color(0xFF26221A);
  static const Color borderDark = Color(0xFF3D3524);

  // Text Colors
  static const Color textPrimaryLight = Color(0xFF1F1A0E);
  static const Color textSecondaryLight = Color(0xFF6B5E3C);
  static const Color textMutedLight = Color(0xFF9E8D65);

  static const Color textPrimaryDark = Color(0xFFFAF6EC);
  static const Color textSecondaryDark = Color(0xFFD6C8A5);
  static const Color textMutedDark = Color(0xFF8F8265);

  // Semantic Feedback & Status Badges
  static const Color success = Color(0xFF2E9E5B);
  static const Color error = Color(0xFFD64545);
  static const Color warning = Color(0xFFE68A00);
  static const Color starRating = Color(0xFFFFC107);

  // Veg & Non-Veg Standard Indicators
  static const Color veg = Color(0xFF2E9E5B);
  static const Color nonVeg = Color(0xFFD64545);
  static const Color egg = Color(0xFFE6A700);

  // Shadows
  static BoxShadow goldShadow = BoxShadow(
    color: primaryGold.withOpacity(0.18),
    blurRadius: 18,
    offset: const Offset(0, 6),
    spreadRadius: 1,
  );

  static BoxShadow softShadow = BoxShadow(
    color: Colors.black.withOpacity(0.04),
    blurRadius: 14,
    offset: const Offset(0, 4),
  );
}

