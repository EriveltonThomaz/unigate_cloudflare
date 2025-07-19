import axios, { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
  detail?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    
    // Verifica se é um erro de conexão
    if (!axiosError.response) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
    }
    
    const status = axiosError.response.status;
    const data = axiosError.response.data;
    
    // Erros comuns
    switch (status) {
      case 400:
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
          return `Dados inválidos: ${errorMessages}`;
        }
        return data.message || data.detail || data.error || 'Requisição inválida';
        
      case 401:
        return 'Não autorizado. Por favor, faça login novamente.';
        
      case 403:
        return 'Você não tem permissão para acessar este recurso.';
        
      case 404:
        return 'O recurso solicitado não foi encontrado.';
        
      case 422:
        return 'Não foi possível processar os dados enviados.';
        
      case 500:
        return 'Erro interno do servidor. Por favor, tente novamente mais tarde.';
        
      default:
        return data.message || data.detail || data.error || `Erro ${status}: Ocorreu um erro inesperado.`;
    }
  }
  
  // Para erros não-Axios
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Ocorreu um erro inesperado.';
}

export function isNetworkError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return !error.response;
  }
  return false;
}

export function isAuthError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 401;
  }
  return false;
}

export function handleApiError(error: unknown, callback?: (message: string) => void): string {
  const message = getErrorMessage(error);
  
  if (callback) {
    callback(message);
  }
  
  return message;
}