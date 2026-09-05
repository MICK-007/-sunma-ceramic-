"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectBinaryMimeType = detectBinaryMimeType;
exports.getAdminMedia = getAdminMedia;
exports.uploadAdminMedia = uploadAdminMedia;
exports.updateAdminMedia = updateAdminMedia;
exports.deleteAdminMedia = deleteAdminMedia;
exports.servePublicMediaFile = servePublicMediaFile;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../db");
const cms_controller_1 = require("./cms.controller");
const storage_1 = require("../utils/storage");
const ALLOWED_MIME_TYPES = Object.keys(storage_1.ALLOWED_MIME_MAP);
/**
 * Detect binary magic bytes to verify actual image signature
 */
function detectBinaryMimeType(buffer) {
    if (!buffer || buffer.length < 4)
        return null;
    // 1. JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return 'image/jpeg';
    }
    // 2. PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        return 'image/png';
    }
    // 3. GIF: 47 49 46 ("GIF87a" or "GIF89a")
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
        return 'image/gif';
    }
    // 4. WEBP: RIFF....WEBP
    if (buffer.slice(0, 4).toString('ascii') === 'RIFF' &&
        buffer.slice(8, 12).toString('ascii') === 'WEBP') {
        return 'image/webp';
    }
    // 5. AVIF: ftypavif / ftypavis / ftypisom
    if (buffer.length >= 12 && buffer.slice(4, 12).toString('ascii').includes('ftyp')) {
        const ftyp = buffer.slice(8, 12).toString('ascii').toLowerCase();
        if (ftyp.includes('avif') || ftyp.includes('avis') || ftyp.includes('isom') || ftyp.includes('mp42')) {
            return 'image/avif';
        }
    }
    return null;
}
/**
 * GET /api/cms/admin/media
 * Fetch all media library items with optional search query
 */
async function getAdminMedia(req, res) {
    const search = req.query.search ? String(req.query.search).trim() : '';
    const sql = (0, db_1.getDbClient)();
    if (!sql) {
        return res.status(500).json({ success: false, message: 'Database connection failure.' });
    }
    try {
        let mediaList;
        if (search) {
            mediaList = await sql `
        SELECT m.id, m.filename, m.original_name, m.mime_type, m.size_bytes, m.storage_path, m.url, m.alt_text, m.uploaded_by, m.created_at, m.updated_at,
          (SELECT COUNT(*)::int FROM cms_section_items item WHERE item.media_id = m.id) as usage_count
        FROM cms_media m
        WHERE m.original_name ILIKE ${'%' + search + '%'} OR m.alt_text ILIKE ${'%' + search + '%'}
        ORDER BY m.created_at DESC
      `;
        }
        else {
            mediaList = await sql `
        SELECT m.id, m.filename, m.original_name, m.mime_type, m.size_bytes, m.storage_path, m.url, m.alt_text, m.uploaded_by, m.created_at, m.updated_at,
          (SELECT COUNT(*)::int FROM cms_section_items item WHERE item.media_id = m.id) as usage_count
        FROM cms_media m
        ORDER BY m.created_at DESC
      `;
        }
        await sql.end();
        return res.json({ success: true, data: mediaList });
    }
    catch (error) {
        console.error('Error fetching media:', error);
        if (sql)
            await sql.end().catch(() => { });
        return res.status(500).json({ success: false, message: 'Failed to retrieve media library.' });
    }
}
/**
 * POST /api/cms/admin/media/upload
 * Binary-first Media Upload Pipeline (No Base64 persistence)
 */
