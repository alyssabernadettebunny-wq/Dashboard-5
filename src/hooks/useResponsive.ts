import { useWindowDimensions } from 'react-native';

/** Below this width, Cherry Brain keeps its mobile layout and behavior untouched. */
export const DESKTOP_BREAKPOINT = 900;

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  return { width, height, isDesktop: width >= DESKTOP_BREAKPOINT };
}
