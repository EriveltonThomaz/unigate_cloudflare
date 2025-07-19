import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Paper } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import api from '../../services/api';

interface RetryConnectionProps {
  onSuccess?: () => void;
  retryInterval?: number; // em milissegundos
  maxRetries?: number;
  message?: string;
}

const RetryConnection: React.FC<RetryConnectionProps> = ({
  onSuccess,
  retryInterval = 5000,
  maxRetries = 5,
  message = 'Não foi possível conectar ao servidor',
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const checkConnection = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    
    try {
      // Tenta fazer uma requisição simples para verificar a conexão
      await api.get('/health-check/', { timeout: 3000 });
      
      // Se chegou aqui, a conexão foi restabelecida
      if (onSuccess) {
        onSuccess();
      } else {
        // Recarrega a página se não houver callback de sucesso
        window.location.reload();
      }
    } catch (error) {
      setRetryCount((prev) => prev + 1);
      setIsChecking(false);
      
      // Se não atingiu o número máximo de tentativas, agenda a próxima verificação
      if (retryCount < maxRetries) {
        startCountdown();
      }
    }
  };

  const startCountdown = () => {
    setTimeLeft(retryInterval / 1000);
  };

  const handleManualRetry = () => {
    setRetryCount(0);
    checkConnection();
  };

  useEffect(() => {
    // Inicia a primeira verificação
    checkConnection();
    
    // Cleanup
    return () => {
      setTimeLeft(0);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Quando o contador chegar a zero, tenta novamente
          checkConnection();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        maxWidth: 500, 
        mx: 'auto', 
        my: 4, 
        textAlign: 'center',
        borderRadius: 2
      }}
    >
      <WifiOffIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
      
      <Typography variant="h5" gutterBottom>
        Problema de Conexão
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        {message}
      </Typography>
      
      {retryCount >= maxRetries ? (
        <Box>
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            Não foi possível estabelecer conexão após várias tentativas.
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleManualRetry}
            disabled={isChecking}
          >
            {isChecking ? 'Verificando...' : 'Tentar novamente'}
          </Button>
        </Box>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            {isChecking ? (
              <CircularProgress size={20} sx={{ mr: 1 }} />
            ) : (
              timeLeft > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Tentando novamente em {timeLeft} segundos...
                </Typography>
              )
            )}
          </Box>
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleManualRetry}
            disabled={isChecking}
          >
            Tentar agora
          </Button>
        </Box>
      )}
      
      <Typography variant="caption" display="block" sx={{ mt: 3, color: 'text.secondary' }}>
        Tentativa {retryCount + 1} de {maxRetries + 1}
      </Typography>
    </Paper>
  );
};

export default RetryConnection;