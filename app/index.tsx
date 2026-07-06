import { Redirect } from 'expo-router';

export default function Index() {
  // This ensures the app loads the welcome screen FIRST, bypassing the infinite loop.
  return <Redirect href="/(auth)/welcome" />;
}