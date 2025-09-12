import type { PropsWithChildren } from 'react';
import { Modal } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

interface FullscreenModalProps {
  visible: boolean;
}

export const FullscreenModal = ({ children, visible }: PropsWithChildren<FullscreenModalProps>) => {
  return (
    <Modal animationType="slide" supportedOrientations={['portrait', 'landscape']} visible={visible}>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </Modal>
  );
};
