/**
 * Utilitários para manipulação de registros DNS
 */

/**
 * Extrai o subdomínio de um nome de registro CNAME
 * 
 * Exemplo:
 * - Nome completo: modelo.crm.acessodrnocontrole.com.br
 * - Domínio base: acessodrnocontrole.com.br
 * - Resultado: modelo.crm
 * 
 * @param fullName Nome completo do registro
 * @param domainName Nome do domínio base
 * @returns O subdomínio extraído ou o nome original se não for possível extrair
 */
export const extractSubdomain = (fullName: string, domainName: string): string => {
  if (!fullName || !domainName) return fullName;
  
  // Garantir que o domainName não tenha pontos extras no final
  const cleanDomainName = domainName.replace(/\.+$/, '');
  
  // Se o nome completo terminar com o domínio base
  if (fullName.endsWith(cleanDomainName)) {
    // Remover o domínio base e o ponto final
    const subdomain = fullName.slice(0, -cleanDomainName.length - 1);
    return subdomain || fullName;
  }
  
  return fullName;
};

/**
 * Formata um registro DNS para exibição
 * 
 * @param record Registro DNS
 * @param domainName Nome do domínio base
 * @returns Registro formatado
 */
export const formatDNSRecord = (record: any, domainName: string): any => {
  if (!record) return record;
  
  // Clonar o registro para não modificar o original
  const formattedRecord = { ...record };
  
  // Se for um registro CNAME, extrair o subdomínio
  if (record.recordType === 'CNAME' || record.record_type === 'CNAME') {
    formattedRecord.name = extractSubdomain(record.name, domainName);
  }
  
  return formattedRecord;
};

/**
 * Formata uma lista de registros DNS para exibição
 * 
 * @param records Lista de registros DNS
 * @param domainName Nome do domínio base
 * @returns Lista de registros formatados
 */
export const formatDNSRecords = (records: any[], domainName: string): any[] => {
  if (!records || !Array.isArray(records)) return records;
  
  return records.map(record => formatDNSRecord(record, domainName));
};