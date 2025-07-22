import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { BUTTON_BACKGROUND_COLOR, LABEL_COLOR, PRESSABLE_RIPPLE_CONFIG } from './constants';

interface Props {
  label: string;
  onPress: () => void;
}

export const ExampleButton = ({ label, onPress }: Props) => {
  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={PRESSABLE_RIPPLE_CONFIG}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: BUTTON_BACKGROUND_COLOR,
    borderRadius: 20,
    margin: 10,
    overflow: 'hidden',
    padding: 20,
  },
  label: {
    color: LABEL_COLOR,
    fontSize: 20,
  },
  pressed: {
    opacity: Platform.select({
      android: 1,
      default: 0.4,
    }),
  },
});
