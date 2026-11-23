import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

/// Centralized API configuration for Feedo Customer App
/// Reads compile-time `--dart-define=API_BASE_URL=<URL>` when provided,
/// falling back to localhost for Web and 10.0.2.2 for Android emulators.
class ApiConfig {
  ApiConfig._();

  static const String _dartDefineUrl = String.fromEnvironment('API_BASE_URL', defaultValue: '');

  static String get baseUrl {
    if (_dartDefineUrl.isNotEmpty) {
      final sanitized = _dartDefineUrl.endsWith('/') ? _dartDefineUrl.substring(0, _dartDefineUrl.length - 1) : _dartDefineUrl;
      return sanitized.endsWith('/api/v1') ? sanitized : '$sanitized/api/v1';
    }
    if (kIsWeb) {
      return 'http://localhost:4000/api/v1';
    }
    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:4000/api/v1';
      }
    } catch (_) {}
    return 'http://localhost:4000/api/v1';
  }

  static String get wsUrl {
    if (_dartDefineUrl.isNotEmpty) {
      final sanitized = _dartDefineUrl.endsWith('/') ? _dartDefineUrl.substring(0, _dartDefineUrl.length - 1) : _dartDefineUrl;
      return sanitized.replaceAll('/api/v1', '');
    }
    if (kIsWeb) {
      return 'http://localhost:4000';
    }
    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:4000';
      }
    } catch (_) {}
    return 'http://localhost:4000';
  }
}
