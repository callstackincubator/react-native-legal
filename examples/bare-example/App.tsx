import { StatusBar, StyleSheet, View } from 'react-native';
import { MainScreen } from 'react-native-legal-common-example-ui';

export default function App() {
  return (
    <View style={styles.container}>
      <MainScreen />
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
