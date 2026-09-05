"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const router = (0, express_1.Router)();
router.get('/', product_controller_1.getProducts);
router.get('/slug/:slug', product_controller_1.getProductBySlug);
router.get('/:slug', product_controller_1.getProductBySlug);
exports.default = router;
