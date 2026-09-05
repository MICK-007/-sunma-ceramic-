"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function testFetch() {
    try {
        const res = await fetch('http://localhost:5000/api/cms/public/media/file/1059b22f-5ca8-41f7-826e-a41644c1c157.jpg');
        console.log('STATUS:', res.status, res.statusText);
        console.log('CONTENT TYPE:', res.headers.get('content-type'));
        const text = await res.text();
        console.log('BODY:', text.substring(0, 300));
    }
    catch (err) {
        console.error('ERROR:', err);
    }
}
testFetch();
