async function testRemote() {
  try {
    console.log('📡 Testing POST to https://sunma-ceramic.onrender.com/api/auth/register ...');
    const res = await fetch('https://sunma-ceramic.onrender.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'prachakchai.srimala@gmail.com',
        password: 'password123',
        fullName: 'dil1',
        phone: '0000000000',
      }),
    });

    console.log('Status code:', res.status);
    const data = await res.json();
    console.log('Response JSON:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

testRemote();
