import { useMediaQuery, useTheme } from '@mui/material';

type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ResponsiveReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeScreen: boolean;
  below: (breakpoint: BreakpointKey) => boolean;
  above: (breakpoint: BreakpointKey) => boolean;
  between: (start: BreakpointKey, end: BreakpointKey) => boolean;
  width: number;
}

export function useResponsive(): ResponsiveReturn {
  const theme = useTheme();
  
  // Get current window width
  const width = typeof window !== 'undefined' ? window.innerWidth : 0;
  
  // Check for different device types
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  
  // Helper functions
  const below = (breakpoint: BreakpointKey) => useMediaQuery(theme.breakpoints.down(breakpoint));
  const above = (breakpoint: BreakpointKey) => useMediaQuery(theme.breakpoints.up(breakpoint));
  const between = (start: BreakpointKey, end: BreakpointKey) => 
    useMediaQuery(theme.breakpoints.between(start, end));
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    below,
    above,
    between,
    width
  };
}

export default useResponsive;