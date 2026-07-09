import { StyleSheet, Text, View } from 'react-native';

export function ErrorBanner({ message }: { message: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Couldn’t continue</Text>
      <Text style={styles.msg}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 12,
    backgroundColor: '#FFE5E5',
    borderColor: '#FF6B6B',
    borderWidth: 1,
    borderRadius: 12,
    gap: 6,
  },
  title: {
    fontWeight: '800',
    color: '#B00020',
  },
  msg: {
    color: '#B00020',
  },
});

