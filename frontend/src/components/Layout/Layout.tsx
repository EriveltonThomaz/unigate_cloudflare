import React, { ReactNode } from 'react';
import { Box, Container, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import AdminHeader from '../admin/AdminHeader';
import { useResponsive } from '../../hooks/useResponsive';
import ThemeToggle from '../ui/ThemeToggle';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Box
        component="main"
        id="main-content"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: 0,
          ...(sidebarOpen && !isMobile && {
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: '240px',
          }),
        }}
      >
        <AdminHeader 
          title={title} 
          onMenuClick={toggleSidebar} 
          sidebarOpen={sidebarOpen}
        />
        
        <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
          {children}
        </Container>
        
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 2,
            mt: 'auto',
            backgroundColor: theme.palette.background.paper,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box component="span" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            © {new Date().getFullYear()} UniGate
          </Box>
          
          <ThemeToggle />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;