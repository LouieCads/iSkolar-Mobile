// (student)/_layout.tsx
import { Stack } from 'expo-router';
import SponsorNav from '@/components/student-nav';
import { View, StyleSheet } from 'react-native';

export default function Sponsor() {
  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="my-scholarships" />
        <Stack.Screen name="discover" />
        <Stack.Screen name="my-profile" />
      </Stack>
      <SponsorNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});