// Script de prueba para los endpoints de perfil
const API_BASE = 'http://localhost:3000/api';

// Función para hacer peticiones HTTP
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { error: error.message };
    }
}

// Probar registro de un cliente
async function testClientRegistration() {
    console.log('\n🧪 Probando registro de cliente...');
      const userData = {
        name: 'Test Client',
        email: 'client@test.com',
        password: 'password123',
        role: 'client'
    };
    
    const result = await makeRequest(`${API_BASE}/identity/register`, {
        method: 'POST',
        body: JSON.stringify(userData)
    });
    
    console.log('Resultado registro cliente:', result);
    return result;
}

// Probar registro de un técnico
async function testTechnicianRegistration() {
    console.log('\n🧪 Probando registro de técnico...');
      const userData = {
        name: 'Test Technician',
        email: 'tech@test.com',
        password: 'password123',
        role: 'technician'
    };
    
    const result = await makeRequest(`${API_BASE}/identity/register`, {
        method: 'POST',
        body: JSON.stringify(userData)
    });
    
    console.log('Resultado registro técnico:', result);
    return result;
}

// Probar login
async function testLogin(email, password) {
    console.log(`\n🔐 Probando login para ${email}...`);
    
    const result = await makeRequest(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    console.log('Resultado login:', result);
    return result;
}

// Probar endpoint de perfil de cliente
async function testClientProfile(token) {
    console.log('\n👤 Probando endpoint de perfil de cliente...');
    
    const result = await makeRequest(`${API_BASE}/clients/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    console.log('Resultado perfil cliente:', result);
    return result;
}

// Probar endpoint de perfil de técnico
async function testTechnicianProfile(token) {
    console.log('\n🔧 Probando endpoint de perfil de técnico...');
    
    const result = await makeRequest(`${API_BASE}/technicians/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    console.log('Resultado perfil técnico:', result);
    return result;
}

// Función principal
async function runTests() {
    console.log('🚀 Iniciando pruebas de endpoints de perfil...');
    
    // 1. Registrar usuarios
    const clientReg = await testClientRegistration();
    const techReg = await testTechnicianRegistration();
    
    // 2. Hacer login
    if (clientReg.status === 201) {
        const clientLogin = await testLogin('client@test.com', 'password123');
        if (clientLogin.data?.access_token) {
            await testClientProfile(clientLogin.data.access_token);
        }
    }
    
    if (techReg.status === 201) {
        const techLogin = await testLogin('tech@test.com', 'password123');
        if (techLogin.data?.access_token) {
            await testTechnicianProfile(techLogin.data.access_token);
        }
    }
    
    console.log('\n✅ Pruebas completadas!');
}

// Ejecutar si es llamado directamente
if (typeof window === 'undefined') {
    runTests().catch(console.error);
}
