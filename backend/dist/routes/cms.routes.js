"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cms_controller_1 = require("../controllers/cms.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const cms_schema_1 = require("../schemas/cms.schema");
const media_schema_1 = require("../schemas/media.schema");
const media_controller_1 = require("../controllers/media.controller");
const router = (0, express_1.Router)();
// ==========================================
// 1. PUBLIC READ API (No Auth Required)
// ==========================================
router.get('/public/pages/:slug', (0, validate_1.validateParams)(cms_schema_1.cmsSlugParamSchema), cms_controller_1.getPublicPageBySlug);
router.get('/public/media/file/:filename', media_controller_1.servePublicMediaFile);
// ==========================================
// 2. PROTECTED ADMIN CMS API
// Require authenticated user + real-time DB admin role check
// ==========================================
router.use('/admin', auth_1.authenticateUser, auth_1.requireAdmin);
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});
// Media Library Endpoints
router.get('/admin/media', media_controller_1.getAdminMedia);
router.post('/admin/media/upload', upload.single('file'), media_controller_1.uploadAdminMedia);
router.patch('/admin/media/:id', (0, validate_1.validateParams)(media_schema_1.mediaIdParamSchema), (0, validate_1.validateBody)(media_schema_1.updateCmsMediaSchema), media_controller_1.updateAdminMedia);
router.delete('/admin/media/:id', (0, validate_1.validateParams)(media_schema_1.mediaIdParamSchema), media_controller_1.deleteAdminMedia);
// Fetch Draft Content for Preview
router.get('/admin/pages/:slug/draft', (0, validate_1.validateParams)(cms_schema_1.cmsSlugParamSchema), cms_controller_1.getAdminPageDraftBySlug);
// Reorder Sections Batch
router.put('/admin/sections/reorder', (0, validate_1.validateBody)(cms_schema_1.reorderCmsSectionsSchema), cms_controller_1.reorderAdminCmsSections);
// Update Section Properties
router.patch('/admin/sections/:id', (0, validate_1.validateParams)(cms_schema_1.cmsSectionIdParamSchema), (0, validate_1.validateBody)(cms_schema_1.updateCmsSectionSchema), cms_controller_1.updateAdminCmsSection);
// Create Item in Section
router.post('/admin/sections/:id/items', (0, validate_1.validateParams)(cms_schema_1.cmsSectionIdParamSchema), (0, validate_1.validateBody)(cms_schema_1.createCmsItemSchema), cms_controller_1.createAdminCmsItem);
// Update Item
router.patch('/admin/items/:id', (0, validate_1.validateParams)(cms_schema_1.cmsItemIdParamSchema), (0, validate_1.validateBody)(cms_schema_1.updateCmsItemSchema), cms_controller_1.updateAdminCmsItem);
// Delete Item
router.delete('/admin/items/:id', (0, validate_1.validateParams)(cms_schema_1.cmsItemIdParamSchema), cms_controller_1.deleteAdminCmsItem);
// Publish Page
router.post('/admin/pages/:slug/publish', (0, validate_1.validateParams)(cms_schema_1.cmsSlugParamSchema), cms_controller_1.publishAdminCmsPage);
// Version History & Rollback Endpoints
router.get('/admin/pages/:slug/versions', (0, validate_1.validateParams)(cms_schema_1.cmsSlugParamSchema), cms_controller_1.getAdminCmsPageVersions);
router.post('/admin/pages/:slug/rollback', (0, validate_1.validateParams)(cms_schema_1.cmsSlugParamSchema), (0, validate_1.validateBody)(cms_schema_1.rollbackCmsVersionSchema), cms_controller_1.rollbackAdminCmsPage);
// Audit Logs
router.get('/admin/audit-logs', cms_controller_1.getAdminCmsAuditLogs);
exports.default = router;
