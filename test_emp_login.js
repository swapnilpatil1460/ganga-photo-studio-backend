async function testEmployeeLogin() {
  const API = 'https://ganga-photo-studio-backend.onrender.com';
  
  // Step 1: Login as owner
  console.log('1. Logging in as owner...');
  const ownerRes = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'owner@ganga.com', password: 'owner123' })
  });
  console.log('   Owner login status:', ownerRes.status);
  if (!ownerRes.ok) {
    console.log('   Owner login failed:', await ownerRes.text());
    return;
  }
  const ownerData = await ownerRes.json();
  console.log('   Owner token received:', !!ownerData.token);
  
  // Step 2: Create an employee (this also creates a User account)
  console.log('\n2. Creating test employee...');
  const empRes = await fetch(`${API}/api/employees`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ownerData.token}`
    },
    body: JSON.stringify({
      name: 'Test Employee',
      email: 'testemp@ganga.com',
      phone: '9876543210',
      role: 'Photographer',
      status: 'Active',
      salary: 25000
    })
  });
  console.log('   Create employee status:', empRes.status);
  const empData = await empRes.json();
  
  if (empData.credentials) {
    console.log('   Generated credentials:', empData.credentials);
  } else {
    console.log('   Response:', JSON.stringify(empData));
  }
  
  // Step 3: Try logging in as the employee
  if (empData.credentials) {
    console.log('\n3. Logging in as employee...');
    const empLoginRes = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: empData.credentials.email, 
        password: empData.credentials.password 
      })
    });
    console.log('   Employee login status:', empLoginRes.status);
    const empLoginData = await empLoginRes.json();
    console.log('   Employee login response:', JSON.stringify(empLoginData));
    
    if (empLoginData.token) {
      console.log('\n✅ EMPLOYEE LOGIN WORKS!');
      console.log('   Role:', empLoginData.user?.role);
      
      // Step 4: Test if employee can access dashboard data
      console.log('\n4. Testing employee API access...');
      const dashRes = await fetch(`${API}/api/orders`, {
        headers: { 'Authorization': `Bearer ${empLoginData.token}` }
      });
      console.log('   Orders API status:', dashRes.status);
    } else {
      console.log('\n❌ EMPLOYEE LOGIN FAILED');
    }
  }
}

testEmployeeLogin().catch(err => console.error('Error:', err.message));
