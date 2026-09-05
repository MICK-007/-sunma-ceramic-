"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', product_controller_1.getCategories);
router.get('/collections', product_controller_1.getCollections);
// Admin Category Management
router.post('/', auth_1.authenticateUser, auth_1.requireAdmin, admin_controller_1.createAdminCategory);
router.put('/:id', auth_1.authenticateUser, auth_1.requireAdmin, admin_controller_1.updateAdminCategory);
router.patch('/:id', auth_1.authenticateUser, auth_1.requireAdmin, admin_controller_1.updateAdminCategory);
router.delete('/:id', auth_1.authenticateUser, auth_1.requireAdmin, admin_controller_1.deleteAdminCategory);
exports.default = router;
