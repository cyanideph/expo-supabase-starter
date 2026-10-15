import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cn } from '@/lib/utils';

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'label'
  | 'caption';

const variantClasses: Record<TextVariant, string> = {
  display: 'text-4xl font-bold text-foreground',
  title: 'text-3xl font-bold text-foreground',
  heading: 'text-2xl font-bold text-foreground',
  subheading: 'text-lg font-semibold text-foreground',
  body: 'text-base text-foreground',
  label: 'text-sm font-semibold text-foreground',
  caption: 'text-xs text-muted-foreground',
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  /** Render with the muted foreground colour, regardless of variant. */
  muted?: boolean;
  className?: string;
}

export function Text({
  variant = 'body',
  muted = false,
  className,
  ...props
}: TextProps) {
  return (
    <RNText
      className={cn(variantClasses[variant], muted && 'text-muted-foreground', className)}
      {...props}
    />
  );
}
