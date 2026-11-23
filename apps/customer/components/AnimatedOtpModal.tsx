import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { ShieldCheck, X } from 'lucide-react-native';

interface AnimatedOtpModalProps {
  visible: boolean;
  onClose: () => void;
  onVerifySuccess: (otp: string) => void;
  phoneNumber?: string;
}

export function AnimatedOtpModal({
  visible,
  onClose,
  onVerifySuccess,
  phoneNumber = '+91 98765 43210',
}: AnimatedOtpModalProps) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setDigits(['', '', '', '']);
      setErrorMessage('');
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 300);
    }
  }, [visible]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleChangeText = (text: string, index: number) => {
    setErrorMessage('');
    const newDigits = [...digits];
    newDigits[index] = text;
    setDigits(newDigits);

    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify when 4 digits are complete
    if (newDigits.every((d) => d.length === 1)) {
      handleVerify(newDigits.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (otpString?: string) => {
    const code = otpString || digits.join('');
    if (code.length < 4) {
      setErrorMessage('Please enter complete 4-digit code');
      triggerShake();
      return;
    }

    setLoading(true);
    // Simulating secure OTP validation
    setTimeout(() => {
      setLoading(false);
      if (code === '1234' || code === '9999' || code.length === 4) {
        onVerifySuccess(code);
        onClose();
      } else {
        setErrorMessage('Invalid verification code. Try: 1234');
        triggerShake();
      }
    }, 600);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <X color="#64748B" size={20} />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <ShieldCheck color="#1E1E1E" size={32} />
          </View>

          <Text style={styles.title}>Verify Mobile Number</Text>
          <Text style={styles.subtitle}>
            Enter the 4-digit code sent to <Text style={{ fontWeight: '800', color: '#1E1E1E' }}>{phoneNumber}</Text>
          </Text>

          {/* OTP Digit Input Cells with Shake Animation */}
          <Animated.View style={[styles.digitsRow, { transform: [{ translateX: shakeAnim }] }]}>
            {digits.map((digit, i) => {
              const isFilled = digit.length > 0;
              return (
                <TextInput
                  key={i}
                  ref={(ref) => (inputRefs.current[i] = ref)}
                  style={[styles.digitCell, isFilled && styles.digitCellFilled]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleChangeText(text, i)}
                  onKeyPress={(e) => handleKeyPress(e, i)}
                  selectTextOnFocus
                />
              );
            })}
          </Animated.View>

          {errorMessage !== '' && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <TouchableOpacity
            style={styles.verifyBtn}
            onPress={() => handleVerify()}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#1E1E1E" size="small" />
            ) : (
              <Text style={styles.verifyBtnText}>Confirm & Continue ➔</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Didn't receive code? </Text>
            <TouchableOpacity onPress={() => handleVerify('1234')}>
              <Text style={styles.resendText}>Use Demo OTP (1234)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFC727',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E1E1E',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  digitsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  digitCell: {
    width: 58,
    height: 62,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    color: '#1E1E1E',
  },
  digitCellFilled: {
    borderColor: '#FFC727',
    backgroundColor: '#FFFDF5',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 14,
  },
  verifyBtn: {
    width: '100%',
    height: 52,
    borderRadius: 20,
    backgroundColor: '#FFC727',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#FFC727',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyBtnText: {
    color: '#1E1E1E',
    fontSize: 15,
    fontWeight: '900',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
  },
  resendText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFC727',
  },
});

