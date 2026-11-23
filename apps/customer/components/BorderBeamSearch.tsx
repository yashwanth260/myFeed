import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, TextInput, TouchableOpacity } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';

interface BorderBeamSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
}

export function BorderBeamSearch({
  value,
  onChangeText,
  placeholder = 'Search here...',
  onFilterPress,
}: BorderBeamSearchProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 3100,
        useNativeDriver: false,
      })
    ).start();
  }, [animatedValue]);

  // Interpolate border color for smooth orbiting beam effect
  const borderColor = animatedValue.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: ['#FFC727', '#EC4899', '#38BDF8', '#FFC727'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.beamWrapper, { borderColor }]}>
        <View style={styles.innerContainer}>
          <Search color="#94A3B8" size={18} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            value={value}
            onChangeText={onChangeText}
          />
        </View>
      </Animated.View>

      <TouchableOpacity
        style={styles.yellowFilterBtn}
        onPress={onFilterPress}
        activeOpacity={0.85}
      >
        <SlidersHorizontal color="#1E1E1E" size={20} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  beamWrapper: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2,
    padding: 1.5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFC727',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16.5,
    paddingHorizontal: 14,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1E1E1E',
    fontWeight: '600',
  },
  yellowFilterBtn: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#FFC727',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFC727',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
});

