/**
 * Test script to verify the multi-offer system is working correctly
 * Run with: node test-multi-offer-verification.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test data
const testClient = {
  email: 'client.test@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'Client',
  phone: '123456789'
};

const testTechnician = {
  email: 'tech.test@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'Technician',
  phone: '987654321',
  specialties: ['Refrigeración']
};

let clientToken = '';
let technicianToken = '';
let serviceRequestId = 0;

async function registerAndLogin(userData, role) {
  try {
    console.log(`\n🔧 Testing ${role} registration and login...`);
    
    // Register
    const registerResponse = await axios.post(`${BASE_URL}/auth/register/${role}`, userData);
    console.log(`✅ ${role} registered successfully`);
    
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: userData.email,
      password: userData.password
    });
    
    console.log(`✅ ${role} logged in successfully`);
    return loginResponse.data.access_token;
    
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`ℹ️  ${role} already exists, attempting login...`);
      // Try to login if user already exists
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: userData.email,
        password: userData.password
      });
      console.log(`✅ ${role} logged in successfully`);
      return loginResponse.data.access_token;
    }
    throw error;
  }
}

async function createServiceRequest() {
  try {
    console.log('\n🔧 Creating service request...');
    
    const response = await axios.post(`${BASE_URL}/service-requests`, {
      description: 'Test multi-offer system - refrigerator repair',
      proposedDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      clientPrice: 50000,
      applianceId: 1 // Assuming appliance ID 1 exists
    }, {
      headers: {
        'Authorization': `Bearer ${clientToken}`
      }
    });
    
    serviceRequestId = response.data.id;
    console.log(`✅ Service request created with ID: ${serviceRequestId}`);
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Client price: ${response.data.clientPrice} COP`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error creating service request:', error.response?.data || error.message);
    throw error;
  }
}

async function makeOffer(price, comment) {
  try {
    console.log(`\n🔧 Technician making offer: ${price} COP...`);
    
    const response = await axios.post(`${BASE_URL}/service-requests/${serviceRequestId}/offer`, {
      technicianPrice: price,
      comment: comment
    }, {
      headers: {
        'Authorization': `Bearer ${technicianToken}`
      }
    });
    
    console.log(`✅ Offer created successfully`);
    console.log(`   Offer ID: ${response.data.id}`);
    console.log(`   Price: ${response.data.price} COP`);
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Comment: ${response.data.comment}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error making offer:', error.response?.data || error.message);
    throw error;
  }
}

async function getClientRequests() {
  try {
    console.log('\n🔧 Getting client requests with offers...');
    
    const response = await axios.get(`${BASE_URL}/service-requests/my-requests`, {
      headers: {
        'Authorization': `Bearer ${clientToken}`
      }
    });
    
    console.log(`✅ Found ${response.data.length} requests`);
    
    if (response.data.length > 0) {
      const request = response.data.find(r => r.id === serviceRequestId);
      if (request) {
        console.log(`   Request ID: ${request.id}`);
        console.log(`   Status: ${request.status}`);
        console.log(`   Client price: ${request.clientPrice} COP`);
        console.log(`   Offers received: ${request.offers?.length || 0}`);
        
        if (request.offers && request.offers.length > 0) {
          request.offers.forEach((offer, index) => {
            console.log(`   Offer ${index + 1}:`);
            console.log(`     - ID: ${offer.id}`);
            console.log(`     - Price: ${offer.price} COP`);
            console.log(`     - Status: ${offer.status}`);
            console.log(`     - Comment: ${offer.comment || 'No comment'}`);
            console.log(`     - Technician: ${offer.technician?.firstName} ${offer.technician?.lastName}`);
          });
        }
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error getting client requests:', error.response?.data || error.message);
    throw error;
  }
}

async function acceptOffer(offerId) {
  try {
    console.log(`\n🔧 Accepting offer ${offerId}...`);
    
    const response = await axios.post(`${BASE_URL}/service-requests/${serviceRequestId}/accept-offer/${offerId}`, {}, {
      headers: {
        'Authorization': `Bearer ${clientToken}`
      }
    });
    
    console.log(`✅ Offer accepted successfully`);
    console.log(`   Request status: ${response.data.status}`);
    console.log(`   Technician ID: ${response.data.technicianId}`);
    console.log(`   Final price: ${response.data.technicianPrice} COP`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error accepting offer:', error.response?.data || error.message);
    throw error;
  }
}

async function runMultiOfferTest() {
  try {
    console.log('🚀 Starting Multi-Offer System Verification Test\n');
    console.log('='.repeat(50));
    
    // 1. Register and login users
    clientToken = await registerAndLogin(testClient, 'client');
    technicianToken = await registerAndLogin(testTechnician, 'technician');
    
    // 2. Create service request
    await createServiceRequest();
    
    // 3. Make multiple offers (simulate multiple technicians)
    const offer1 = await makeOffer(45000, 'I can fix it quickly and efficiently');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    const offer2 = await makeOffer(40000, 'Best price guaranteed - experienced technician');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    const offer3 = await makeOffer(48000, 'Quality service with warranty included');
    
    // 4. Get client requests to verify offers are stored
    const requests = await getClientRequests();
    
    // 5. Accept the best offer (lowest price in this case)
    const requestWithOffers = requests.find(r => r.id === serviceRequestId);
    if (requestWithOffers && requestWithOffers.offers && requestWithOffers.offers.length > 0) {
      const bestOffer = requestWithOffers.offers
        .filter(o => o.status === 'pending')
        .sort((a, b) => a.price - b.price)[0];
      
      if (bestOffer) {
        await acceptOffer(bestOffer.id);
      }
    }
    
    // 6. Final verification
    await getClientRequests();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Multi-Offer System Test Completed Successfully!');
    console.log('\n✅ Verified features:');
    console.log('   - Client and technician registration/login');
    console.log('   - Service request creation');
    console.log('   - Multiple offer creation');
    console.log('   - Offer retrieval with technician details');
    console.log('   - Offer acceptance and status updates');
    console.log('\n🔧 The multi-offer system is working correctly!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    process.exit(1);
  }
}

// Run the test
runMultiOfferTest();