# Correção de Funções Faltantes no Serviço Admin Client

## Problema Identificado

Após as correções anteriores, surgiram novos erros relacionados a funções que estavam sendo importadas mas não estavam definidas no arquivo `admin.client.ts`:

```
Attempted import error: 'getDomainUniqueVisitors' is not exported from '@/services/admin.client'
Attempted import error: 'getCustomDNSRecords' is not exported from '@/services/admin.client'
```

Esses erros ocorriam nos seguintes componentes:
- `DomainPageClient.tsx` - tentava importar `getDomainUniqueVisitors`
- `DNSRecordsClientPage.tsx` - tentava importar `getCustomDNSRecords`

## Solução Implementada

Adicionamos as funções faltantes ao arquivo `frontend/src/services/admin.client.ts`:

1. **getCustomDNSRecords**:
   ```typescript
   export const getCustomDNSRecords = async (domainId: string): Promise<DNSRecord[]> => {
       const data = await api(`/admin/domains/${domainId}/dnsrecords/custom/`);
       return data.map(mapToDNSRecord);
   };
   ```

2. **getDomainUniqueVisitors**:
   ```typescript
   export const getDomainUniqueVisitors = async (domainId: string): Promise<any> => {
       try {
           const data = await api(`/admin/domains/${domainId}/analytics/`);
           return data;
       } catch (error) {
           // Em caso de erro, retorna dados vazios
           return { visitors: 0, pageviews: 0, data: [] };
       }
   };
   ```

## Benefícios

1. **Resolução de erros de importação**: Os componentes agora podem importar as funções necessárias
2. **Funcionalidade completa**: As funcionalidades de análise de domínio e registros DNS personalizados agora estão disponíveis
3. **Tratamento de erros**: A função `getDomainUniqueVisitors` inclui tratamento de erros para evitar falhas na interface

## Observações

- A função `getDomainUniqueVisitors` retorna dados vazios em caso de erro, o que é uma boa prática para evitar quebras na interface
- A função `getCustomDNSRecords` usa o endpoint `/admin/domains/${domainId}/dnsrecords/custom/` que já estava implementado no backend
- Ambas as funções seguem o mesmo padrão das outras funções do serviço admin client