"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollections = exports.getBrands = exports.getCategories = exports.getProductBySlug = exports.getProducts = void 0;
const store_1 = require("../repositories/store");
const getProducts = (req, res) => {
    let list = [...store_1.store.products].filter(p => p.status === 'PUBLISHED');
    const { search, category, brand, collection, size, color, surface, material, indoorOutdoor, countryOfOrigin, sort, featured, page = 1, limit = 12, } = req.query;
    // Search filter (Product code, name, description, color, pattern, size)
    if (search && typeof search === 'string' && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        list = list.filter(p => p.name.toLowerCase().includes(q) ||
            (p.nameTh && p.nameTh.toLowerCase().includes(q)) ||
            p.productCode.toLowerCase().includes(q) ||
            (p.brandName && p.brandName.toLowerCase().includes(q)) ||
            (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
            p.color.toLowerCase().includes(q) ||
            p.size.toLowerCase().includes(q) ||
            p.pattern.toLowerCase().includes(q));
    }
    // Category filter (slug or ID)
    if (category && typeof category === 'string') {
        const cat = store_1.store.categories.find(c => c.slug === category || c.id === category);
        if (cat) {
            list = list.filter(p => p.categoryId === cat.id);
        }
    }
    // Brand filter
    if (brand && typeof brand === 'string') {
        const b = store_1.store.brands.find(br => br.slug === brand || br.id === brand);
        if (b) {
            list = list.filter(p => p.brandId === b.id);
        }
    }
    // Collection filter
    if (collection && typeof collection === 'string') {
        const col = store_1.store.collections.find(c => c.slug === collection || c.id === collection);
        if (col) {
            list = list.filter(p => p.collectionId === col.id);
        }
    }
    // Size filter
    if (size && typeof size === 'string') {
        list = list.filter(p => p.size === size);
    }
    // Color filter
    if (color && typeof color === 'string') {
        list = list.filter(p => p.color.toLowerCase().includes(color.toLowerCase()));
    }
    // Surface filter
    if (surface && typeof surface === 'string') {
        list = list.filter(p => p.surface.toLowerCase() === surface.toLowerCase());
    }
    // Material filter
    if (material && typeof material === 'string') {
        list = list.filter(p => p.material.toLowerCase() === material.toLowerCase());
    }
    // Indoor / Outdoor filter
    if (indoorOutdoor && typeof indoorOutdoor === 'string') {
        list = list.filter(p => p.indoorOutdoor.toLowerCase().includes(indoorOutdoor.toLowerCase()));
    }
    // Country filter
    if (countryOfOrigin && typeof countryOfOrigin === 'string') {
        list = list.filter(p => p.countryOfOrigin.toLowerCase() === countryOfOrigin.toLowerCase());
    }
    // Featured filter
    if (featured === 'true') {
        list = list.filter(p => p.featured);
    }
    // Sorting
    if (sort === 'price_asc') {
        list.sort((a, b) => a.pricePerPiece - b.pricePerPiece);
    }
    else if (sort === 'price_desc') {
        list.sort((a, b) => b.pricePerPiece - a.pricePerPiece);
    }
    else if (sort === 'newest') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    else if (sort === 'popular') {
        list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const total = list.length;
    const totalPages = Math.ceil(total / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedList = list.slice(startIndex, startIndex + limitNum);
    return res.json({
        success: true,
        data: paginatedList,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages,
        },
    });
};
exports.getProducts = getProducts;
const getProductBySlug = (req, res) => {
    const { slug } = req.params;
    const product = store_1.store.products.find(p => p.slug === slug || p.id === slug);
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.json({ success: true, data: product });
};
exports.getProductBySlug = getProductBySlug;
const getCategories = (req, res) => {
    const categories = store_1.store.categories.filter(c => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
    return res.json({ success: true, data: categories });
};
exports.getCategories = getCategories;
const getBrands = (req, res) => {
    const brands = store_1.store.brands.filter(b => b.isActive);
    return res.json({ success: true, data: brands });
};
exports.getBrands = getBrands;
const getCollections = (req, res) => {
    const collections = store_1.store.collections.filter(c => c.isActive);
    return res.json({ success: true, data: collections });
};
exports.getCollections = getCollections;
