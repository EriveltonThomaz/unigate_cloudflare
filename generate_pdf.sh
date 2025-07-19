#!/bin/bash

# Script para gerar PDF do resumo das melhorias implementadas
# UNIATENDE TECHNOLOGY

echo "📄 Gerador de PDF - Resumo das Melhorias Implementadas"
echo "=================================================="

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 não está instalado!"
    echo "💡 Instale Python 3 primeiro"
    exit 1
fi

# Verificar se o arquivo HTML existe
if [ ! -f "resumo-melhorias.html" ]; then
    echo "❌ Arquivo resumo-melhorias.html não encontrado!"
    echo "💡 Certifique-se de que o arquivo HTML foi criado"
    exit 1
fi

# Instalar dependências se necessário
echo "🔧 Verificando dependências..."
if ! python3 -c "import weasyprint" 2>/dev/null; then
    echo "📦 Instalando dependências..."
    pip3 install -r requirements-pdf.txt
fi

# Gerar PDF
echo "🔄 Gerando PDF..."
python3 generate_pdf.py

# Verificar se o PDF foi criado
if [ -f "resumo-melhorias-implementadas.pdf" ]; then
    echo ""
    echo "✅ PDF gerado com sucesso!"
    echo "📁 Arquivo: resumo-melhorias-implementadas.pdf"
    echo "📏 Tamanho: A4"
    echo "🎨 Design: Moderno com cores da UNIATENDE TECHNOLOGY"
    echo ""
    echo "📋 Resumo do conteúdo:"
    echo "   • Página inicial atualizada"
    echo "   • Sistema de permissões DNS implementado"
    echo "   • Restrições de permissões por tipo de registro"
    echo "   • Dependências atualizadas"
    echo "   • Documentação completa"
    echo "   • Melhorias de UX/UI"
    echo "   • Arquitetura robusta"
    echo "   • Segurança implementada"
    echo "   • Integração Cloudflare"
    echo "   • Próximos passos recomendados"
else
    echo "❌ Erro ao gerar PDF!"
    exit 1
fi