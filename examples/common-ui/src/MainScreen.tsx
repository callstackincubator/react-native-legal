import { useCallback, useState } from 'react';
import { Button, StyleSheet, useColorScheme } from 'react-native';
import type { Library } from 'react-native-legal';
import { ReactNativeLegal } from 'react-native-legal';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomList } from './CustomList';
import { ExampleButton } from './ExampleButton';
import { FullscreenModal } from './FullscreenModal';
import { DARK_BACKGROUND_COLOR, LIGHT_BACKGROUND_COLOR } from './constants';

export const MainScreen = () => {
  const isDarkScheme = useColorScheme() === 'dark';
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [libraries, setLibraries] = useState<Library[]>([]);

  const launchNotice = useCallback(function launchNotice() {
    ReactNativeLegal.launchLicenseListScreen('OSS Notice');
  }, []);

  const getLibraries = useCallback(async function getLibraries() {
    try {
      const startAsync = performance.now();
      const rawLibrariesAsync = await ReactNativeLegal.getLibrariesAsync();
      const stopAsync = performance.now();

      console.log('perf async: ', stopAsync - startAsync);

      setLibraries(rawLibrariesAsync.data);
      setCustomModalVisible(true);
    } catch (error) {
      console.warn('ERROR', error);
    }
  }, []);

  const closeModal = useCallback(function closeModal() {
    setCustomModalVisible(false);
  }, []);

  return (
    <>
      <ExampleButton label="Tap to see list of OSS libraries" onPress={launchNotice} />
      <ExampleButton label="Tap to get list of licenses" onPress={getLibraries} />
      <FullscreenModal visible={customModalVisible}>
        <SafeAreaView edges={['bottom', 'left', 'right', 'top']} style={isDarkScheme ? DARK_STYLES : LIGHT_STYLES}>
          <Button onPress={closeModal} title="Exit list" />
          <CustomList libraries={libraries} />
        </SafeAreaView>
      </FullscreenModal>
    </>
  );
};

const styles = StyleSheet.create({
  darkContent: {
    backgroundColor: DARK_BACKGROUND_COLOR,
  },
  lightContent: {
    backgroundColor: LIGHT_BACKGROUND_COLOR,
  },
  modalContent: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flex: 1,
    justifyContent: 'center',
  },
});

const DARK_STYLES = [styles.modalContent, styles.darkContent];
const LIGHT_STYLES = [styles.modalContent, styles.lightContent];
