import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:feedo_customer/core/theme/theme_provider.dart';
import 'package:feedo_customer/core/storage/local_storage_service.dart';
import 'package:feedo_customer/core/constants/app_constants.dart';
import '../domain/user_model.dart';

final authProvider = StateNotifierProvider<AuthNotifier, AsyncValue<UserModel?>>((ref) {
  final storage = ref.watch(localStorageServiceProvider);
  return AuthNotifier(storage);
});

class AuthNotifier extends StateNotifier<AsyncValue<UserModel?>> {
  final LocalStorageService _storage;

  AuthNotifier(this._storage) : super(const AsyncValue.loading()) {
    _loadUser();
  }

  void _loadUser() {
    if (_storage.isLoggedIn) {
      final userMap = _storage.user;
      if (userMap != null) {
        state = AsyncValue.data(UserModel.fromJson(userMap));
        return;
      }
    }
    state = const AsyncValue.data(null);
  }

  Future<bool> verifyOtp(String phone, String otp) async {
    state = const AsyncValue.loading();
    await Future.delayed(const Duration(milliseconds: 600));

    if (otp == AppConstants.demoOtp) {
      final user = UserModel(
        id: 'usr_${DateTime.now().millisecondsSinceEpoch}',
        name: AppConstants.defaultName,
        email: AppConstants.defaultEmail,
        phone: phone,
      );
      await _storage.setLoggedIn(true);
      await _storage.setUser(user.toJson());
      state = AsyncValue.data(user);
      return true;
    } else {
      state = const AsyncValue.data(null);
      return false;
    }
  }

  Future<void> continueAsGuest() async {
    const guest = UserModel(
      id: 'usr_guest',
      name: 'Guest Diner',
      email: 'guest@feedo.com',
      phone: '+91 00000 00000',
      isGuest: true,
    );
    await _storage.setLoggedIn(true);
    await _storage.setUser(guest.toJson());
    state = const AsyncValue.data(guest);
  }

  Future<void> updateProfile({required String name, required String email}) async {
    final current = state.value;
    if (current == null) return;
    final updated = UserModel(
      id: current.id,
      name: name,
      email: email,
      phone: current.phone,
      avatarUrl: current.avatarUrl,
      isGuest: false,
    );
    await _storage.setUser(updated.toJson());
    state = AsyncValue.data(updated);
  }

  Future<void> logout() async {
    await _storage.clearAuth();
    state = const AsyncValue.data(null);
  }
}
