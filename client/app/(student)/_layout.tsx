// (student)/_layout.tsx
import { Stack } from 'expo-router';
import StudentNav from '@/components/student-nav';
import { View, StyleSheet } from 'react-native';

export default function Student() {
  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="discover" />
        <Stack.Screen name="my-profile" />
      </Stack>
      <StudentNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});