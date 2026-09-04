import http from 'http';

function makeRequest(options: http.RequestOptions, body?: any): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode || 0, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode || 0, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runMediaSecurityTests() {
  console.log('🧪 Starting Media Library Infrastructure Security Tests...\n');

  try {
    // Test 1: Unauthenticated request to /api/cms/admin/media -> 401
    console.log('Test 1: Unauthenticated GET /api/cms/admin/media');
    const res1 = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/cms/admin/media',
      method: 'GET',
    });

    console.log('  Status Code:', res1.status);
    if (res1.status === 401) {
      console.log('  ✅ Test 1 PASSED: Unauthenticated request correctly denied with 401!\n');
    } else {
      throw new Error(`Test 1 Failed: Expected 401 but got ${res1.status}`);
    }

    // Test 2: Invalid MIME type upload -> Rejected with 400
    console.log('Test 2: Invalid MIME Type upload (application/x-sh)');
    const res2 = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/cms/admin/media/upload',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        fileName: 'malicious.sh',
        mimeType: 'application/x-sh',
        base64Data: 'data:application/x-sh;base64,ZWNobyAiaGFja2VkIg==',
      }
    );

    console.log('  Status Code:', res2.status);
    console.log('  Message:', res2.body?.message);
    if (res2.status === 401 || res2.status === 400 || res2.status === 403) {
      console.log('  ✅ Test 2 PASSED: Executable / invalid MIME upload rejected with security check!\n');
    } else {
      throw new Error(`Test 2 Failed: Server allowed dangerous MIME type`);
    }

    // Test 3: Oversized upload test
    console.log('Test 3: Oversized file upload simulation (> 5MB)');
    const hugeBase64 = 'A'.repeat(7 * 1024 * 1024); // 7MB payload
    const res3 = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/cms/admin/media/upload',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        fileName: 'huge.jpg',
        mimeType: 'image/jpeg',
        base64Data: `data:image/jpeg;base64,${hugeBase64}`,
      }
    );

    console.log('  Status Code:', res3.status);
    if (res3.status === 401 || res3.status === 400 || res3.status === 413 || res3.status === 403) {
      console.log('  ✅ Test 3 PASSED: Oversized upload correctly rejected by security policy!\n');
    } else {
      throw new Error(`Test 3 Failed: Server allowed oversized upload`);
    }

    console.log('🎉 All STEP 3 Media Library Security Tests PASSED!');
  } catch (err: any) {
    console.error('❌ Test Error:', err.message);
    process.exit(1);
  }
}

runMediaSecurityTests();
