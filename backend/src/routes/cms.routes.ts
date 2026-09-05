import { Router } from 'express';
import {
  getPublicPageBySlug,
  getAdminPageDraftBySlug,
  reorderAdminCmsSections,
  updateAdminCmsSection,
  createAdminCmsItem,
  updateAdminCmsItem,
  deleteAdminCmsItem,
  publishAdminCmsPage,
  getAdminCmsPageVersions,
  rollbackAdminCmsPage,
  getAdminCmsAuditLogs,
} from '../controllers/cms.controller';
import { authenticateUser, requireAdmin } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validate';
import {
  cmsSlugParamSchema,
  cmsSectionIdParamSchema,
  cmsItemIdParamSchema,
  updateCmsSectionSchema,
  reorderCmsSectionsSchema,
  createCmsItemSchema,
  updateCmsItemSchema,
  rollbackCmsVersionSchema,
} from '../schemas/cms.schema';
import { mediaIdParamSchema, updateCmsMediaSchema } from '../schemas/media.schema';
import {
  getAdminMedia,
  uploadAdminMedia,
  updateAdminMedia,
  deleteAdminMedia,
  servePublicMediaFile,
} from '../controllers/media.controller';

const router = Router();

// ==========================================
// 1. PUBLIC READ API (No Auth Required)
// ==========================================
router.get('/public/pages/:slug', validateParams(cmsSlugParamSchema), getPublicPageBySlug);
router.get('/public/media/file/:filename', servePublicMediaFile);

// ==========================================
// 2. PROTECTED ADMIN CMS API
// Require authenticated user + real-time DB admin role check
// ==========================================
router.use('/admin', authenticateUser, requireAdmin);

import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Media Library Endpoints
router.get('/admin/media', getAdminMedia);
router.post('/admin/media/upload', upload.single('file'), uploadAdminMedia);
router.patch('/admin/media/:id', validateParams(mediaIdParamSchema), validateBody(updateCmsMediaSchema), updateAdminMedia);
router.delete('/admin/media/:id', validateParams(mediaIdParamSchema), deleteAdminMedia);

// Fetch Draft Content for Preview
router.get('/admin/pages/:slug/draft', validateParams(cmsSlugParamSchema), getAdminPageDraftBySlug);

// Reorder Sections Batch
router.put('/admin/sections/reorder', validateBody(reorderCmsSectionsSchema), reorderAdminCmsSections);

// Update Section Properties
router.patch('/admin/sections/:id', validateParams(cmsSectionIdParamSchema), validateBody(updateCmsSectionSchema), updateAdminCmsSection);

// Create Item in Section
router.post('/admin/sections/:id/items', validateParams(cmsSectionIdParamSchema), validateBody(createCmsItemSchema), createAdminCmsItem);

// Update Item
router.patch('/admin/items/:id', validateParams(cmsItemIdParamSchema), validateBody(updateCmsItemSchema), updateAdminCmsItem);

// Delete Item
router.delete('/admin/items/:id', validateParams(cmsItemIdParamSchema), deleteAdminCmsItem);

// Publish Page
router.post('/admin/pages/:slug/publish', validateParams(cmsSlugParamSchema), publishAdminCmsPage);

// Version History & Rollback Endpoints
router.get('/admin/pages/:slug/versions', validateParams(cmsSlugParamSchema), getAdminCmsPageVersions);
router.post('/admin/pages/:slug/rollback', validateParams(cmsSlugParamSchema), validateBody(rollbackCmsVersionSchema), rollbackAdminCmsPage);

// Audit Logs
router.get('/admin/audit-logs', getAdminCmsAuditLogs);

export default router;
