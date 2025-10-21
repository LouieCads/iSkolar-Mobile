import { Stack } from 'expo-router';

export default function Sponsor() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="my-scholarships" />
    </Stack>
  );
} 