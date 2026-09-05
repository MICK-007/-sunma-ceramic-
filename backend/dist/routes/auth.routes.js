"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const auth_schema_1 = require("../schemas/auth.schema");
const router = (0, express_1.Router)();
// Rate limiting temporarily disabled on auth routes per user directive
router.post('/login', (0, validate_1.validateBody)(auth_schema_1.loginSchema), auth_controller_1.login);
router.post('/register', (0, validate_1.validateBody)(auth_schema_1.registerSchema), auth_controller_1.register);
router.post('/refresh', auth_controller_1.refresh);
router.get('/me', auth_1.authenticateUser, auth_controller_1.me);
router.post('/logout', auth_controller_1.logout);
exports.default = router;
