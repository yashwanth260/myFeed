import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../shared/widgets/feedo_button.dart';
import '../../../shared/widgets/feedo_card.dart';
import 'auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final TextEditingController _phoneController = TextEditingController(text: '9876543210');
  String? _errorText;

  void _submit() {
    final text = _phoneController.text.trim();
    if (text.length < 10) {
      setState(() => _errorText = 'Please enter a valid 10-digit mobile number');
      return;
    }
    setState(() => _errorText = null);
    context.push('/otp', extra: text);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              // Brand Icon
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: FeedoColors.goldGradient,
                  boxShadow: [FeedoColors.goldShadow],
                ),
                child: const Icon(Icons.lock_person_rounded, color: Color(0xFF1F1A0E), size: 28),
              ),
              const SizedBox(height: 24),

              Text(
                'Welcome to Feedo',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 26,
                  fontWeight: FontWeight.w700,
                  color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Enter your phone number to proceed with gold-standard food delivery.',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                ),
              ),
              const SizedBox(height: 32),

              // Phone Input Card
              FeedoCard(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                      decoration: BoxDecoration(
                        color: FeedoColors.lightGold.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          const Text('🇮🇳', style: TextStyle(fontSize: 16)),
                          const SizedBox(width: 6),
                          Text(
                            '+91',
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontWeight: FontWeight.w700,
                              color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        maxLength: 10,
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                        ),
                        decoration: InputDecoration(
                          counterText: '',
                          border: InputBorder.none,
                          hintText: 'Enter 10-digit number',
                          hintStyle: TextStyle(
                            color: isDark ? Colors.grey[600] : Colors.grey[400],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              if (_errorText != null) ...[
                const SizedBox(height: 8),
                Text(
                  _errorText!,
                  style: const TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 12,
                    color: FeedoColors.error,
                  ),
                ),
              ],
              const SizedBox(height: 24),

              // Continue Button
              FeedoButton(
                width: double.infinity,
                height: 52,
                text: 'Send Verification Code',
                onPressed: _submit,
              ),

              const SizedBox(height: 24),

              // Divider
              Row(
                children: [
                  Expanded(child: Divider(color: isDark ? FeedoColors.borderDark : FeedoColors.borderLight)),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Text(
                      'OR',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: isDark ? FeedoColors.textMutedDark : FeedoColors.textMutedLight,
                      ),
                    ),
                  ),
                  Expanded(child: Divider(color: isDark ? FeedoColors.borderDark : FeedoColors.borderLight)),
                ],
              ),
              const SizedBox(height: 24),

              // Continue as Guest Button
              FeedoButton(
                width: double.infinity,
                height: 50,
                text: 'Continue as Guest',
                variant: FeedoButtonVariant.secondary,
                icon: const Icon(Icons.person_outline_rounded, size: 20),
                onPressed: () async {
                  await ref.read(authProvider.notifier).continueAsGuest();
                  if (context.mounted) {
                    context.go('/home');
                  }
                },
              ),

              const SizedBox(height: 36),
              Center(
                child: Text(
                  'By continuing, you agree to our Terms of Service & Privacy Policy',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 11,
                    color: isDark ? FeedoColors.textMutedDark : FeedoColors.textMutedLight,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

