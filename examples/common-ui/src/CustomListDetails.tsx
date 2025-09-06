import { Button, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import type { Library } from 'react-native-legal';

interface Props {
  item: Library;
  onModalClose: () => void;
}

export const CustomListDetails = ({ item, onModalClose }: Props) => {
  return (
    <SafeAreaView style={styles.container}>
      <Button onPress={onModalClose} title="Exit detail view" />
      <ScrollView style={styles.scroll}>
        <Text style={styles.header}>{item.name}</Text>
        {item.version ? <Text style={styles.subheader}>Version: {item.version}</Text> : null}
        <Text style={styles.content}>
          {item.licenses.map((license) => license.licenseContent).reduce((a, c) => a + '\n' + c, '')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    fontSize: 13,
    margin: 4,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    margin: 8,
  },
  subheader: {
    fontSize: 20,
    fontWeight: 'semibold',
    margin: 4,
  },
  scroll: {
    alignSelf: 'stretch',
    margin: 16,
  },
});