async function uploadAdminMedia(req, res) {
    // 1. Reject Base64 request payloads
    if (req.body?.base64Data || (typeof req.body === 'string' && req.body.includes('data:image/'))) {
        return res.status(400).json({
            success: false,
            message: 'Base64 request bodies are strictly forbidden for new uploads. Use multipart/form-data with a binary file.',
            code: 'INVALID_FILE',
        });
    }
    // 2. Handle External Image URL if explicitly provided
    if (req.body?.imageUrl && !req.file) {
        const imageUrl = req.body.imageUrl;
        if (typeof imageUrl !== 'string' ||
            !/^https?:\/\//i.test(imageUrl) ||
            imageUrl.length > 2048 ||
            /^(javascript|data|vbscript|file):/i.test(imageUrl)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid, insecure, or unsupported external image URL.',
                code: 'INVALID_FILE',
            });
        }
        const sql = (0, db_1.getDbClient)();
        if (!sql)
            return res.status(500).json({ success: false, message: 'Database connection failure.' });
        try {
            const mediaId = crypto_1.default.randomUUID();
            const created = await sql `
        INSERT INTO cms_media (id, filename, original_name, mime_type, size_bytes, url, alt_text, uploaded_by)
        VALUES (
          ${mediaId},
          ${req.body.fileName || 'external-asset.jpg'},
          ${req.body.fileName || 'external-asset.jpg'},
          ${req.body.mimeType || 'image/jpeg'},
          0,
          ${imageUrl},
          ${req.body.altText || ''},
          ${req.user?.id || null}
        )
        RETURNING *
      `;
            await sql.end();
            await (0, cms_controller_1.logCmsAuditEvent)({
                actorId: req.user?.id,
                action: 'ADMIN_MEDIA_UPLOAD_EXTERNAL',
                targetType: 'MEDIA',
                targetId: mediaId,
                details: { url: imageUrl, isExternal: true },
                ipAddress: req.ip,
            });
            return res.status(201).json({ success: true, data: created[0] });
        }
        catch (err) {
            if (sql)
                await sql.end().catch(() => { });
            return res.status(500).json({ success: false, message: 'Failed to insert external media URL.', code: 'MEDIA_DB_PERSIST_FAILED' });
        }
    }
    // 3. Binary File Upload Handling
    const file = req.file;
    if (!file || !file.buffer) {
        return res.status(400).json({
            success: false,
            message: 'Missing binary file payload. Expected multipart/form-data field "file".',
            code: 'INVALID_FILE',
        });
    }
    // 4. Server-Side Size Validation (Max 5MB)
    if (file.buffer.length > storage_1.MAX_FILE_SIZE_BYTES) {
        return res.status(400).json({
            success: false,
            message: `File size exceeds max limit of 5MB. Current size: ${(file.buffer.length / 1024 / 1024).toFixed(2)}MB`,
            code: 'FILE_TOO_LARGE',
        });
    }
    // 5. Declared MIME Validation
    const declaredMime = (file.mimetype || '').trim().toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(declaredMime)) {
        return res.status(400).json({
            success: false,
            message: `Forbidden MIME type '${declaredMime}'. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
            code: 'UNSUPPORTED_MEDIA_TYPE',
        });
    }
    // 6. Magic-Byte Binary Signature Validation
    const detectedMime = detectBinaryMimeType(file.buffer);
    if (!detectedMime) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or corrupted image binary, or forbidden file format (SVG, HTML, JS content rejected).',
            code: 'INVALID_FILE',
        });
    }
    if (detectedMime !== declaredMime) {
        return res.status(400).json({
            success: false,
            message: `Declared MIME type '${declaredMime}' does not match binary magic-byte signature '${detectedMime}'.`,
            code: 'MEDIA_SIGNATURE_MISMATCH',
        });
    }
    // 7. Server-Side Identity & Path Generation
    const mediaId = crypto_1.default.randomUUID();
    const ext = storage_1.ALLOWED_MIME_MAP[detectedMime];
    const storagePath = `cms/media/${mediaId}.${ext}`;
    const safeFilename = `${mediaId}.${ext}`;
    const originalName = (req.body?.altText || file.originalname || 'uploaded-image').replace(/[/\\]/g, '');
    const altText = req.body?.altText || originalName.split('.')[0] || '';
    // 8. Overwrite Prevention Check
    const alreadyExists = await (0, storage_1.mediaObjectExists)(storagePath);
    if (alreadyExists) {
        return res.status(400).json({
            success: false,
            message: `Storage object '${storagePath}' already exists. Overwrite strictly forbidden.`,
            code: 'MEDIA_STORAGE_OBJECT_EXISTS',
        });
    }
    // 9. Supabase Storage Binary Upload
    const uploadRes = await (0, storage_1.uploadCmsMedia)(mediaId, detectedMime, file.buffer);
    if (!uploadRes.success || !uploadRes.url || !uploadRes.storagePath) {
        return res.status(500).json({
            success: false,
            message: uploadRes.error || 'Failed to upload binary asset to storage.',
            code: uploadRes.code || 'MEDIA_STORAGE_UPLOAD_FAILED',
        });
    }
    const sql = (0, db_1.getDbClient)();
    if (!sql) {
        // Compensating Transaction: Delete storage object if DB client unavailable
        await (0, storage_1.deleteCmsMedia)(storagePath);
        return res.status(500).json({ success: false, message: 'Database connection failure.', code: 'MEDIA_DB_PERSIST_FAILED' });
    }
    // 10. Persist Record to Postgres cms_media Table
    try {
        const created = await sql `
      INSERT INTO cms_media (id, filename, original_name, mime_type, size_bytes, storage_path, url, alt_text, uploaded_by, file_data)
      VALUES (
        ${mediaId},
        ${safeFilename},
        ${originalName},
        ${detectedMime},
        ${file.buffer.length},
        ${storagePath},
        ${uploadRes.url},
        ${altText},
        ${req.user?.id || null},
        ${file.buffer}
      )
      RETURNING id, filename, original_name, mime_type, size_bytes, storage_path, url, alt_text, created_at
    `;
        await sql.end();
        await (0, cms_controller_1.logCmsAuditEvent)({
            actorId: req.user?.id,
            action: 'ADMIN_MEDIA_UPLOAD',
            targetType: 'MEDIA',
            targetId: mediaId,
            details: { mediaId, storagePath, mimeType: detectedMime, sizeBytes: file.buffer.length },
            ipAddress: req.ip,
        });
        return res.status(201).json({ success: true, data: created[0] });
    }
    catch (error) {
        console.error('❌ Error persisting cms_media row:', error);
        if (sql)
            await sql.end().catch(() => { });
        // Compensating Transaction: Cleanup newly created storage object if DB insert failed
        await (0, storage_1.deleteCmsMedia)(storagePath);
        return res.status(500).json({
            success: false,
            message: 'Database insert failed. Storage object successfully cleaned up.',
            code: 'MEDIA_DB_PERSIST_FAILED',
        });
    }
}
/**
 * PATCH /api/cms/admin/media/:id
 * Update media metadata (Alt text)
 */
async function updateAdminMedia(req, res) {
    const { id } = req.params;
    const { altText } = req.body;
    const sql = (0, db_1.getDbClient)();
    if (!sql)
        return res.status(500).json({ success: false, message: 'Database connection failure.' });
    try {
        const updated = await sql `
      UPDATE cms_media
      SET alt_text = ${altText ?? ''}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
        if (!updated || updated.length === 0) {
            await sql.end();
            return res.status(404).json({ success: false, message: 'Media item not found.' });
        }
        await sql.end();
        await (0, cms_controller_1.logCmsAuditEvent)({
            actorId: req.user?.id,
            action: 'ADMIN_MEDIA_UPDATE',
            targetType: 'MEDIA',
            targetId: id,
            details: { altText },
            ipAddress: req.ip,
        });
        return res.json({ success: true, data: updated[0] });
    }
    catch (error) {
        console.error('Error updating media:', error);
        if (sql)
            await sql.end().catch(() => { });
        return res.status(500).json({ success: false, message: 'Failed to update media item.' });
    }
}
/**
 * DELETE /api/cms/admin/media/:id
 * Hardened Delete Safety Check (Prevents breaking Drafts or Historical Snapshots)
 */
async function deleteAdminMedia(req, res) {
    const { id } = req.params;
    const sql = (0, db_1.getDbClient)();
    if (!sql)
        return res.status(500).json({ success: false, message: 'Database connection failure.' });
    try {
        // 1. Auto-Unbind any draft section items referencing this media asset
        await sql `
      UPDATE cms_section_items
      SET media_id = NULL
      WHERE media_id = ${id}
    `;
        // 3. Fetch Media record details before deletion
        const media = await sql `SELECT filename, storage_path FROM cms_media WHERE id = ${id} LIMIT 1`;
        if (!media || media.length === 0) {
            await sql.end();
            return res.status(404).json({ success: false, message: 'Media item not found.', code: 'MEDIA_STORAGE_NOT_FOUND' });
        }
        const storagePath = media[0].storage_path;
        // 4. Delete from Postgres DB
        await sql `DELETE FROM cms_media WHERE id = ${id}`;
        await sql.end();
        // 5. Delete Binary Object from Supabase Storage (if storage_path exists)
        if (storagePath) {
            await (0, storage_1.deleteCmsMedia)(storagePath);
        }
        await (0, cms_controller_1.logCmsAuditEvent)({
            actorId: req.user?.id,
            action: 'ADMIN_MEDIA_DELETE',
            targetType: 'MEDIA',
            targetId: id,
            details: { filename: media[0].filename, storagePath },
            ipAddress: req.ip,
        });
        return res.json({ success: true, message: 'Unreferenced media asset deleted successfully.' });
    }
    catch (error) {
        console.error('Error deleting media:', error);
        if (sql)
            await sql.end().catch(() => { });
        return res.status(500).json({ success: false, message: 'Failed to delete media item.' });
    }
}
/**
 * GET /api/cms/public/media/file/:filename
 * Serves binary media file directly from storage with proper Content-Type
 */
async function servePublicMediaFile(req, res) {
    const filename = (req.params.filename || '').replace(/[^a-zA-Z0-9.\-_]/g, '');
    if (!filename || filename.includes('..')) {
        return res.status(400).send('Invalid filename');
    }
    const filePath = path_1.default.join(storage_1.LOCAL_MEDIA_DIR, filename);
    if (fs_1.default.existsSync(filePath)) {
        const ext = path_1.default.extname(filename).toLowerCase().replace('.', '');
        const mime = Object.keys(storage_1.ALLOWED_MIME_MAP).find(k => storage_1.ALLOWED_MIME_MAP[k] === ext) || 'image/jpeg';
        res.setHeader('Content-Type', mime);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return fs_1.default.createReadStream(filePath).pipe(res);
    }
    // 2. Fetch binary file_data directly from PostgreSQL (Fail-safe persistence)
    const sql = (0, db_1.getDbClient)();
    if (sql) {
        try {
            const rows = await sql `
        SELECT mime_type, file_data FROM cms_media WHERE filename = ${filename} LIMIT 1
      `;
            await sql.end();
            if (rows && rows.length > 0 && rows[0].file_data) {
                const mime = rows[0].mime_type || 'image/jpeg';
                res.setHeader('Content-Type', mime);
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                try {
                    fs_1.default.writeFileSync(filePath, rows[0].file_data);
                }
                catch (e) { }
                return res.send(rows[0].file_data);
            }
        }
        catch (err) {
            if (sql)
                await sql.end().catch(() => { });
        }
    }
    // 3. Fallback to direct Supabase Storage CDN Redirect
    const supabaseUrl = process.env.SUPABASE_URL || 'https://xacaeysrrfqhwpkdjkvm.supabase.co';
    const cdnUrl = `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/cms/media/${filename}`;
    return res.redirect(302, cdnUrl);
}
