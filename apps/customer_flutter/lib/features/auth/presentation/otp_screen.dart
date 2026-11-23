import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/feedo_colors.dart';
import '../../../shared/widgets/feedo_button.dart';
import '../../../shared/widgets/gold_app_bar.dart';
import 'auth_provider.dart';

class OtpScreen extends ConsumerStatefulWidget {
  final String phone;

  const OtpScreen({super.key, required this.phone});

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final List<TextEditingController> _controllers = List.generate(4, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(4, (_) => FocusNode());
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    for (var c in _controllers) {
      c.dispose();
    }
    for (var f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  String get _currentOtp => _controllers.map((c) => c.text).join();

  void _onOtpChanged(int index, String value) {
    if (value.isNotEmpty) {
      if (index < 3) {
        _focusNodes[index + 1].requestFocus();
      } else {
        _focusNodes[index].unfocus();
        _verify();
      }
    } else {
      if (index > 0) {
        _focusNodes[index - 1].requestFocus();
      }
    }
    setState(() => _errorMessage = null);
  }

  void _autofillMockCode() {
    const code = '1234';
    for (int i = 0; i < 4; i++) {
      _controllers[i].text = code[i];
    }
    _verify();
  }

  Future<void> _verify() async {
    final otp = _currentOtp;
    if (otp.length < 4) {
      setState(() => _errorMessage = 'Please enter all 4 digits');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final success = await ref.read(authProvider.notifier).verifyOtp(widget.phone, otp);

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        context.go('/home');
      } else {
        setState(() => _errorMessage = 'Invalid code. Use demo code 1234.');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? FeedoColors.bgDark : FeedoColors.bgLight,
      appBar: const GoldAppBar(),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Verification Code',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Enter the 4-digit verification code sent to +91 ${widget.phone}',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  color: isDark ? FeedoColors.textSecondaryDark : FeedoColors.textSecondaryLight,
                ),
              ),
              const SizedBox(height: 36),

              // 4 OTP Boxes
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(4, (index) {
                  return Container(
                    width: 58,
                    height: 64,
                    decoration: BoxDecoration(
                      color: isDark ? FeedoColors.surfaceDark : Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: _errorMessage != null
                            ? FeedoColors.error
                            : (_focusNodes[index].hasFocus
                                ? FeedoColors.primaryGold
                                : (isDark ? FeedoColors.borderDark : FeedoColors.borderLight)),
                        width: _focusNodes[index].hasFocus ? 2.0 : 1.2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: FeedoColors.primaryGold.withOpacity(0.06),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    alignment: Alignment.center,
                    child: TextField(
                      controller: _controllers[index],
                      focusNode: _focusNodes[index],
                      keyboardType: TextInputType.number,
                      textAlign: TextAlign.center,
                      maxLength: 1,
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        color: isDark ? FeedoColors.textPrimaryDark : FeedoColors.textPrimaryLight,
                      ),
                      decoration: const InputDecoration(
                        counterText: '',
                        border: InputBorder.none,
                      ),
                      onChanged: (v) => _onOtpChanged(index, v),
                    ),
                  );
                }),
              ),

              if (_errorMessage != null) ...[
                const SizedBox(height: 16),
                Center(
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      color: FeedoColors.error,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],

              const SizedBox(height: 24),

              // Quick Demo Autofill Pill
              Center(
                child: GestureDetector(
                  onTap: _autofillMockCode,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: FeedoColors.lightGold.withOpacity(0.25),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: FeedoColors.primaryGold.withOpacity(0.5)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.bolt_rounded, size: 16, color: FeedoColors.deepGold),
                        SizedBox(width: 6),
                        Text(
                          'Tap to autofill demo code 1234',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: FeedoColors.deepGold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              const Spacer(),

              FeedoButton(
                width: double.infinity,
                height: 52,
                text: 'Verify & Continue',
                isLoading: _isLoading,
                onPressed: _verify,
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}

