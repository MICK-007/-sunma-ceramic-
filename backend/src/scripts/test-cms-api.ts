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

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runCmsApiTests() {
  console.log('🧪 Starting Backend CMS API Verification Tests...\n');

  try {
    // Test 1: Public Read API for Home Page
    console.log('Test 1: Public GET /api/cms/public/pages/home');
    const res1 = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/cms/public/pages/home',
      method: 'GET',
    });

    console.log('  Status Code:', res1.status);
    console.log('  Success:', res1.body.success);
    console.log('  Sections Retrieved:', res1.body.data?.sections?.length || 0);

    if (res1.status === 200 && res1.body.success && res1.body.data?.sections?.length > 0) {
      console.log('  ✅ Test 1 PASSED: Public CMS Page endpoint operational!\n');
    } else {
      throw new Error(`Test 1 Failed with response: ${JSON.stringify(res1.body)}`);
    }

    // Test 2: Protected Admin Route without Auth Cookie/Token -> Must return 401 Unauthorized
    console.log('Test 2: Protected GET /api/cms/admin/pages/home/draft (No Auth Header)');
    const res2 = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/cms/admin/pages/home/draft',
      method: 'GET',
    });

    console.log('  Status Code:', res2.status);
    console.log('  Message:', res2.body.message);

    if (res2.status === 401 && res2.body.success === false) {
      console.log('  ✅ Test 2 PASSED: Protected route correctly denied unauthenticated request with 401!\n');
    } else {
      throw new Error(`Test 2 Failed! Server allowed unauthenticated access.`);
    }

    console.log('🎉 All CMS API Unit & Security Tests PASSED!');
  } catch (err: any) {
    console.error('❌ Test Execution Error:', err.message);
    process.exit(1);
  }
}

runCmsApiTests();
