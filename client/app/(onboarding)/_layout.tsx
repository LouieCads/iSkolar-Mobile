import { Stack } from 'expo-router';

export default function Onboarding() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
    </Stack>
  );
} 