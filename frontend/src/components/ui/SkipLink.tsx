import React from 'react';
import { styled } from '@mui/material/styles';

const StyledSkipLink = styled('a')(({ theme }) => ({
  position: 'absolute',
  top: -70,
  left: 0,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(1, 2),
  zIndex: theme.zIndex.tooltip + 1,
  textDecoration: 'none',
  fontWeight: 500,
  transition: 'top 0.2s ease-in-out',
  '&:focus': {
    top: 0,
    outline: `3px solid ${theme.palette.secondary.main}`,
  },
}));

interface SkipLinkProps {
  targetId: string;
  label?: string;
}

const SkipLink: React.FC<SkipLinkProps> = ({ 
  targetId, 
  label = 'Pular para o conteúdo principal' 
}) => {
  return (
    <StyledSkipLink href={`#${targetId}`}>
      {label}
    </StyledSkipLink>
  );
};

export default SkipLink;