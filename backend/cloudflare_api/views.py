from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .services import CloudflareService, CloudflareAPIError

class ValidateCloudflareEmailView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        email = request.data.get('email')
        api_key = request.data.get('api_key')
        if not email or not api_key:
            return Response({'valid': False, 'error': 'Email e API Key são obrigatórios.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            # Tenta buscar zonas para validar credenciais
            service = CloudflareService(api_key, email)
            service.get_zones()
            return Response({'valid': True})
        except CloudflareAPIError as e:
            return Response({'valid': False, 'error': str(e)}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'valid': False, 'error': 'Erro inesperado: ' + str(e)}, status=status.HTTP_200_OK) 