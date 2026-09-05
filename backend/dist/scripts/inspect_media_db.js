"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
async function inspectMedia() {
    const sql = (0, db_1.getDbClient)();
    if (!sql)
        throw new Error('DB client null');
    const rows = await sql `SELECT id, storage_path, url, mime_type, size_bytes FROM cms_media ORDER BY created_at DESC`;
    console.log(`TOTAL CMS MEDIA ROWS: ${rows.length}`);
    let base64Count = 0;
    let httpsCount = 0;
    for (const r of rows) {
        const isBase64 = r.url?.startsWith('data:image/');
        if (isBase64)
            base64Count++;
        else
            httpsCount++;
        console.log({
            id: r.id,
            storage_path: r.storage_path,
            mime_type: r.mime_type,
            size_bytes: r.size_bytes,
            isBase64,
            urlPreview: isBase64 ? `${r.url.substring(0, 45)}...` : r.url
        });
    }
    console.log(`\nSUMMARY: Total = ${rows.length}, Base64 = ${base64Count}, HTTPS = ${httpsCount}`);
    await sql?.end();
}
inspectMedia().catch(console.error);
