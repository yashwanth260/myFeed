import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

/// Local Storage Service for saving session, cart, theme, favorites
class LocalStorageService {
  final SharedPreferences _prefs;

  LocalStorageService(this._prefs);

  static const String keyIsDarkMode = 'feedo_dark_mode';
  static const String keyIsLoggedIn = 'feedo_logged_in';
  static const String keyUserJson = 'feedo_user_json';
  static const String keyCartItems = 'feedo_cart_items';
  static const String keyFavorites = 'feedo_favorites';
  static const String keySelectedAddress = 'feedo_selected_address';
  static const String keyRecentSearches = 'feedo_recent_searches';
  static const String keySelectedLanguage = 'feedo_selected_language';
  static const String keyHasChosenLanguage = 'feedo_has_chosen_language';

  // Language
  String get selectedLanguage => _prefs.getString(keySelectedLanguage) ?? 'en';
  Future<void> setSelectedLanguage(String lang) => _prefs.setString(keySelectedLanguage, lang);

  bool get hasChosenLanguage => _prefs.getBool(keyHasChosenLanguage) ?? false;
  Future<void> setHasChosenLanguage(bool val) => _prefs.setBool(keyHasChosenLanguage, val);

  // Theme
  bool get isDarkMode => _prefs.getBool(keyIsDarkMode) ?? false;
  Future<void> setDarkMode(bool value) => _prefs.setBool(keyIsDarkMode, value);

  // Auth
  bool get isLoggedIn => _prefs.getBool(keyIsLoggedIn) ?? false;
  Future<void> setLoggedIn(bool value) => _prefs.setBool(keyIsLoggedIn, value);

  Map<String, dynamic>? get user {
    final str = _prefs.getString(keyUserJson);
    if (str == null) return null;
    try {
      return jsonDecode(str) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  Future<void> setUser(Map<String, dynamic>? map) {
    if (map == null) return _prefs.remove(keyUserJson);
    return _prefs.setString(keyUserJson, jsonEncode(map));
  }

  // Favorites
  List<String> get favorites => _prefs.getStringList(keyFavorites) ?? [];
  Future<void> setFavorites(List<String> list) => _prefs.setStringList(keyFavorites, list);

  // Recent Searches
  List<String> get recentSearches => _prefs.getStringList(keyRecentSearches) ?? [];
  Future<void> setRecentSearches(List<String> list) => _prefs.setStringList(keyRecentSearches, list);

  // Selected Address
  String? get selectedAddress => _prefs.getString(keySelectedAddress);
  Future<void> setSelectedAddress(String addr) => _prefs.setString(keySelectedAddress, addr);

  // Clear session
  Future<void> clearAuth() async {
    await _prefs.remove(keyIsLoggedIn);
    await _prefs.remove(keyUserJson);
  }
}

