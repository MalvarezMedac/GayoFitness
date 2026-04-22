import { View, type ViewProps, useWindowDimensions } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const { height } = useWindowDimensions();

  return <View style={[{ backgroundColor, flex: 1, minHeight: height }, style]} {...otherProps} />;
}