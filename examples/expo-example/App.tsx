import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import type { ListRenderItemInfo } from 'react-native';
import {
  Button,
  FlatList,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ReactNativeLegal } from 'react-native-legal';

const BUTTON_BACKGROUND_COLOR = '#8232ff';
const BUTTON_FONT_COLOR = '#FFF';
const BUTTON_RIPPLE_COLOR = '#8232ffba';
const MODAL_ITEM_HEADER_COLOR = '#fff';

function Item({ item }: { item: any }) {
  const [customDetailModalVisible, setCustomDetailModalVisible] = useState(false);

  const handlePress = useCallback(function handlePress() {
    setCustomDetailModalVisible(true);
  }, []);

  const closeModal = useCallback(function closeModal() {
    setCustomDetailModalVisible(false);
  }, []);

  return (
    <View style={styles.modalItem}>
      <Pressable
        accessibilityRole="button"
        android_ripple={{
          color: BUTTON_RIPPLE_COLOR,
          foreground: true,
        }}
        onPress={handlePress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.modalItemHeader}>{item.name}</Text>
      </Pressable>
      <Modal animationType="slide" supportedOrientations={['portrait', 'landscape']} visible={customDetailModalVisible}>
        <SafeAreaView style={styles.modal}>
          <Button onPress={closeModal} title="Exit detail view" />
          <ScrollView style={styles.modalDetailItem}>
            <Text style={styles.modalDetailItemHeader}>{item.name}</Text>
            <Text style={styles.modalDetailItemContent}>
              {item.licenses
                .map((license: any) => license.licenseContent)
                .reduce((a: string, c: string) => a + '\n' + c, '')}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function keyExtractor(item: any) {
  return item.id;
}

function renderItem({ item }: ListRenderItemInfo<any>) {
  return <Item item={item} />;
}

export default function App() {
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [libraries, setLibraries] = useState<object[]>([]);

  const launchNotice = useCallback(function launchNotice() {
    ReactNativeLegal.launchLicenseListScreen('OSS Notice');
  }, []);

  const getLibraries = useCallback(async function getLibraries() {
    const startAsync = performance.now();
    const rawLibrariesAsync = await ReactNativeLegal.getLibrariesAsync();
    const stopAsync = performance.now();

    /**
     * Android simulator ~160ms
     * iOS simulator ~10ms
     */
    console.log('perf async: ', stopAsync - startAsync);

    setLibraries(rawLibrariesAsync.data);
    setCustomModalVisible(true);
  }, []);

  const closeModal = useCallback(function closeModal() {
    setCustomModalVisible(false);
  }, []);

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
      <Pressable
        accessibilityRole="button"
        android_ripple={{
          color: BUTTON_RIPPLE_COLOR,
          foreground: true,
        }}
        onPress={getLibraries}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.label}>Tap to get list of licenses</Text>
      </Pressable>
      <Modal animationType="slide" supportedOrientations={['portrait', 'landscape']} visible={customModalVisible}>
        <SafeAreaView style={styles.modal}>
          <Button onPress={closeModal} title="Exit list" />
          <FlatList data={libraries} keyExtractor={keyExtractor} renderItem={renderItem} />
        </SafeAreaView>
      </Modal>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: BUTTON_BACKGROUND_COLOR,
    borderRadius: 20,
    margin: 10,
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
  modal: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flex: 1,
    justifyContent: 'center',
  },
  modalItem: {
    alignSelf: 'stretch',
  },
  modalItemHeader: {
    color: MODAL_ITEM_HEADER_COLOR,
    fontSize: 28,
    fontWeight: 'bold',
    margin: 8,
  },
  modalDetailItem: {
    alignSelf: 'stretch',
    margin: 16,
  },
  modalDetailItemHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    margin: 8,
  },
  modalDetailItemContent: {
    fontSize: 12,
    margin: 4,
  },
  pressed: {
    opacity: Platform.select({
      android: 1,
      default: 0.4,
    }),
  },
});
