import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, ViewStyle } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'danger';
  style?: StyleProp<ViewStyle>;
  rightAccessory?: ReactNode;
};

export function PrimaryButton({
  title,
  onPress,
  disabled,
  tone = 'primary',
  style,
  rightAccessory,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        tone === 'danger' ? styles.danger : styles.primary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      <Text style={styles.btnText}>{title}</Text>
      {rightAccessory ? <>{rightAccessory}</> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  primary: {
    backgroundColor: '#208AEF',
  },
  danger: {
    backgroundColor: '#E53935',
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
  },
});

