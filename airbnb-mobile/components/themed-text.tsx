import { Text, type TextProps, StyleSheet } from 'react-native';
import { ms } from 'react-native-size-matters';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'subtitle' | 'heading' | 'body' | 'caption' | 'link';
  color?: string;
  lightColor?: string;
  darkColor?: string;
};

export function ThemedText({
  style,
  type = 'default',
  color: propColor,
  lightColor,
  darkColor,
  children,
  ...rest
}: ThemedTextProps) {
  const themeColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const textColor = propColor || themeColor;

  return (
    <Text
      style={[
        styles.base,
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'heading' && styles.heading,
        type === 'body' && styles.body,
        type === 'caption' && styles.caption,
        type === 'link' && styles.link,
        { color: textColor },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'Figtree-Regular',
  },
  default: {
    fontSize: ms(16),
    lineHeight: ms(24),
    fontFamily: 'Figtree-Regular',
  },
  title: {
    fontSize: ms(30),
    lineHeight: ms(48),
    fontFamily: 'Figtree-Bold',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: ms(28),
    lineHeight: ms(34),
    fontFamily: 'Figtree-SemiBold',
    letterSpacing: -0.3,
  },
  heading: {
    fontSize: ms(22),
    lineHeight: ms(28),
    fontFamily: 'Figtree-SemiBold',
  },
  body: {
    fontSize: ms(17),
    lineHeight: ms(24),
    fontFamily: 'Figtree-Regular',
  },
  caption: {
    fontSize: ms(13),
    lineHeight: ms(18),
    fontFamily: 'Figtree-Regular',
  },
  link: {
    fontSize: ms(16),
    lineHeight: ms(24),
    fontFamily: 'Figtree-SemiBold',
    color: '#FF385C',
  },
});