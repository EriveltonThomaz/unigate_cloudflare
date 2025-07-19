from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db import connection

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Endpoint para verificar a saúde da API.
    Verifica a conexão com o banco de dados e retorna status 200 se tudo estiver OK.
    """
    try:
        # Verifica a conexão com o banco de dados
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        
        return Response(
            {
                "status": "ok",
                "message": "API is running and database connection is established"
            },
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {
                "status": "error",
                "message": f"Health check failed: {str(e)}"
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )