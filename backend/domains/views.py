from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Domain, DNSRecord
from .serializers import DomainSerializer, DNSRecordSerializer
from cloudflare_api.services import CloudflareService

class DomainViewSet(viewsets.ModelViewSet):
    queryset = Domain.objects.all()
    serializer_class = DomainSerializer

    def create(self, request, *args, **kwargs):
        print(f"Dados recebidos para Domain: {request.data}")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class DNSRecordViewSet(viewsets.ModelViewSet):
    queryset = DNSRecord.objects.all()
    serializer_class = DNSRecordSerializer

    def list(self, request, *args, **kwargs):
        # Pega o domain_id dos parâmetros da query
        domain_id = request.query_params.get('domain_id')
        if not domain_id:
            return Response("{'error': 'O domain_id é obrigatório'}", status=status.HTTP_400_BAD_REQUEST)

        # Tenta encontrar o domínio no banco de dados
        try:
            domain = Domain.objects.get(id=domain_id)
        except Domain.DoesNotExist:
            return Response("{'error': 'Domínio não encontrado'}", status=status.HTTP_404_NOT_FOUND)

        # Busca os registros DNS da Cloudflare
        service = CloudflareService(domain.tenant.cloudflare_api_key, domain.tenant.cloudflare_email)
        try:
            cf_records = service.get_dns_records(domain.cloudflare_zone_id)
        except Exception as e:
            return Response({'error': f"Erro ao buscar registros na Cloudflare: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Atualiza o banco de dados local com os registros da Cloudflare
        for record in cf_records:
            if record['type'] == 'CNAME':
                # Verifica se o CNAME já existe no sistema para evitar duplicatas
                if not DNSRecord.objects.filter(name=record['name'], type=record['type'], content=record['content']).exists():
                    # Cria um novo registro CNAME no sistema se não existir
                    DNSRecord.objects.create(domain=domain, type='CNAME', name=record['name'], content=record['content'], proxied=record['proxied'], created_by=request.user)
        
        # Retorna a lista de registros CNAME do sistema
        queryset = DNSRecord.objects.filter(domain=domain, type='CNAME')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        # Integração com a Cloudflare
        instance = serializer.instance
        domain = instance.domain
        if domain.cloudflare_zone_id:
            service = CloudflareService(domain.tenant.cloudflare_api_key, domain.tenant.cloudflare_email)
            record_data = {
                'name': instance.name,
                'type': instance.record_type,
                'content': instance.content,
                'ttl': instance.ttl,
                'proxied': instance.proxied,
            }
            if instance.record_type == 'MX':
                record_data['priority'] = instance.priority

            try:
                cf_record = service.create_dns_record(domain.cloudflare_zone_id, record_data)
                instance.cloudflare_record_id = cf_record['id']
                instance.save()
            except Exception as e:
                print(f"Erro ao criar registro DNS na Cloudflare: {e}")

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Integração com a Cloudflare
        domain = instance.domain
        if domain.cloudflare_zone_id and instance.cloudflare_record_id:
            service = CloudflareService(domain.tenant.cloudflare_api_key, domain.tenant.cloudflare_email)
            record_data = {
                'name': instance.name,
                'type': instance.record_type,
                'content': instance.content,
                'ttl': instance.ttl,
                'proxied': instance.proxied,
            }
            if instance.record_type == 'MX':
                record_data['priority'] = instance.priority

            try:
                service.update_dns_record(domain.cloudflare_zone_id, instance.cloudflare_record_id, record_data)
            except Exception as e:
                print(f"Erro ao atualizar registro DNS na Cloudflare: {e}")

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        domain = instance.domain

        # Integração com a Cloudflare
        if domain.cloudflare_zone_id and instance.cloudflare_record_id:
            service = CloudflareService(domain.tenant.cloudflare_api_key, domain.tenant.cloudflare_email)
            try:
                service.delete_dns_record(domain.cloudflare_zone_id, instance.cloudflare_record_id)
            except Exception as e:
                print(f"Erro ao deletar registro DNS na Cloudflare: {e}")

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
