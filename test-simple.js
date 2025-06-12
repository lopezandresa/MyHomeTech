const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

console.log('Testing backend endpoints...');

async function testBasicEndpoint() {
  try {
    // Test a simple registration first
    const registerData = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'technician'
    };

    console.log('Testing registration...');
    const response = await axios.post(`${BASE_URL}/identity/register`, registerData);
    console.log('Registration response:', response.status);
  } catch (error) {
    console.log('Registration error:', error.response?.status, error.response?.data);
  }

  try {
    // Test login
    const loginData = {
      email: 'testuser@example.com',
      password: 'password123'
    };

    console.log('Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log('Login successful, token received');
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // Test appliance types
    console.log('Testing appliance types...');
    const typesResponse = await axios.get(`${BASE_URL}/appliance-types`, { headers });
    console.log('Appliance types count:', typesResponse.data.length);
    
    if (typesResponse.data.length > 0) {
      console.log('First appliance type:', typesResponse.data[0].name);
    }

  } catch (error) {
    console.log('Login/API error:', error.response?.status, error.response?.data);
  }
}

testBasicEndpoint();
