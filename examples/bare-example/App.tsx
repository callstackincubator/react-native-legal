import { Platform, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { ReactNativeLegal } from 'react-native-legal';

const BUTTON_BACKGROUND_COLOR = '#8232ff';
const BUTTON_FONT_COLOR = '#FFF';
const BUTTON_RIPPLE_COLOR = '#8232ffba';

export default function App() {
  function launchNotice() {
    ReactNativeLegal.launchLicenseListScreen('Licences');
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        android_ripple={{
          color: BUTTON_RIPPLE_COLOR,
          foreground: true,
        }}
        onPress={launchNotice}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.label}>Tap to see list of OSS libraries</Text>
      </Pressable>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: BUTTON_BACKGROUND_COLOR,
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: BUTTON_FONT_COLOR,
    fontSize: 20,
  },
  pressed: {
    opacity: Platform.select({
      android: 1,
      default: 0.4,
    }),
  },
});
