import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../theme';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  return { theme, isDark: colorScheme === 'dark' };
};
