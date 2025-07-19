// Script de debug para testar a conexão com a API
// Execute no console do navegador: node debug_api.js

const API_URL = 'http://localhost:8000/api';

async function testAPI() {
    console.log('🔍 Testando conexão com a API...');
    
    try {
        // Teste 1: Stats (sem autenticação)
        console.log('1️⃣ Testando endpoint de stats...');
        const statsResponse = await fetch(`${API_URL}/auth/stats/`);
        
        if (!statsResponse.ok) {
            throw new Error(`Stats failed: ${statsResponse.status} ${statsResponse.statusText}`);
        }
        
        const statsData = await statsResponse.json();
        console.log('✅ Stats OK:', statsData);
        
        // Teste 2: Login
        console.log('2️⃣ Testando login...');
        const loginResponse = await fetch(`${API_URL}/auth/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'temtudonaweb.td@gmail.com',
                password: 'admin123'
            })
        });
        
        if (!loginResponse.ok) {
            const errorText = await loginResponse.text();
            throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText} - ${errorText}`);
        }
        
        const loginData = await loginResponse.json();
        console.log('✅ Login OK, token recebido');
        
        // Teste 3: Usuários (com autenticação)
        console.log('3️⃣ Testando endpoint de usuários...');
        const usersResponse = await fetch(`${API_URL}/admin/users/`, {
            headers: {
                'Authorization': `Bearer ${loginData.access}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!usersResponse.ok) {
            const errorText = await usersResponse.text();
            throw new Error(`Users failed: ${usersResponse.status} ${usersResponse.statusText} - ${errorText}`);
        }
        
        const usersData = await usersResponse.json();
        console.log(`✅ Users OK: ${usersData.length} usuários encontrados`);
        
        // Teste 4: Tenants
        console.log('4️⃣ Testando endpoint de tenants...');
        const tenantsResponse = await fetch(`${API_URL}/admin/tenants/`, {
            headers: {
                'Authorization': `Bearer ${loginData.access}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!tenantsResponse.ok) {
            const errorText = await tenantsResponse.text();
            throw new Error(`Tenants failed: ${tenantsResponse.status} ${tenantsResponse.statusText} - ${errorText}`);
        }
        
        const tenantsData = await tenantsResponse.json();
        console.log(`✅ Tenants OK: ${tenantsData.length} tenants encontrados`);
        
        console.log('🎉 Todos os testes passaram! A API está funcionando corretamente.');
        
        return {
            success: true,
            token: loginData.access,
            stats: statsData,
            usersCount: usersData.length,
            tenantsCount: tenantsData.length
        };
        
    } catch (error) {
        console.error('❌ Erro nos testes:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Para Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testAPI };
}

// Para browser
if (typeof window !== 'undefined') {
    window.testAPI = testAPI;
}

// Auto-executar se for chamado diretamente
if (typeof require !== 'undefined' && require.main === module) {
    testAPI().then(result => {
        console.log('Resultado final:', result);
        process.exit(result.success ? 0 : 1);
    });
}