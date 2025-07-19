#!/usr/bin/env python3
"""
Script para gerar PDF do resumo das melhorias implementadas
Requer: pip install weasyprint
"""

import os
import sys
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

def generate_pdf():
    """Gera o PDF a partir do arquivo HTML"""
    
    # Verificar se o arquivo HTML existe
    html_file = 'resumo-melhorias.html'
    if not os.path.exists(html_file):
        print(f"❌ Arquivo {html_file} não encontrado!")
        return False
    
    try:
        # Configurar fontes
        font_config = FontConfiguration()
        
        # Ler o arquivo HTML
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Criar objeto HTML
        html_doc = HTML(string=html_content)
        
        # Gerar PDF
        print("🔄 Gerando PDF...")
        html_doc.write_pdf(
            'resumo-melhorias-implementadas.pdf',
            font_config=font_config
        )
        
        print("✅ PDF gerado com sucesso: resumo-melhorias-implementadas.pdf")
        return True
        
    except ImportError:
        print("❌ Erro: weasyprint não está instalado!")
        print("💡 Instale com: pip install weasyprint")
        return False
        
    except Exception as e:
        print(f"❌ Erro ao gerar PDF: {e}")
        return False

def check_dependencies():
    """Verifica se as dependências estão instaladas"""
    try:
        import weasyprint
        return True
    except ImportError:
        return False

def main():
    """Função principal"""
    print("📄 Gerador de PDF - Resumo das Melhorias Implementadas")
    print("=" * 60)
    
    # Verificar dependências
    if not check_dependencies():
        print("❌ Dependência weasyprint não encontrada!")
        print("💡 Instale com: pip install weasyprint")
        print("💡 Ou use: pip install -r requirements.txt")
        return
    
    # Gerar PDF
    if generate_pdf():
        print("\n🎉 PDF criado com sucesso!")
        print("📁 Arquivo: resumo-melhorias-implementadas.pdf")
        print("📏 Tamanho: A4, Orientação: Retrato")
        print("🎨 Design: Moderno com cores da marca")
    else:
        print("\n❌ Falha ao gerar PDF!")
        sys.exit(1)

if __name__ == "__main__":
    main() 