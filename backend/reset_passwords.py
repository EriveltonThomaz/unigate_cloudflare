#!/usr/bin/env python
"""
Script para redefinir senhas dos usuários do sistema UNIATENDE TECHNOLOGY
Uso: python reset_passwords.py
"""

import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User

def reset_all_passwords():
    """Redefine senhas para todos os usuários existentes"""
    
    # Definir senhas padrão para cada usuário
    user_passwords = {
        'temtudonaweb.td@gmail.com': 'admin123',
        'felipe@uniatende.com.br': 'felipe123',
        'pqdinformatica@gmail.com': 'pqd123',
        'w38unigate@gmail.com': 'w38123',
        'w25unigate@gmail.com': 'w25123',
        'drnocontrolecrm@gmail.com': 'drno123',
        'teste@exemplo.com': '123456'
    }
    
    print("🔐 Redefinindo senhas dos usuários...")
    print("-" * 50)
    
    for email, password in user_passwords.items():
        try:
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
            print(f"✅ {email} -> Senha: {password}")
        except User.DoesNotExist:
            print(f"❌ Usuário {email} não encontrado")
    
    print("-" * 50)
    print("✅ Processo concluído!")

def create_test_user():
    """Cria um usuário de teste se não existir"""
    
    email = 'admin@teste.com'
    password = 'admin123'
    
    try:
        user = User.objects.get(email=email)
        print(f"ℹ️  Usuário {email} já existe")
    except User.DoesNotExist:
        user = User(
            email=email,
            first_name='Admin',
            last_name='Teste',
            role='admin',
            username='admin_teste'
        )
        user.set_password(password)
        user.save()
        print(f"✅ Usuário criado: {email} -> Senha: {password}")

def list_all_users():
    """Lista todos os usuários do sistema"""
    
    print("\n👥 Usuários no sistema:")
    print("-" * 70)
    print(f"{'ID':<3} {'Email':<30} {'Role':<8} {'Ativo':<6} {'Nome'}")
    print("-" * 70)
    
    users = User.objects.all().order_by('id')
    for user in users:
        name = f"{user.first_name} {user.last_name}".strip()
        print(f"{user.id:<3} {user.email:<30} {user.role:<8} {'Sim' if user.is_active else 'Não':<6} {name}")
    
    print("-" * 70)
    print(f"Total: {users.count()} usuários")

def main():
    """Função principal"""
    
    print("🚀 UNIATENDE TECHNOLOGY - Gerenciador de Senhas")
    print("=" * 60)
    
    # Listar usuários atuais
    list_all_users()
    
    # Perguntar se deseja redefinir senhas
    response = input("\n❓ Deseja redefinir as senhas dos usuários? (s/N): ").lower()
    
    if response in ['s', 'sim', 'y', 'yes']:
        reset_all_passwords()
        
        # Criar usuário de teste
        print("\n🔧 Criando usuário de teste...")
        create_test_user()
        
        # Listar usuários novamente
        list_all_users()
        
        print("\n📋 Credenciais de Login:")
        print("-" * 40)
        print("Admin Principal:")
        print("  Email: temtudonaweb.td@gmail.com")
        print("  Senha: admin123")
        print("\nAdmin Teste:")
        print("  Email: admin@teste.com")
        print("  Senha: admin123")
        print("\nUsuário Teste:")
        print("  Email: teste@exemplo.com")
        print("  Senha: 123456")
        
    else:
        print("❌ Operação cancelada")

if __name__ == '__main__':
    main()