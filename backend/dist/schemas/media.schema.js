"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCmsMediaSchema = exports.mediaIdParamSchema = void 0;
const zod_1 = require("zod");
exports.mediaIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid media UUID format'),
});
exports.updateCmsMediaSchema = zod_1.z.object({
    altText: zod_1.z.string().max(255).optional(),
}).strict();
