import { Stack } from 'expo-router';

/**
 * Detail / secondary screens. Rendered as a stack so each has a back affordance
 * via <ScreenHeader /> (headers are owned by the screens themselves).
 */
export default function ScreensLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
