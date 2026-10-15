import React from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'rooms'
  | 'feed'
  | 'bell'
  | 'user'
  | 'grid'
  | 'chevron-left'
  | 'chevron-right'
  | 'plus'
  | 'heart'
  | 'comment'
  | 'send'
  | 'check'
  | 'x'
  | 'search'
  | 'settings'
  | 'shield'
  | 'flag'
  | 'star'
  | 'calendar'
  | 'eye'
  | 'log-out'
  | 'sun'
  | 'moon'
  | 'lock'
  | 'mail'
  | 'phone'
  | 'trending-up'
  | 'image';

const STROKE = 2;

function Glyph({ name }: { name: IconName }) {
  switch (name) {
    case 'home':
      return (
        <>
          <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <Polyline points="9 22 9 12 15 12 15 22" />
        </>
      );
    case 'rooms':
      return (
        <>
          <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <Circle cx={9} cy={7} r={4} />
          <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      );
    case 'feed':
      return (
        <>
          <Path d="M4 11a9 9 0 0 1 9 9" />
          <Path d="M4 4a16 16 0 0 1 16 16" />
          <Circle cx={5} cy={19} r={1} />
        </>
      );
    case 'bell':
      return (
        <>
          <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </>
      );
    case 'user':
      return (
        <>
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <Circle cx={12} cy={7} r={4} />
        </>
      );
    case 'grid':
      return (
        <>
          <Rect x={3} y={3} width={7} height={7} rx={1} />
          <Rect x={14} y={3} width={7} height={7} rx={1} />
          <Rect x={14} y={14} width={7} height={7} rx={1} />
          <Rect x={3} y={14} width={7} height={7} rx={1} />
        </>
      );
    case 'chevron-left':
      return <Polyline points="15 18 9 12 15 6" />;
    case 'chevron-right':
      return <Polyline points="9 18 15 12 9 6" />;
    case 'plus':
      return (
        <>
          <Line x1={12} y1={5} x2={12} y2={19} />
          <Line x1={5} y1={12} x2={19} y2={12} />
        </>
      );
    case 'heart':
      return (
        <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      );
    case 'comment':
      return (
        <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      );
    case 'send':
      return (
        <>
          <Line x1={22} y1={2} x2={11} y2={13} />
          <Path d="M22 2 15 22 11 13 2 9 22 2z" />
        </>
      );
    case 'check':
      return <Polyline points="20 6 9 17 4 12" />;
    case 'x':
      return (
        <>
          <Line x1={18} y1={6} x2={6} y2={18} />
          <Line x1={6} y1={6} x2={18} y2={18} />
        </>
      );
    case 'search':
      return (
        <>
          <Circle cx={11} cy={11} r={8} />
          <Line x1={21} y1={21} x2={16.65} y2={16.65} />
        </>
      );
    case 'settings':
      return (
        <>
          <Circle cx={12} cy={12} r={3} />
          <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </>
      );
    case 'shield':
      return <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
    case 'flag':
      return (
        <>
          <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <Line x1={4} y1={22} x2={4} y2={15} />
        </>
      );
    case 'star':
      return (
        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
      );
    case 'calendar':
      return (
        <>
          <Rect x={3} y={4} width={18} height={18} rx={2} />
          <Line x1={16} y1={2} x2={16} y2={6} />
          <Line x1={8} y1={2} x2={8} y2={6} />
          <Line x1={3} y1={10} x2={21} y2={10} />
        </>
      );
    case 'eye':
      return (
        <>
          <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <Circle cx={12} cy={12} r={3} />
        </>
      );
    case 'log-out':
      return (
        <>
          <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <Polyline points="16 17 21 12 16 7" />
          <Line x1={21} y1={12} x2={9} y2={12} />
        </>
      );
    case 'sun':
      return (
        <>
          <Circle cx={12} cy={12} r={5} />
          <Line x1={12} y1={1} x2={12} y2={3} />
          <Line x1={12} y1={21} x2={12} y2={23} />
          <Line x1={4.22} y1={4.22} x2={5.64} y2={5.64} />
          <Line x1={18.36} y1={18.36} x2={19.78} y2={19.78} />
          <Line x1={1} y1={12} x2={3} y2={12} />
          <Line x1={21} y1={12} x2={23} y2={12} />
          <Line x1={4.22} y1={19.78} x2={5.64} y2={18.36} />
          <Line x1={18.36} y1={5.64} x2={19.78} y2={4.22} />
        </>
      );
    case 'moon':
      return <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />;
    case 'lock':
      return (
        <>
          <Rect x={3} y={11} width={18} height={11} rx={2} />
          <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </>
      );
    case 'mail':
      return (
        <>
          <Rect x={2} y={4} width={20} height={16} rx={2} />
          <Polyline points="22,6 12,13 2,6" />
        </>
      );
    case 'phone':
      return (
        <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      );
    case 'trending-up':
      return (
        <>
          <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <Polyline points="17 6 23 6 23 12" />
        </>
      );
    case 'image':
      return (
        <>
          <Rect x={3} y={3} width={18} height={18} rx={2} />
          <Circle cx={8.5} cy={8.5} r={1.5} />
          <Polyline points="21 15 16 10 5 21" />
        </>
      );
    default:
      return null;
  }
}

/** Small stroke-based icon set (feather style). RN-safe via react-native-svg. */
export function Icon({
  name,
  size = 24,
  color = '#111827',
  strokeWidth = STROKE,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Glyph name={name} />
    </Svg>
  );
}
