from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from tenants.models import Tenant

User = get_user_model()

class UserIsManagerView(APIView):
    """
    Verifica se um usuário é gerente de algum tenant.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            # Verificar se o usuário existe
            user = User.objects.get(id=user_id)
            
            # Verificar se o usuário é gerente de algum tenant
            is_manager = user.managed_tenants.exists()
            
            return Response({
                'is_manager': is_manager,
                'user_id': user_id,
                'managed_tenants_count': user.managed_tenants.count() if is_manager else 0
            })
        except User.DoesNotExist:
            return Response({'error': 'Usuário não encontrado'}, status=404)