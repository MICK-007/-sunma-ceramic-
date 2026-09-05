"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function testFlow() {
    const testEmail = `testuser_${Date.now()}@gmail.com`;
    console.log(`🧪 Testing direct API registration with fresh email: ${testEmail}...`);
    try {
        const res = await fetch('https://sunma-ceramic.onrender.com/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: 'password123',
                fullName: 'Test User Live',
                phone: '0899999999',
            }),
        });
        console.log('Status code:', res.status);
        const data = await res.json();
        console.log('Response payload:', data);
    }
    catch (err) {
        console.error('Error:', err);
    }
}
testFlow();
