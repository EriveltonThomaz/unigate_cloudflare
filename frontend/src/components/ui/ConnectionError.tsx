import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ConnectionErrorProps {
  message?: string;
  onRetry?: () => void;
}

const ConnectionError: React.FC<ConnectionErrorProps> = ({ 
  message = 'Não foi possível conectar ao servidor', 
  onRetry 
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        maxWidth: 500,
        mx: 'auto',
        my: 4,
        borderRadius: 2
      }}
    >
      <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
      
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Erro de Conexão
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
        {message}
      </Typography>
      
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<RefreshIcon />}
          onClick={handleRetry}
        >
          Tentar novamente
        </Button>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 4, fontSize: '0.8rem' }}>
        Se o problema persistir, entre em contato com o suporte técnico.
      </Typography>
    </Paper>
  );
};

export default ConnectionError;