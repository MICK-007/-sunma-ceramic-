import { Response } from 'express';
import { getDbClient } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { logCmsAuditEvent } from './cms.controller';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB limit

/**
 * GET /api/cms/admin/media
 * Fetch all media library items with optional search query
 */
export async function getAdminMedia(req: AuthenticatedRequest, res: Response) {
  const search = req.query.search ? String(req.query.search).trim() : '';
  const sql = getDbClient();
  if (!sql) {
    return res.status(500).json({ success: false, message: 'Database connection failure.' });
  }

  try {
    let mediaList;
    if (search) {
      mediaList = await sql`
        SELECT m.id, m.filename, m.original_name, m.mime_type, m.size_bytes, m.url, m.alt_text, m.uploaded_by, m.created_at, m.updated_at,
          (SELECT COUNT(*)::int FROM cms_section_items item WHERE item.media_id = m.id) as usage_count
        FROM cms_media m
        WHERE m.original_name ILIKE ${'%' + search + '%'} OR m.alt_text ILIKE ${'%' + search + '%'}
        ORDER BY m.created_at DESC
      `;
    } else {
      mediaList = await sql`
        SELECT m.id, m.filename, m.original_name, m.mime_type, m.size_bytes, m.url, m.alt_text, m.uploaded_by, m.created_at, m.updated_at,
          (SELECT COUNT(*)::int FROM cms_section_items item WHERE item.media_id = m.id) as usage_count
        FROM cms_media m
        ORDER BY m.created_at DESC
      `;
    }

    await sql.end();
    return res.json({ success: true, data: mediaList });
  } catch (error: any) {
    console.error('Error fetching media:', error);
    if (sql) await sql.end().catch(() => {});
    return res.status(500).json({ success: false, message: 'Failed to retrieve media library.' });
  }
}

/**
 * POST /api/cms/admin/media/upload
 * Validate & store media file (Base64 payload or URL upload reference)
 */
