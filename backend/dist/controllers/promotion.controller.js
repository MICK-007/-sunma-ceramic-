"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPromotions = void 0;
const store_1 = require("../repositories/store");
const getPromotions = (req, res) => {
    const active = store_1.store.promotions.filter(p => p.isActive);
    // Whitelist public fields only! Exclude internal admin limits/budgets/notes.
    const publicPromotions = active.map(p => ({
        id: p.id,
        code: p.code,
        title: p.title || p.name,
        description: p.description,
        discountPercentage: p.discountPercentage,
        discountAmount: p.discountAmount,
        minPurchaseAmount: p.minPurchaseAmount,
        maxDiscountAmount: p.maxDiscountAmount,
        startDate: p.startDate,
        endDate: p.endDate,
        bannerUrl: p.bannerUrl,
    }));
    return res.json({ success: true, data: publicPromotions });
};
exports.getPromotions = getPromotions;
