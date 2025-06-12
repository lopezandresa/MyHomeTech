const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test endpoints
async function testEndpoints() {
  let authToken = null;

  console.log('🚀 Testing Backend Endpoints...\n');

  try {
    // 1. Test user registration
    console.log('1. Testing User Registration...');
    const registerData = {
      name: 'Test Technician',
      email: 'test.technician@example.com',
      password: 'password123',
      role: 'technician'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/identity/register`, registerData);
      console.log('✅ Registration successful:', registerResponse.data);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('⚠️  User already exists, continuing with login...');
      } else {
        console.log('❌ Registration failed:', error.response?.data || error.message);
        return;
      }
    }

    // 2. Test user login
    console.log('\n2. Testing User Login...');
    const loginData = {
      email: 'test.technician@example.com',
      password: 'password123'
    };

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log('✅ Login successful');
    authToken = loginResponse.data.access_token;

    const authHeaders = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    // 3. Test getting appliance types
    console.log('\n3. Testing Appliance Types...');
    const typesResponse = await axios.get(`${BASE_URL}/appliance-types`, { headers: authHeaders });
    console.log('✅ Appliance types retrieved:', typesResponse.data.length, 'types');
    console.log('📋 Types:', typesResponse.data.map(t => t.name).join(', '));

    // 4. Test getting appliance brands for a type
    if (typesResponse.data.length > 0) {
      console.log('\n4. Testing Appliance Brands...');
      const firstTypeId = typesResponse.data[0].id;
      const brandsResponse = await axios.get(`${BASE_URL}/appliance-brands/by-type/${firstTypeId}`, { headers: authHeaders });
      console.log(`✅ Brands for ${typesResponse.data[0].name}:`, brandsResponse.data.length, 'brands');
      console.log('📋 Brands:', brandsResponse.data.map(b => b.name).join(', '));

      // 5. Test getting appliance models for a brand
      if (brandsResponse.data.length > 0) {
        console.log('\n5. Testing Appliance Models...');
        const firstBrandId = brandsResponse.data[0].id;
        const modelsResponse = await axios.get(`${BASE_URL}/appliance-models/by-brand/${firstBrandId}`, { headers: authHeaders });
        console.log(`✅ Models for ${brandsResponse.data[0].name}:`, modelsResponse.data.length, 'models');
        if (modelsResponse.data.length > 0) {
          console.log('📋 Models:', modelsResponse.data.map(m => m.name).join(', '));
        }
      }
    }

    // 6. Test technician profile creation
    console.log('\n6. Testing Technician Profile Creation...');
    const profileData = {
      cedula: '123456789',
      birthDate: '1990-01-01',
      experienceYears: 5,
      idPhotoUrl: 'https://example.com/photo.jpg',
      specialties: [typesResponse.data[0]?.id, typesResponse.data[1]?.id].filter(Boolean)
    };

    try {
      const profileResponse = await axios.post(`${BASE_URL}/technicians/profile`, profileData, { headers: authHeaders });
      console.log('✅ Technician profile created successfully');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('⚠️  Profile already exists, testing update...');
        
        // Test profile update
        const updateResponse = await axios.put(`${BASE_URL}/technicians/me`, profileData, { headers: authHeaders });
        console.log('✅ Technician profile updated successfully');
      } else {
        console.log('❌ Profile creation failed:', error.response?.data || error.message);
      }
    }

    // 7. Test getting technician profile
    console.log('\n7. Testing Get Technician Profile...');
    const getProfileResponse = await axios.get(`${BASE_URL}/technicians/me`, { headers: authHeaders });
    console.log('✅ Technician profile retrieved successfully');
    console.log('📋 Profile specialties:', getProfileResponse.data.specialties.map(s => s.name).join(', '));

    // 8. Test adding a specialty
    if (typesResponse.data.length > 2) {
      console.log('\n8. Testing Add Specialty...');
      const thirdTypeId = typesResponse.data[2].id;
      try {
        await axios.post(`${BASE_URL}/technicians/me/specialties/${thirdTypeId}`, {}, { headers: authHeaders });
        console.log('✅ Specialty added successfully');
      } catch (error) {
        console.log('⚠️  Specialty already exists or error:', error.response?.data?.message || error.message);
      }
    }

    // 9. Test removing a specialty
    if (typesResponse.data.length > 1) {
      console.log('\n9. Testing Remove Specialty...');
      const secondTypeId = typesResponse.data[1].id;
      try {
        await axios.delete(`${BASE_URL}/technicians/me/specialties/${secondTypeId}`, { headers: authHeaders });
        console.log('✅ Specialty removed successfully');
      } catch (error) {
        console.log('⚠️  Specialty removal error:', error.response?.data?.message || error.message);
      }
    }

    // 10. Test change password
    console.log('\n10. Testing Change Password...');
    const changePasswordData = {
      currentPassword: 'password123',
      newPassword: 'newpassword123'
    };

    try {
      await axios.post(`${BASE_URL}/identity/change-password`, changePasswordData, { headers: authHeaders });
      console.log('✅ Password changed successfully');
      
      // Change it back for future tests
      const changeBackData = {
        currentPassword: 'newpassword123',
        newPassword: 'password123'
      };
      await axios.post(`${BASE_URL}/identity/change-password`, changeBackData, { headers: authHeaders });
      console.log('✅ Password changed back successfully');
    } catch (error) {
      console.log('❌ Password change failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.log('\n❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the tests
testEndpoints();
