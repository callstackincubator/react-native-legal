import { StatusBar } from 'expo-status-bar';
import { type ColorValue, Platform, PlatformColor, StyleSheet, useColorScheme } from 'react-native';
import { MainScreen } from 'react-native-legal-common-example-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const isDarkScheme = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider style={isDarkScheme ? DARK_CONTAINER_STYLES : LIGHT_CONTAINER_STYLES}>
      <MainScreen />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkContainer: {
    backgroundColor: Platform.select<ColorValue>({
      android: PlatformColor('@android:color/system_surface_dark'),
      default: '#333',
    }),
  },
  lightContainer: {
    backgroundColor: Platform.select<ColorValue>({
      android: PlatformColor('@android:color/system_surface_light'),
      default: '#ccc',
    }),
  },
});

const DARK_CONTAINER_STYLES = [styles.container, styles.darkContainer];
const LIGHT_CONTAINER_STYLES = [styles.container, styles.lightContainer];
