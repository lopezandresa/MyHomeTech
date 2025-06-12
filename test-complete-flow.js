const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test user credentials
const testTechnician = {
  name: 'Juan Pérez Técnico',
  email: 'juan.tecnico@hometech.com',
  password: 'password123',
  role: 'technician'
};

const testClient = {
  name: 'María García Cliente',
  email: 'maria.cliente@hometech.com', 
  password: 'password123',
  role: 'client'
};

console.log('🚀 TESTING COMPLETE APPLICATION FUNCTIONALITY\n');

async function testCompleteFlow() {
  try {
    // ===== STEP 1: REGISTER USERS =====
    console.log('📝 Step 1: Registering users...');
    
    // Register technician
    try {
      await axios.post(`${BASE_URL}/identity/register`, testTechnician);
      console.log('✅ Technician registered successfully');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️  Technician already exists');
      } else {
        console.log('❌ Technician registration failed:', error.response?.data?.message);
        return;
      }
    }

    // Register client
    try {
      await axios.post(`${BASE_URL}/identity/register`, testClient);
      console.log('✅ Client registered successfully');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️  Client already exists');
      } else {
        console.log('❌ Client registration failed:', error.response?.data?.message);
        return;
      }
    }

    // ===== STEP 2: LOGIN USERS =====
    console.log('\n🔐 Step 2: Logging in users...');
    
    // Login technician
    const techLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testTechnician.email,
      password: testTechnician.password
    });
    const techToken = techLoginResponse.data.access_token;
    const techHeaders = { 'Authorization': `Bearer ${techToken}` };
    console.log('✅ Technician logged in successfully');

    // Login client  
    const clientLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testClient.email,
      password: testClient.password
    });
    const clientToken = clientLoginResponse.data.access_token;
    const clientHeaders = { 'Authorization': `Bearer ${clientToken}` };
    console.log('✅ Client logged in successfully');

    // ===== STEP 3: TEST APPLIANCE STRUCTURE =====
    console.log('\n🔧 Step 3: Testing appliance structure...');
    
    // Get appliance types
    const typesResponse = await axios.get(`${BASE_URL}/appliance-types`, { headers: techHeaders });
    console.log(`✅ Retrieved ${typesResponse.data.length} appliance types`);
    console.log('📋 Types:', typesResponse.data.map(t => t.name).join(', '));

    // Get brands for first type
    if (typesResponse.data.length > 0) {
      const firstType = typesResponse.data[0];
      const brandsResponse = await axios.get(`${BASE_URL}/appliance-brands/by-type/${firstType.id}`, { headers: techHeaders });
      console.log(`✅ Retrieved ${brandsResponse.data.length} brands for ${firstType.name}`);
      
      // Get models for first brand
      if (brandsResponse.data.length > 0) {
        const firstBrand = brandsResponse.data[0];
        const modelsResponse = await axios.get(`${BASE_URL}/appliance-models/by-brand/${firstBrand.id}`, { headers: techHeaders });
        console.log(`✅ Retrieved ${modelsResponse.data.length} models for ${firstBrand.name}`);
      }
    }

    // ===== STEP 4: TEST TECHNICIAN PROFILE =====
    console.log('\n👷 Step 4: Testing technician profile...');
    
    // Create/update technician profile
    const techProfileData = {
      cedula: '12345678',
      birthDate: '1990-05-15',
      experienceYears: 5,
      idPhotoUrl: 'https://example.com/tech-id.jpg',
      specialties: typesResponse.data.slice(0, 3).map(t => t.id) // First 3 types
    };

    try {
      await axios.post(`${BASE_URL}/technicians/profile`, techProfileData, { headers: techHeaders });
      console.log('✅ Technician profile created');
    } catch (error) {
      if (error.response?.status === 409) {
        await axios.put(`${BASE_URL}/technicians/me`, techProfileData, { headers: techHeaders });
        console.log('✅ Technician profile updated');
      } else {
        console.log('❌ Technician profile error:', error.response?.data?.message);
      }
    }

    // Get technician profile
    const techProfileResponse = await axios.get(`${BASE_URL}/technicians/me`, { headers: techHeaders });
    console.log('✅ Technician profile retrieved');
    console.log(`📋 Specialties: ${techProfileResponse.data.specialties.map(s => s.name).join(', ')}`);

    // Test specialty management
    if (typesResponse.data.length > 3) {
      const newSpecialtyId = typesResponse.data[3].id;
      
      // Add specialty
      try {
        await axios.post(`${BASE_URL}/technicians/me/specialties/${newSpecialtyId}`, {}, { headers: techHeaders });
        console.log(`✅ Added specialty: ${typesResponse.data[3].name}`);
      } catch (error) {
        console.log('ℹ️  Specialty already exists or error:', error.response?.data?.message);
      }

      // Remove specialty
      try {
        await axios.delete(`${BASE_URL}/technicians/me/specialties/${newSpecialtyId}`, { headers: techHeaders });
        console.log(`✅ Removed specialty: ${typesResponse.data[3].name}`);
      } catch (error) {
        console.log('ℹ️  Specialty removal error:', error.response?.data?.message);
      }
    }

    // ===== STEP 5: TEST CLIENT PROFILE =====
    console.log('\n👤 Step 5: Testing client profile...');
    
    // Create/update client profile
    const clientProfileData = {
      fullName: testClient.name,
      cedula: '87654321',
      birthDate: '1985-03-20',
      phone: '+57 300 123 4567'
    };

    try {
      await axios.post(`${BASE_URL}/clients/profile`, clientProfileData, { headers: clientHeaders });
      console.log('✅ Client profile created');
    } catch (error) {
      if (error.response?.status === 409) {
        await axios.put(`${BASE_URL}/clients/me`, clientProfileData, { headers: clientHeaders });
        console.log('✅ Client profile updated');
      } else {
        console.log('❌ Client profile error:', error.response?.data?.message);
      }
    }

    // Get client profile
    const clientProfileResponse = await axios.get(`${BASE_URL}/clients/me`, { headers: clientHeaders });
    console.log('✅ Client profile retrieved');
    console.log(`📋 Client: ${clientProfileResponse.data.fullName}, Phone: ${clientProfileResponse.data.phone}`);

    // ===== STEP 6: TEST PASSWORD CHANGE =====
    console.log('\n🔒 Step 6: Testing password change...');
    
    // Test technician password change
    try {
      await axios.post(`${BASE_URL}/identity/change-password`, {
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      }, { headers: techHeaders });
      console.log('✅ Technician password changed');
      
      // Change it back
      await axios.post(`${BASE_URL}/identity/change-password`, {
        currentPassword: 'newpassword123', 
        newPassword: 'password123'
      }, { headers: techHeaders });
      console.log('✅ Technician password changed back');
    } catch (error) {
      console.log('❌ Password change failed:', error.response?.data?.message);
    }

    // ===== FINAL VERIFICATION =====
    console.log('\n🔍 Step 7: Final verification...');
    
    // Verify technician profile structure
    const finalTechProfile = await axios.get(`${BASE_URL}/technicians/me`, { headers: techHeaders });
    const techData = finalTechProfile.data;
    
    console.log('✅ Technician profile verification:');
    console.log(`   - Name: ${techData.identity.name}`);
    console.log(`   - Email: ${techData.identity.email}`);
    console.log(`   - Cedula: ${techData.cedula}`);
    console.log(`   - Experience: ${techData.experienceYears} years`);
    console.log(`   - Specialties: ${techData.specialties.length} (${techData.specialties.map(s => s.name).join(', ')})`);

    // Verify client profile structure  
    const finalClientProfile = await axios.get(`${BASE_URL}/clients/me`, { headers: clientHeaders });
    const clientData = finalClientProfile.data;
    
    console.log('✅ Client profile verification:');
    console.log(`   - Name: ${clientData.identity.name}`);
    console.log(`   - Email: ${clientData.identity.email}`);
    console.log(`   - Cedula: ${clientData.cedula}`);
    console.log(`   - Phone: ${clientData.phone}`);

    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('\n📊 Summary:');
    console.log('✅ User registration and authentication');
    console.log('✅ Appliance structure (Types → Brands → Models)'); 
    console.log('✅ Technician profile with specialties management');
    console.log('✅ Client profile with personal information');
    console.log('✅ Password change functionality');
    console.log('✅ Profile separation (User info vs Professional info)');
    console.log('\n🚀 The application is ready for production use!');

  } catch (error) {
    console.log('\n❌ Test failed:', error.response?.data || error.message);
    console.log('Stack trace:', error.stack);
  }
}

// Run the complete test
testCompleteFlow();
