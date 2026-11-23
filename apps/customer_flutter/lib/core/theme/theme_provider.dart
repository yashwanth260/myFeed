import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../storage/local_storage_service.dart';

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences must be initialized before runApp');
});

final localStorageServiceProvider = Provider<LocalStorageService>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return LocalStorageService(prefs);
});

final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, bool>((ref) {
  final storage = ref.watch(localStorageServiceProvider);
  return ThemeModeNotifier(storage);
});

class ThemeModeNotifier extends StateNotifier<bool> {
  final LocalStorageService _storage;

  ThemeModeNotifier(this._storage) : super(_storage.isDarkMode);

  void toggleTheme() {
    state = !state;
    _storage.setDarkMode(state);
  }

  void setTheme(bool isDark) {
    state = isDark;
    _storage.setDarkMode(state);
  }
}

