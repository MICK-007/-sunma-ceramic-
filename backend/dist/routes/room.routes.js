"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const room_controller_1 = require("../controllers/room.controller");
const router = (0, express_1.Router)();
router.get('/', room_controller_1.getRooms);
router.get('/:slug', room_controller_1.getRoomBySlug);
exports.default = router;
