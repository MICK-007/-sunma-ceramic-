import { Response } from 'express';
import { getDbClient } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export interface AuditLogOptions {
  actorId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

export async function logCmsAuditEvent(options: AuditLogOptions) {
  const sql = getDbClient();
  if (!sql) return;

  try {
    await sql`
      INSERT INTO cms_audit_logs (actor_id, action, target_type, target_id, details, ip_address)
      VALUES (
        ${options.actorId || null},
        ${options.action},
        ${options.targetType},
        ${options.targetId || null},
        ${JSON.stringify(options.details || {})}::jsonb,
        ${options.ipAddress || null}
      )
    `;
    await sql.end();
  } catch (err) {
    console.error('⚠️ Failed to insert CMS Audit Log:', err);
    if (sql) await sql.end().catch(() => {});
  }
}

// ----------------------------------------------------
// PUBLIC CMS READ API
// ----------------------------------------------------

/**
 * GET /api/cms/pages/:slug
 * Retrieves published page structure, enabled sections, and enabled items for public rendering
 */
export async function getPublicPageBySlug(req: AuthenticatedRequest, res: Response) {
  const { slug } = req.params;
  const sql = getDbClient();
  if (!sql) {
    return res.status(500).json({ success: false, message: 'Database connection failure.' });
  }

  try {
    // 1. Fetch Latest Published Version Snapshot for Page
    const versionRows = await sql`
      SELECT content_payload, created_at
      FROM cms_section_versions
      WHERE page_id = (SELECT id FROM cms_pages WHERE slug = ${slug} AND is_published = true LIMIT 1)
        AND status = 'PUBLISHED'
      ORDER BY version_number DESC
      LIMIT 1
    `;

    if (!versionRows || versionRows.length === 0) {
      await sql.end();
      return res.status(404).json({ success: false, message: `Published content for page '${slug}' not found.` });
    }

    let payload = versionRows[0].content_payload;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        console.error('Failed to parse content_payload:', e);
      }
    }
    await sql.end();

    // Filter enabled sections and enabled items from the published snapshot
    const filteredSections = (payload.sections || [])
      .filter((sec: any) => sec.is_enabled)
      .map((sec: any) => {
        const secItems = (payload.items || []).filter((item: any) => item.section_id === sec.id && item.is_enabled);
        return {
          ...sec,
          items: secItems,
        };
      });

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    return res.json({
      success: true,
      data: {
        page: payload.page,
        sections: filteredSections,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public CMS page:', error);
    if (sql) await sql.end().catch(() => {});
    return res.status(500).json({ success: false, message: 'Failed to retrieve page content.' });
  }
}

// ----------------------------------------------------
// PROTECTED ADMIN CMS API
// ----------------------------------------------------

/**
 * GET /api/admin/cms/pages/:slug/draft
 * Retrieves complete page structure including disabled sections and draft items for Admin preview
 */
export async function getAdminPageDraftBySlug(req: AuthenticatedRequest, res: Response) {
  const { slug } = req.params;
  const sql = getDbClient();
  if (!sql) {
    return res.status(500).json({ success: false, message: 'Database connection failure.' });
  }

  try {
    const pageRows = await sql`
      SELECT id, slug, title, seo_title, seo_description, is_published, created_at, updated_at
      FROM cms_pages
      WHERE slug = ${slug}
      LIMIT 1
    `;

    if (!pageRows || pageRows.length === 0) {
      await sql.end();
      return res.status(404).json({ success: false, message: `Page '${slug}' not found.` });
    }
    const page = pageRows[0];

    const sectionRows = await sql`
      SELECT id, page_id, section_key, section_type, title, subtitle, sort_order, is_enabled, settings, version, updated_at
      FROM cms_sections
      WHERE page_id = ${page.id}
      ORDER BY sort_order ASC
    `;

    const sectionIds = sectionRows.map(s => s.id);
    let itemsBySectionId: Record<string, any[]> = {};

    if (sectionIds.length > 0) {
      const itemRows = await sql`
        SELECT 
          item.id, 
          item.section_id, 
          item.title, 
          item.subtitle, 
          item.description, 
          item.icon_name, 
          item.link_url, 
          item.link_label, 
          item.media_id, 
          COALESCE(m.url, item.custom_image_url) as custom_image_url, 
          item.badge_tag, 
          item.sort_order, 
          item.is_enabled, 
          item.metadata
        FROM cms_section_items item
        LEFT JOIN cms_media m ON item.media_id = m.id
        WHERE item.section_id IN ${sql(sectionIds)}
        ORDER BY item.sort_order ASC
      `;

      itemRows.forEach(item => {
        if (!itemsBySectionId[item.section_id]) {
          itemsBySectionId[item.section_id] = [];
        }
        itemsBySectionId[item.section_id].push(item);
      });
    }

    await sql.end();

    const sectionsWithItems = sectionRows.map(section => ({
      ...section,
      items: itemsBySectionId[section.id] || [],
    }));

    return res.json({
      success: true,
      data: {
        page,
        sections: sectionsWithItems,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin draft CMS page:', error);
    if (sql) await sql.end().catch(() => {});
    return res.status(500).json({ success: false, message: 'Failed to retrieve draft page content.' });
  }
}

/**
 * PUT /api/admin/cms/sections/reorder
 * Batch update section sort orders on a page
 */
export async function reorderAdminCmsSections(req: AuthenticatedRequest, res: Response) {
  const { pageSlug, sectionOrders } = req.body;
  const sql = getDbClient();
  if (!sql) {
    return res.status(500).json({ success: false, message: 'Database connection failure.' });
  }

  try {
    for (const item of sectionOrders) {
      await sql`
        UPDATE cms_sections
        SET sort_order = ${item.sortOrder}, updated_at = NOW()
        WHERE id = ${item.id}
      `;
    }

    await sql.end();

    // Log Audit Event
    await logCmsAuditEvent({
      actorId: req.user?.id,
      action: 'ADMIN_SECTION_REORDER',
      targetType: 'PAGE_SECTIONS',
      targetId: pageSlug,
      details: { sectionOrders },
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Sections reordered successfully.' });
  } catch (error: any) {
    console.error('Error reordering sections:', error);
    if (sql) await sql.end().catch(() => {});
    return res.status(500).json({ success: false, message: 'Failed to reorder sections.' });
  }
}

/**
 * PATCH /api/admin/cms/sections/:id
 * Update section title, subtitle, isEnabled, settings
 */
export async function updateAdminCmsSection(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const updates = req.body;
  const sql = getDbClient();
  if (!sql) {
    return res.status(500).json({ success: false, message: 'Database connection failure.' });
  }

  try {
    // Verify existence
    const existing = await sql`SELECT id, section_key, settings FROM cms_sections WHERE id = ${id} LIMIT 1`;
    if (!existing || existing.length === 0) {
      await sql.end();
      return res.status(404).json({ success: false, message: 'Section not found.' });
    }

    const existingSettings = typeof existing[0].settings === 'object' && existing[0].settings !== null
      ? existing[0].settings
      : {};
    const inputSettings = typeof updates.settings === 'object' && updates.settings !== null
      ? updates.settings
      : {};

    const mergedSettings = { ...existingSettings, ...inputSettings };

    const updated = await sql`
      UPDATE cms_sections
      SET
        title = COALESCE(${updates.title !== undefined ? updates.title : null}, title),
        subtitle = COALESCE(${updates.subtitle !== undefined ? updates.subtitle : null}, subtitle),
        is_enabled = COALESCE(${updates.isEnabled !== undefined ? updates.isEnabled : null}, is_enabled),
        sort_order = COALESCE(${updates.sortOrder !== undefined ? updates.sortOrder : null}, sort_order),
        settings = ${JSON.stringify(mergedSettings)}::jsonb,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    await sql.end();

    await logCmsAuditEvent({
      actorId: req.user?.id,
      action: 'ADMIN_SECTION_UPDATE',
      targetType: 'SECTION',
      targetId: id,
      details: { sectionKey: existing[0].section_key, updates },
      ipAddress: req.ip,
    });

    return res.json({ success: true, data: updated[0] });
  } catch (error: any) {
    console.error('Error updating section:', error);
    if (sql) await sql.end().catch(() => {});
    return res.status(500).json({ success: false, message: 'Failed to update section.' });
  }
}

/**
 * POST /api/admin/cms/sections/:id/items
 * Create a new item inside a section
 */
export async function createAdminCmsItem(req: AuthenticatedRequest, res: Response) {
  const { id: sectionId } = req.params;
  const itemData = req.body;
  const sql = getDbClient();
  if (!sql) {
    return res.status(500).json({ success: false, message: 'Database connection failure.' });
  }

  try {
    const existingSec = await sql`SELECT id FROM cms_sections WHERE id = ${sectionId} LIMIT 1`;
    if (!existingSec || existingSec.length === 0) {
      await sql.end();
      return res.status(404).json({ success: false, message: 'Section not found.' });
    }

    const created = await sql`
      INSERT INTO cms_section_items (
        section_id, title, subtitle, description, icon_name, link_url, link_label,
        media_id, custom_image_url, badge_tag, sort_order, is_enabled, metadata
      )
      VALUES (
        ${sectionId},
        ${itemData.title},
        ${itemData.subtitle || null},
        ${itemData.description || null},
        ${itemData.iconName || null},
        ${itemData.linkUrl || null},
        ${itemData.linkLabel || null},
        ${itemData.mediaId || null},
        ${itemData.customImageUrl || null},
        ${itemData.badgeTag || null},
        ${itemData.sortOrder ?? 0},
        ${itemData.isEnabled ?? true},
        ${JSON.stringify(itemData.metadata || {})}::jsonb
      )
      RETURNING id
    `;
    const newId = created[0].id;
    const fullCreatedItem = await sql`
      SELECT 
        item.id, 
        item.section_id, 
        item.title, 
        item.subtitle, 
        item.description, 
        item.icon_name, 
        item.link_url, 
        item.link_label, 
        item.media_id, 
        COALESCE(item.custom_image_url, m.url) as custom_image_url, 
        item.badge_tag, 
        item.sort_order, 
        item.is_enabled, 
        item.metadata
      FROM cms_section_items item
      LEFT JOIN cms_media m ON item.media_id = m.id
      WHERE item.id = ${newId}
      LIMIT 1
    `;

    await sql.end();

    await logCmsAuditEvent({
      actorId: req.user?.id,
      action: 'ADMIN_ITEM_CREATE',
      targetType: 'SECTION_ITEM',
      targetId: newId,
      details: { sectionId, title: itemData.title },
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, data: fullCreatedItem[0] });
  } catch (error: any) {
    console.error('Error creating section item:', error);
    if (sql) await sql.end().catch(() => {});
    return res.status(500).json({ success: false, message: 'Failed to create item.' });
  }
}

/**
 * PATCH /api/admin/cms/items/:id
 * Update a specific item
 */
export async function updateAdminCmsItem(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const updates = req.body;
  const sql = getDbClient();
  if (!sql) {
    return res.status(500).json({ success: false, message: 'Database connection failure.' });
  }

  try {
    const existing = await sql`SELECT id, section_id FROM cms_section_items WHERE id = ${id} LIMIT 1`;
    if (!existing || existing.length === 0) {
      await sql.end();
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    await sql`
      UPDATE cms_section_items
      SET
        title = COALESCE(${updates.title !== undefined ? updates.title : null}, title),
        subtitle = COALESCE(${updates.subtitle !== undefined ? updates.subtitle : null}, subtitle),
        description = COALESCE(${updates.description !== undefined ? updates.description : null}, description),
        icon_name = COALESCE(${updates.iconName !== undefined ? updates.iconName : null}, icon_name),
        link_url = COALESCE(${updates.linkUrl !== undefined ? updates.linkUrl : null}, link_url),
        link_label = COALESCE(${updates.linkLabel !== undefined ? updates.linkLabel : null}, link_label),
        media_id = ${updates.mediaId !== undefined ? updates.mediaId : sql`media_id`},
        custom_image_url = ${updates.customImageUrl !== undefined ? updates.customImageUrl : sql`custom_image_url`},
        badge_tag = COALESCE(${updates.badgeTag !== undefined ? updates.badgeTag : null}, badge_tag),
        sort_order = COALESCE(${updates.sortOrder !== undefined ? updates.sortOrder : null}, sort_order),
        is_enabled = COALESCE(${updates.isEnabled !== undefined ? updates.isEnabled : null}, is_enabled),
        updated_at = NOW()
      WHERE id = ${id}
    `;

    const fullUpdatedItem = await sql`
      SELECT 
        item.id, 
        item.section_id, 
        item.title, 
        item.subtitle, 
        item.description, 
        item.icon_name, 
        item.link_url, 
        item.link_label, 
        item.media_id, 
        COALESCE(item.custom_image_url, m.url) as custom_image_url, 
        item.badge_tag, 
        item.sort_order, 
        item.is_enabled, 
        item.metadata
      FROM cms_section_items item
      LEFT JOIN cms_media m ON item.media_id = m.id
      WHERE item.id = ${id}
      LIMIT 1
    `;

    await sql.end();

    await logCmsAuditEvent({
      actorId: req.user?.id,
      action: 'ADMIN_ITEM_UPDATE',
      targetType: 'SECTION_ITEM',
      targetId: id,
      details: { updates },
      ipAddress: req.ip,
    });

    return res.json({ success: true, data: fullUpdatedItem[0] });
  } catch (error: any) {
    console.error('Error updating item:', error);
    if (sql) await sql.end().catch(() => {});
    return res.status(500).json({ success: false, message: 'Failed to update item.' });
  }
}

/**
 * DELETE /api/admin/cms/items/:id
 * Delete a section item
 */
export async function deleteAdminCmsItem(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const sql = getDbClient();
  if (!sql) {
    return res.status(500).json({ success: false, message: 'Database connection failure.' });
  }

  try {
    const existing = await sql`SELECT id, section_id, title FROM cms_section_items WHERE id = ${id} LIMIT 1`;
    if (!existing || existing.length === 0) {
      await sql.end();
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    await sql`DELETE FROM cms_section_items WHERE id = ${id}`;
    await sql.end();

    await logCmsAuditEvent({
      actorId: req.user?.id,
      action: 'ADMIN_ITEM_DELETE',
      targetType: 'SECTION_ITEM',
      targetId: id,
      details: { title: existing[0].title, sectionId: existing[0].section_id },
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Item deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting item:', error);
    if (sql) await sql.end().catch(() => {});
    return res.status(500).json({ success: false, message: 'Failed to delete item.' });
  }
}

/**
 * POST /api/admin/cms/pages/:slug/publish
 * Performs Atomic Publish for a page, archiving previous versions and creating a new immutable snapshot.
 */
export async function publishAdminCmsPage(req: AuthenticatedRequest, res: Response) {
  const { slug } = req.params;
  const sql = getDbClient();
  if (!sql) {
    return res.status(500).json({ success: false, message: 'Database connection failure.' });
  }

  try {
    const pageRows = await sql`SELECT id, title FROM cms_pages WHERE slug = ${slug} LIMIT 1`;
    if (!pageRows || pageRows.length === 0) {
      await sql.end();
      return res.status(404).json({ success: false, message: `Page '${slug}' not found.` });
    }
    const pageId = pageRows[0].id;

    // 1. Fetch current Draft sections & items
    const sections = await sql`
      SELECT id, page_id, section_key, section_type, title, subtitle, sort_order, is_enabled, settings, version, updated_at
      FROM cms_sections
      WHERE page_id = ${pageId}
      ORDER BY sort_order ASC
    `;
    const sectionIds = sections.map(s => s.id);
    let items: any[] = [];
    if (sectionIds.length > 0) {
      items = await sql`
        SELECT 
          item.id, 
          item.section_id, 
          item.title, 
          item.subtitle, 
          item.description, 
          item.icon_name, 
          item.link_url, 
          item.link_label, 
          item.media_id, 
          COALESCE(m.url, item.custom_image_url) as custom_image_url, 
          item.badge_tag, 
          item.sort_order, 
          item.is_enabled, 
          item.metadata
        FROM cms_section_items item
        LEFT JOIN cms_media m ON item.media_id = m.id
        WHERE item.section_id IN ${sql(sectionIds)}
        ORDER BY item.sort_order ASC
      `;
    }

    // 2. Determine Next Atomic Page Version Number
    const latestVerRow = await sql`
      SELECT COALESCE(MAX(version_number), 0) as max_ver
      FROM cms_section_versions
      WHERE page_id = ${pageId}
    `;
    const nextVersionNumber = Number(latestVerRow[0].max_ver) + 1;

    // 3. Mark all old versions of this page as ARCHIVED
    await sql`
      UPDATE cms_section_versions
      SET status = 'ARCHIVED'
      WHERE page_id = ${pageId} AND status = 'PUBLISHED'
    `;

    // 4. Create Immutable Page-Level Version Snapshot
    const snapshotPayload = {
      page: pageRows[0],
      sections,
      items,
      publishedAt: new Date().toISOString(),
    };

    const newVersionRow = await sql`
      INSERT INTO cms_section_versions (page_id, version_number, status, content_payload, created_by)
      VALUES (${pageId}, ${nextVersionNumber}, 'PUBLISHED', ${JSON.stringify(snapshotPayload)}::jsonb, ${req.user?.id || null})
      RETURNING id, version_number, created_at
    `;

    // 5. Ensure page is marked published
    await sql`UPDATE cms_pages SET is_published = true, updated_at = NOW() WHERE id = ${pageId}`;

    await sql.end();

    // 6. Audit Log
    await logCmsAuditEvent({
      actorId: req.user?.id,
      action: 'ADMIN_CMS_PUBLISH',
      targetType: 'PAGE',
      targetId: slug,
      details: { versionNumber: nextVersionNumber, sectionCount: sections.length, itemCount: items.length },
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      message: `Page '${slug}' published successfully to Version v${nextVersionNumber}.`,
      data: { versionNumber: nextVersionNumber, publishedAt: newVersionRow[0].created_at },
    });
  } catch (error: any) {
    console.error('Error during atomic publish:', error);
    if (sql) await sql.end().catch(() => {});
    return res.status(500).json({ success: false, message: 'Failed to publish page.' });
  }
}

/**
 * GET /api/admin/cms/pages/:slug/versions
 * List all historical published versions for a page
 */
export async function getAdminCmsPageVersions(req: AuthenticatedRequest, res: Response) {
  const { slug } = req.params;
  const sql = getDbClient();
  if (!sql) {
    return res.status(500).json({ success: false, message: 'Database connection failure.' });
  }

  try {
    const pageRows = await sql`SELECT id FROM cms_pages WHERE slug = ${slug} LIMIT 1`;
    if (!pageRows || pageRows.length === 0) {
      await sql.end();
      return res.status(404).json({ success: false, message: `Page '${slug}' not found.` });
    }
    const pageId = pageRows[0].id;

    const versions = await sql`
      SELECT v.id, v.version_number, v.status, v.created_at, v.created_by, p.full_name as author_name, p.email as author_email
      FROM cms_section_versions v
      LEFT JOIN profiles p ON v.created_by = p.id
      WHERE v.page_id = ${pageId}
      ORDER BY v.version_number DESC
    `;

    await sql.end();
    return res.json({ success: true, data: versions });
  } catch (error: any) {
    console.error('Error fetching versions:', error);
    if (sql) await sql.end().catch(() => {});
    return res.status(500).json({ success: false, message: 'Failed to retrieve version history.' });
  }
}

/**
 * POST /api/admin/cms/pages/:slug/rollback
 * Rollback page to a target version number by creating a NEW Version (vNext) containing the target snapshot
 */
export async function rollbackAdminCmsPage(req: AuthenticatedRequest, res: Response) {
  const { slug } = req.params;
  const { versionNumber } = req.body;
  const sql = getDbClient();
  if (!sql) {
    return res.status(500).json({ success: false, message: 'Database connection failure.' });
  }

  try {
    const pageRows = await sql`SELECT id, title FROM cms_pages WHERE slug = ${slug} LIMIT 1`;
    if (!pageRows || pageRows.length === 0) {
      await sql.end();
      return res.status(404).json({ success: false, message: `Page '${slug}' not found.` });
    }
    const pageId = pageRows[0].id;

    // 1. Fetch Target Version Snapshot (Immutable)
    const targetVer = await sql`
      SELECT id, version_number, content_payload
      FROM cms_section_versions
      WHERE page_id = ${pageId} AND version_number = ${versionNumber}
      LIMIT 1
    `;

    if (!targetVer || targetVer.length === 0) {
      await sql.end();
      return res.status(404).json({ success: false, message: `Version v${versionNumber} not found.` });
    }

    const snapshot = targetVer[0].content_payload;
    const targetSections = snapshot.sections || [];
    const targetItems = snapshot.items || [];

    // 2. Restore Draft tables (cms_sections & cms_section_items) from target snapshot
    for (const sec of targetSections) {
      await sql`
        UPDATE cms_sections
        SET
          title = ${sec.title || null},
          subtitle = ${sec.subtitle || null},
          sort_order = ${sec.sort_order ?? 0},
          is_enabled = ${sec.is_enabled !== false},
          settings = ${JSON.stringify(sec.settings || {})}::jsonb,
          updated_at = NOW()
        WHERE id = ${sec.id}
      `;
    }

    // 3. Determine Next Version Number
    const latestVerRow = await sql`
      SELECT COALESCE(MAX(version_number), 0) as max_ver
      FROM cms_section_versions
      WHERE page_id = ${pageId}
    `;
    const nextVersionNumber = Number(latestVerRow[0].max_ver) + 1;

    // 4. Archive current active published version
    await sql`
      UPDATE cms_section_versions
      SET status = 'ARCHIVED'
      WHERE page_id = ${pageId} AND status = 'PUBLISHED'
    `;

    // 5. Create NEW Published Version (vNext) containing the rollback payload
    const rollbackPayload = {
      ...snapshot,
      rollbackFromVersion: versionNumber,
      publishedAt: new Date().toISOString(),
    };

    await sql`
      INSERT INTO cms_section_versions (page_id, version_number, status, content_payload, created_by)
      VALUES (${pageId}, ${nextVersionNumber}, 'PUBLISHED', ${JSON.stringify(rollbackPayload)}::jsonb, ${req.user?.id || null})
    `;

    await sql.end();

    // 6. Audit Log
    await logCmsAuditEvent({
      actorId: req.user?.id,
      action: 'ADMIN_CMS_ROLLBACK',
      targetType: 'PAGE',
      targetId: slug,
      details: { targetVersion: versionNumber, newVersionNumber: nextVersionNumber },
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      message: `Page '${slug}' successfully rolled back to Version v${versionNumber} (Created new Published Version v${nextVersionNumber}).`,
      data: { versionNumber: nextVersionNumber, restoredFromVersion: versionNumber },
    });
  } catch (error: any) {
    console.error('Error during rollback:', error);
    if (sql) await sql.end().catch(() => {});
    return res.status(500).json({ success: false, message: 'Failed to rollback page.' });
  }
}

/**
 * GET /api/admin/cms/audit-logs
 * Fetch CMS Audit Logs
 */
export async function getAdminCmsAuditLogs(req: AuthenticatedRequest, res: Response) {
  const sql = getDbClient();
  if (!sql) {
    return res.status(500).json({ success: false, message: 'Database connection failure.' });
  }

  try {
    const logs = await sql`
      SELECT l.id, l.actor_id, p.full_name as actor_name, p.email as actor_email, l.action, l.target_type, l.target_id, l.details, l.ip_address, l.created_at
      FROM cms_audit_logs l
      LEFT JOIN profiles p ON l.actor_id = p.id
      ORDER BY l.created_at DESC
      LIMIT 100
    `;

    await sql.end();

    return res.json({ success: true, data: logs });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    if (sql) await sql.end().catch(() => {});
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
  }
}

