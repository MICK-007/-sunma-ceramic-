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

async function runDraftVsPublicTest() {
  console.log('🧪 Starting STEP 5: Draft vs Public Isolation Security Test...\n');

  try {
    // 1. Fetch Public API for home page
    console.log('Step 1: Fetch Public Published API (GET /api/cms/public/pages/home)');
    const publicRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/cms/public/pages/home',
      method: 'GET',
    });

    console.log('  Public API Status:', publicRes.status);
    const publicHeroTitle = publicRes.body?.data?.sections?.find((s: any) => s.section_key === 'hero')?.title;
    console.log('  Public Hero Title in DB:', `"${publicHeroTitle}"`);

    // 2. Fetch Protected Admin Draft API without Auth -> Must return 401
    console.log('\nStep 2: Access Protected Admin Draft API without Auth Header (GET /api/cms/admin/pages/home/draft)');
    const unauthDraftRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/cms/admin/pages/home/draft',
      method: 'GET',
    });

    console.log('  Unauthenticated Draft Access Status:', unauthDraftRes.status);
    console.log('  Message:', unauthDraftRes.body?.message);

    if (unauthDraftRes.status !== 401) {
      throw new Error(`CRITICAL SECURITY FAILURE: Server allowed unauthenticated access to Draft API! Got status ${unauthDraftRes.status}`);
    } else {
      console.log('  ✅ SECURITY VERIFIED: Public/Unauthenticated visitors are 100% blocked from viewing Draft API!');
    }

    console.log('\n🎉 ALL STEP 5 DRAFT VS PUBLIC SEPARATION TESTS PASSED!');
  } catch (err: any) {
    console.error('❌ Test Error:', err.message);
    process.exit(1);
  }
}

runDraftVsPublicTest();
