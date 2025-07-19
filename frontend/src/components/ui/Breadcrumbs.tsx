import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import { useRouter } from 'next/router';
import NextLink from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHomeIcon?: boolean;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, showHomeIcon = true }) => {
  const router = useRouter();

  return (
    <Box sx={{ mb: 2, mt: 1 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {showHomeIcon && (
          <Link
            component={NextLink}
            href="/"
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
            color="inherit"
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Início
          </Link>
        )}
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return isLast ? (
            <Typography
              key={`breadcrumb-${index}`}
              color="text.primary"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {item.icon && <Box component="span" sx={{ mr: 0.5, display: 'flex' }}>{item.icon}</Box>}
              {item.label}
            </Typography>
          ) : (
            <Link
              component={NextLink}
              key={`breadcrumb-${index}`}
              color="inherit"
              href={item.href || '#'}
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {item.icon && <Box component="span" sx={{ mr: 0.5, display: 'flex' }}>{item.icon}</Box>}
              {item.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;