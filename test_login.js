async function testLogin() {
  try {
    const res = await fetch('https://ganga-photo-studio-backend.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@ganga.com', password: 'owner123' })
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
testLogin();
