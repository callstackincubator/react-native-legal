import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { MainScreen } from 'react-native-legal-common-example-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <MainScreen />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
