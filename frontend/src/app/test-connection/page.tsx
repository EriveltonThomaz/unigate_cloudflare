import TestConnection from '@/components/TestConnection';

export default function TestConnectionPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Teste de Conexão com a API</h1>
      <TestConnection />
    </div>
  );
}