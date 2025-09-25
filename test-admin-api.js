// Simple script to test the admin API
// Using built-in fetch API

async function testAdminAPI() {
  try {
    // Test admin login
    await testLogin('admin@grindx.io', 'admin123', 'Admin');
    
    // Test agency login
    await testLogin('agency@grindx.io', 'agency123', 'Agency');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testLogin(email, password, userType) {
  try {
    console.log(`\nTesting ${userType} login...`);
    
    // Login
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginResponse.ok) {
      console.error(`${userType} login failed`);
      return false;
    }
    
    // Get cookies from login response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Cookies received:', cookies ? 'Yes' : 'No');
    
    if (!cookies) {
      console.error('No cookies returned from login');
      return false;
    }
    
    // If admin, test the admin APIs
    if (userType === 'Admin') {
      // Test stats API
      console.log('\nTesting admin stats API...');
      const statsResponse = await fetch('http://localhost:3001/api/admin/stats', {
        method: 'GET',
        headers: { 'Cookie': cookies },
      });
      
      const statsData = await statsResponse.json();
      console.log('Stats response:', statsData);
      
      if (!statsResponse.ok) {
        console.error('\nError: Admin stats API returned', statsResponse.status);
        return false;
      }
      
      console.log('\nSuccess! Admin stats API is working correctly.');
      console.log('Total users:', statsData.totalUsers);
      console.log('Agency users:', statsData.agencyUsers);
      
      // Test colleges API
      console.log('\nTesting admin colleges API...');
      const collegesResponse = await fetch('http://localhost:3001/api/admin/colleges', {
        method: 'GET',
        headers: { 'Cookie': cookies },
      });
      
      const collegesData = await collegesResponse.json();
      
      if (!collegesResponse.ok) {
        console.error('\nError: Admin colleges API returned', collegesResponse.status);
        return false;
      }
      
      console.log('\nSuccess! Admin colleges API is working correctly.');
      console.log('Colleges data received successfully');
      if (collegesData && collegesData.colleges && Array.isArray(collegesData.colleges)) {
        console.log('Number of colleges:', collegesData.colleges.length);
      } else {
        console.log('Colleges data structure:', Object.keys(collegesData));
      }
    }
    
    console.log(`${userType} login and session test successful!`);
    return true;
  } catch (error) {
    console.error(`Error in ${userType} test:`, error.message);
    return false;
  }
}

testAdminAPI();