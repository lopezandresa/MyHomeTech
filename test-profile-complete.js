// Test script for profile endpoints
const baseURL = 'http://localhost:3000/api';

// Test data
const testUser = {
  email: 'technician@test.com',
  password: 'password123',
  name: 'Test Technician',
  role: 'technician'
};

const testClient = {
  email: 'client@test.com',
  password: 'password123',
  name: 'Test Client',
  role: 'client'
};

async function makeRequest(endpoint, method = 'GET', data = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${baseURL}${endpoint}`, options);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${response.status}: ${error}`);
  }
  
  return response.json();
}

async function testProfileWorkflow() {
  console.log('🚀 Testing Profile Configuration Workflow\n');

  try {
    // Step 1: Register a technician
    console.log('1. Registering technician...');
    const techUser = await makeRequest('/identity/register', 'POST', testUser);
    console.log('✅ Technician registered:', techUser.email);

    // Step 2: Login technician
    console.log('\n2. Logging in technician...');
    const techLogin = await makeRequest('/auth/login', 'POST', {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Technician logged in, token received');

    // Step 3: Get user profile
    console.log('\n3. Getting user identity...');
    const techIdentity = await makeRequest('/identity/me', 'GET', null, techLogin.access_token);
    console.log('✅ User identity retrieved:', techIdentity.name);

    // Step 4: Test get technician profile (should fail - not created yet)
    console.log('\n4. Attempting to get technician profile (should fail)...');
    try {
      await makeRequest('/technicians/me', 'GET', null, techLogin.access_token);
      console.log('❌ Expected error but got success');
    } catch (error) {
      console.log('✅ Expected error:', error.message);
    }

    // Step 5: Get appliances list
    console.log('\n5. Getting appliances list...');
    const appliances = await makeRequest('/appliances', 'GET', null, techLogin.access_token);
    console.log('✅ Appliances retrieved:', appliances.length, 'items');

    // Step 6: Create technician profile
    console.log('\n6. Creating technician profile...');
    const techProfile = {
      identityId: techIdentity.id,
      cedula: '123456789',
      birthDate: '1990-01-01',
      experienceYears: 5,
      idPhotoUrl: 'https://example.com/photo.jpg',
      appliances: appliances.slice(0, 2).map(a => a.id) // Select first 2 appliances
    };
    
    const createdProfile = await makeRequest('/technicians/profile', 'POST', techProfile, techLogin.access_token);
    console.log('✅ Technician profile created:', createdProfile.cedula);

    // Step 7: Get technician profile (should work now)
    console.log('\n7. Getting technician profile...');
    const retrievedProfile = await makeRequest('/technicians/me', 'GET', null, techLogin.access_token);
    console.log('✅ Technician profile retrieved:', retrievedProfile.appliances.length, 'specialties');

    // Step 8: Update technician profile
    console.log('\n8. Updating technician profile...');
    const updateData = {
      experienceYears: 7,
      appliances: appliances.slice(0, 3).map(a => a.id) // Add one more specialty
    };
    
    const updatedProfile = await makeRequest('/technicians/me', 'PUT', updateData, techLogin.access_token);
    console.log('✅ Technician profile updated, experience:', updatedProfile.experienceYears, 'years');

    // Step 9: Test password change
    console.log('\n9. Testing password change...');
    const passwordChange = await makeRequest('/identity/change-password', 'POST', {
      currentPassword: testUser.password,
      newPassword: 'newpassword123'
    }, techLogin.access_token);
    console.log('✅ Password changed successfully:', passwordChange.message);

    // Step 10: Test client workflow
    console.log('\n10. Testing client profile workflow...');
    
    // Register client
    const clientUser = await makeRequest('/identity/register', 'POST', testClient);
    console.log('✅ Client registered:', clientUser.email);

    // Login client
    const clientLogin = await makeRequest('/auth/login', 'POST', {
      email: testClient.email,
      password: testClient.password
    });
    console.log('✅ Client logged in');

    // Get client identity
    const clientIdentity = await makeRequest('/identity/me', 'GET', null, clientLogin.access_token);
    console.log('✅ Client identity retrieved:', clientIdentity.name);

    // Create client profile
    const clientProfile = {
      identityId: clientIdentity.id,
      fullName: 'Test Client Full Name',
      cedula: '987654321',
      birthDate: '1985-06-15',
      phone: '+57 300 123 4567'
    };
    
    const createdClientProfile = await makeRequest('/clients/profile', 'POST', clientProfile, clientLogin.access_token);
    console.log('✅ Client profile created:', createdClientProfile.fullName);

    // Update client profile
    const clientUpdateData = {
      phone: '+57 300 999 8888'
    };
    
    const updatedClientProfile = await makeRequest('/clients/me', 'PUT', clientUpdateData, clientLogin.access_token);
    console.log('✅ Client profile updated, phone:', updatedClientProfile.phone);

    console.log('\n🎉 All profile tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testProfileWorkflow();
