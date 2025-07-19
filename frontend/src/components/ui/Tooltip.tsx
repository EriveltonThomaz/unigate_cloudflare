import React from 'react';
import { Tooltip as MuiTooltip, TooltipProps as MuiTooltipProps, styled } from '@mui/material';

interface TooltipProps extends Omit<MuiTooltipProps, 'children'> {
  children: React.ReactElement;
  interactive?: boolean;
  delay?: number;
}

const StyledTooltip = styled(({ className, ...props }: MuiTooltipProps) => (
  <MuiTooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: theme.palette.mode === 'dark' 
      ? theme.palette.grey[800] 
      : theme.palette.grey[700],
    color: theme.palette.common.white,
    fontSize: 12,
    padding: theme.spacing(1, 1.5),
    borderRadius: theme.shape.borderRadius,
    maxWidth: 300,
    wordBreak: 'break-word',
  },
  [`& .MuiTooltip-arrow`]: {
    color: theme.palette.mode === 'dark' 
      ? theme.palette.grey[800] 
      : theme.palette.grey[700],
  },
}));

const Tooltip: React.FC<TooltipProps> = ({
  children,
  title,
  interactive = false,
  delay = 500,
  ...props
}) => {
  return (
    <StyledTooltip
      title={title}
      arrow
      interactive={interactive}
      enterDelay={delay}
      leaveDelay={200}
      {...props}
    >
      {children}
    </StyledTooltip>
  );
};

export default Tooltip;