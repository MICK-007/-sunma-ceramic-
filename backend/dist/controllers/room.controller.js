"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomBySlug = exports.getRooms = void 0;
const store_1 = require("../repositories/store");
const getRooms = (req, res) => {
    return res.json({ success: true, data: store_1.store.rooms });
};
exports.getRooms = getRooms;
const getRoomBySlug = (req, res) => {
    const { slug } = req.params;
    const room = store_1.store.rooms.find(r => r.slug === slug || r.id === slug);
    if (!room) {
        return res.status(404).json({ success: false, message: 'Room simulation preset not found.' });
    }
    return res.json({ success: true, data: room });
};
exports.getRoomBySlug = getRoomBySlug;