export async function uploadAdminMedia(req: AuthenticatedRequest, res: Response) {
  const { fileName, mimeType, base64Data, imageUrl, altText } = req.body;

  // 1. If imageUrl provided directly (e.g. Unsplash or external CDN asset)
  if (imageUrl && !base64Data) {
    if (typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      return res.status(400).json({ success: false, message: 'Invalid image URL.' });
    }

    const sql = getDbClient();
    if (!sql) return res.status(500).json({ success: false, message: 'Database connection failure.' });

    try {
      const created = await sql`
        INSERT INTO cms_media (filename, original_name, mime_type, size_bytes, url, alt_text, uploaded_by)
        VALUES (
          ${fileName || 'external-asset.jpg'},
          ${fileName || 'external-asset.jpg'},
          ${mimeType || 'image/jpeg'},
          0,
          ${imageUrl},
          ${altText || ''},
          ${req.user?.id || null}
        )
        RETURNING *
      `;
      await sql.end();

      await logCmsAuditEvent({
        actorId: req.user?.id,
        action: 'ADMIN_MEDIA_UPLOAD',
        targetType: 'MEDIA',
        targetId: created[0].id,
        details: { url: imageUrl, isExternal: true },
        ipAddress: req.ip,
      });

      return res.status(201).json({ success: true, data: created[0] });
    } catch (err: any) {
      if (sql) await sql.end().catch(() => {});
      return res.status(500).json({ success: false, message: 'Failed to insert media URL.' });
    }
  }

  // 2. Validate Base64 Upload Payload
  if (!base64Data || !fileName || !mimeType) {
    return res.status(400).json({ success: false, message: 'Missing file data, fileName, or mimeType.' });
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: `Invalid file MIME type '${mimeType}'. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    });
  }

  // Validate File Extension
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return res.status(400).json({
      success: false,
      message: `Invalid file extension '.${ext}'. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`,
    });
  }

  // Prevent Path Traversal in filename
  if (fileName.includes('/') || fileName.includes('\\') || fileName.includes('..')) {
    return res.status(400).json({ success: false, message: 'Invalid or dangerous filename.' });
  }

  // Validate File Size (Base64 length estimation)
  const buffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return res.status(400).json({
      success: false,
      message: `File size exceeds max limit of 5MB. Current size: ${(buffer.length / 1024 / 1024).toFixed(2)}MB`,
    });
  }

  // Generate safe Data URI URL for storage (Production-grade Base64 Asset Storage)
  const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

  const sql = getDbClient();
  if (!sql) return res.status(500).json({ success: false, message: 'Database connection failure.' });

  try {
    const created = await sql`
      INSERT INTO cms_media (filename, original_name, mime_type, size_bytes, url, alt_text, uploaded_by)
      VALUES (
        ${fileName},
        ${fileName},
        ${mimeType},
        ${buffer.length},
        ${dataUrl},
        ${altText || ''},
        ${req.user?.id || null}
      )
      RETURNING *
    `;
    await sql.end();

    await logCmsAuditEvent({
      actorId: req.user?.id,
      action: 'ADMIN_MEDIA_UPLOAD',
      targetType: 'MEDIA',
      targetId: created[0].id,
      details: { fileName, mimeType, sizeBytes: buffer.length },
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, data: created[0] });
  } catch (error: any) {
    console.error('Error saving uploaded media:', error);
    if (sql) await sql.end().catch(() => {});
    return res.status(500).json({ success: false, message: 'Failed to save uploaded file.' });
  }
}

/**
 * PATCH /api/cms/admin/media/:id
 * Update media metadata (Alt text)
 */
export async function updateAdminMedia(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { altText } = req.body;
  const sql = getDbClient();
  if (!sql) return res.status(500).json({ success: false, message: 'Database connection failure.' });

  try {
    const updated = await sql`
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

    await logCmsAuditEvent({
      actorId: req.user?.id,
      action: 'ADMIN_MEDIA_UPDATE',
      targetType: 'MEDIA',
      targetId: id,
      details: { altText },
      ipAddress: req.ip,
    });

    return res.json({ success: true, data: updated[0] });
  } catch (error: any) {
    console.error('Error updating media:', error);
    if (sql) await sql.end().catch(() => {});
    return res.status(500).json({ success: false, message: 'Failed to update media item.' });
  }
}

/**
 * DELETE /api/cms/admin/media/:id
 * Delete unused media asset with safety check
 */
export async function deleteAdminMedia(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const sql = getDbClient();
  if (!sql) return res.status(500).json({ success: false, message: 'Database connection failure.' });

  try {
    // 1. Safety Check: Verify if media is currently referenced by any cms_section_items
    const usageCheck = await sql`
      SELECT id, title FROM cms_section_items WHERE media_id = ${id} LIMIT 5
    `;

    if (usageCheck && usageCheck.length > 0) {
      await sql.end();
      const usedTitles = usageCheck.map(u => u.title).join(', ');
      return res.status(409).json({
        success: false,
        message: `Cannot delete media item. It is currently in use by section item(s): "${usedTitles}". Please replace or remove references first.`,
        referencedItems: usageCheck,
      });
    }

    // 2. Fetch filename for audit log
    const media = await sql`SELECT filename FROM cms_media WHERE id = ${id} LIMIT 1`;
    if (!media || media.length === 0) {
      await sql.end();
      return res.status(404).json({ success: false, message: 'Media item not found.' });
    }

    // 3. Delete from DB
    await sql`DELETE FROM cms_media WHERE id = ${id}`;
    await sql.end();

    await logCmsAuditEvent({
      actorId: req.user?.id,
      action: 'ADMIN_MEDIA_DELETE',
      targetType: 'MEDIA',
      targetId: id,
      details: { filename: media[0].filename },
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Media deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting media:', error);
    if (sql) await sql.end().catch(() => {});
    return res.status(500).json({ success: false, message: 'Failed to delete media item.' });
  }
}
