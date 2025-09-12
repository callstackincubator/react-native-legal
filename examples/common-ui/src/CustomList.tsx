import { useCallback, useState } from 'react';
import type { ListRenderItemInfo } from 'react-native';
import { FlatList, StyleSheet, View } from 'react-native';
import type { Library } from 'react-native-legal';

import { CustomListButton } from './CustomListButton';
import { CustomListDetails } from './CustomListDetails';
import { FullscreenModal } from './FullscreenModal';

function Item({ item }: { item: Library }) {
  const [customDetailModalVisible, setCustomDetailModalVisible] = useState(false);

  const handlePress = useCallback(function handlePress() {
    setCustomDetailModalVisible(true);
  }, []);

  const closeModal = useCallback(function closeModal() {
    setCustomDetailModalVisible(false);
  }, []);

  return (
    <View style={styles.item}>
      <CustomListButton label={item.name} onPress={handlePress} />
      <FullscreenModal visible={customDetailModalVisible}>
        <CustomListDetails item={item} onModalClose={closeModal} />
      </FullscreenModal>
    </View>
  );
}

function keyExtractor(item: Library) {
  return item.id;
}

function renderItem({ item }: ListRenderItemInfo<Library>) {
  return <Item item={item} />;
}

interface Props {
  libraries: Library[];
}

export const CustomList = ({ libraries }: Props) => {
  return <FlatList data={libraries} keyExtractor={keyExtractor} renderItem={renderItem} style={styles.list} />;
};

const styles = StyleSheet.create({
  item: {
    alignSelf: 'stretch',
    margin: 5,
  },
  list: {
    alignSelf: 'stretch',
  },
});
