"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanySettings = exports.getCompanySettings = exports.updateShopFilters = exports.getShopFilters = exports.createAdminBrand = exports.deleteAdminCategory = exports.updateAdminCategory = exports.createAdminCategory = exports.updateAdminPromotion = exports.createAdminPromotion = exports.getAdminPromotions = exports.getAdminInventory = exports.getAdminCustomers = exports.updateOrderStatus = exports.getAdminOrders = exports.deleteAdminProduct = exports.toggleAdminProductSoldOut = exports.updateAdminProduct = exports.createAdminProduct = exports.getAdminProducts = exports.getDashboardStats = void 0;
const store_1 = require("../repositories/store");
const logger_1 = require("../utils/logger");
const db_1 = require("../db");
const getDashboardStats = (req, res) => {
    const totalSales = store_1.store.orders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = store_1.store.orders.length;
    const totalCustomers = store_1.store.users.filter(u => u.role === 'USER').length;
    const totalProducts = store_1.store.products.length;
    const soldOutCount = store_1.store.products.filter(p => p.isSoldOut || p.status === 'SOLD_OUT').length;
    const recentOrders = store_1.store.orders.slice(0, 5);
    const bestSellers = store_1.store.products.filter(p => p.featured).slice(0, 4);
    return res.json({
        success: true,
        data: {
            totalSales,
            totalOrders,
            totalCustomers,
            totalProducts,
            soldOutCount,
            lowStockCount: soldOutCount,
            recentOrders,
            bestSellers,
            revenueChart: [
                { month: 'Jan', revenue: 145000 },
                { month: 'Feb', revenue: 210000 },
                { month: 'Mar', revenue: 180000 },
                { month: 'Apr', revenue: 260000 },
                { month: 'May', revenue: 320000 },
                { month: 'Jun', revenue: 290000 },
                { month: 'Jul', revenue: 410000 },
                { month: 'Aug', revenue: totalSales || 480000 },
            ],
        },
    });
};
exports.getDashboardStats = getDashboardStats;
// Admin Products CRUD
const getAdminProducts = (req, res) => {
    return res.json({ success: true, data: store_1.store.products });
};
exports.getAdminProducts = getAdminProducts;
const createAdminProduct = (req, res) => {
    // Explicit Field Destructuring (Mass Assignment Prevention)
    const { name, nameTh, productCode, slug, description, descriptionTh, shortDescription, shortDescriptionTh, categoryId, brandId, thumbnail, images, size, width, height, thickness, material, surface, color, pattern, indoorOutdoor, countryOfOrigin, piecesPerBox, coveragePerBox, weightPerBox, pricePerPiece, pricePerBox, stockPieces, status, featured } = req.body;
    if (!name || !productCode || !categoryId || !pricePerPiece) {
        return res.status(400).json({ success: false, message: 'Missing required product parameters.' });
    }
    const category = store_1.store.categories.find(c => c.id === categoryId);
    const brand = store_1.store.brands.find(b => b.id === brandId);
    const newProduct = {
        id: `prod-${Date.now()}`,
        productCode,
        name,
        nameTh: nameTh || name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: description || '',
        descriptionTh: descriptionTh || '',
        shortDescription: shortDescription || '',
        shortDescriptionTh: shortDescriptionTh || '',
        categoryId,
        categoryName: category?.name || 'General',
        brandId,
        brandName: brand?.name || 'SUNMA Atelier',
        thumbnail: thumbnail || '/images/tiles/calacatta-marble.jpeg',
        images: images && images.length > 0 ? images : ['/images/tiles/calacatta-marble.jpeg'],
        size: size || '60x60',
        width: width || 60,
        height: height || 60,
        thickness: thickness || 10,
        material: material || 'Porcelain',
        surface: surface || 'Matt',
        color: color || 'Stone',
        pattern: pattern || 'Marble',
        indoorOutdoor: indoorOutdoor || 'Indoor',
        countryOfOrigin: countryOfOrigin || 'Thailand',
        piecesPerBox: Number(piecesPerBox) || 4,
        coveragePerBox: Number(coveragePerBox) || 1.44,
        weightPerBox: Number(weightPerBox) || 30.0,
        pricePerPiece: Number(pricePerPiece),
        pricePerBox: Number(pricePerBox) || Number(pricePerPiece) * (Number(piecesPerBox) || 4),
        minimumOrderQuantity: 1,
        status: status || 'PUBLISHED',
        isSoldOut: status === 'SOLD_OUT' || !!req.body.isSoldOut,
        featured: !!featured,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    store_1.store.products.unshift(newProduct);
    (0, logger_1.logSecurityEvent)('ADMIN_PRODUCT_CREATE', req.user?.id || null, req, { productId: newProduct.id, productCode: newProduct.productCode });
    return res.status(201).json({ success: true, message: 'Product created successfully.', data: newProduct });
};
exports.createAdminProduct = createAdminProduct;
const updateAdminProduct = (req, res) => {
    const { id } = req.params;
    const index = store_1.store.products.findIndex(p => p.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    const existing = store_1.store.products[index];
    const { name, nameTh, productCode, slug, description, descriptionTh, shortDescription, shortDescriptionTh, categoryId, brandId, thumbnail, images, size, width, height, thickness, material, surface, color, pattern, indoorOutdoor, countryOfOrigin, piecesPerBox, coveragePerBox, weightPerBox, pricePerPiece, pricePerBox, status, isSoldOut, featured } = req.body;
    const category = categoryId ? store_1.store.categories.find(c => c.id === categoryId) : null;
    const brand = brandId ? store_1.store.brands.find(b => b.id === brandId) : null;
    let resolvedStatus = status !== undefined ? status : existing.status;
    let resolvedSoldOut = isSoldOut !== undefined ? !!isSoldOut : existing.isSoldOut;
    if (isSoldOut === true) {
        resolvedStatus = 'SOLD_OUT';
        resolvedSoldOut = true;
    }
    else if (isSoldOut === false && resolvedStatus === 'SOLD_OUT') {
        resolvedStatus = 'PUBLISHED';
        resolvedSoldOut = false;
    }
    else if (status === 'SOLD_OUT') {
        resolvedSoldOut = true;
    }
    else if (status === 'PUBLISHED') {
        resolvedSoldOut = false;
    }
    const updatedProduct = {
        ...existing,
        name: name !== undefined ? name : existing.name,
        nameTh: nameTh !== undefined ? nameTh : existing.nameTh,
        productCode: productCode !== undefined ? productCode : existing.productCode,
        slug: slug !== undefined ? slug : existing.slug,
        description: description !== undefined ? description : existing.description,
        descriptionTh: descriptionTh !== undefined ? descriptionTh : existing.descriptionTh,
        shortDescription: shortDescription !== undefined ? shortDescription : existing.shortDescription,
        shortDescriptionTh: shortDescriptionTh !== undefined ? shortDescriptionTh : existing.shortDescriptionTh,
        categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
        categoryName: category ? category.name : existing.categoryName,
        brandId: brandId !== undefined ? brandId : existing.brandId,
        brandName: brand ? brand.name : existing.brandName,
        thumbnail: thumbnail !== undefined ? thumbnail : existing.thumbnail,
        images: images !== undefined ? images : existing.images,
        size: size !== undefined ? size : existing.size,
        width: width !== undefined ? Number(width) : existing.width,
        height: height !== undefined ? Number(height) : existing.height,
        thickness: thickness !== undefined ? Number(thickness) : existing.thickness,
        material: material !== undefined ? material : existing.material,
        surface: surface !== undefined ? surface : existing.surface,
        color: color !== undefined ? color : existing.color,
        pattern: pattern !== undefined ? pattern : existing.pattern,
        indoorOutdoor: indoorOutdoor !== undefined ? indoorOutdoor : existing.indoorOutdoor,
        countryOfOrigin: countryOfOrigin !== undefined ? countryOfOrigin : existing.countryOfOrigin,
        piecesPerBox: piecesPerBox !== undefined ? Number(piecesPerBox) : existing.piecesPerBox,
        coveragePerBox: coveragePerBox !== undefined ? Number(coveragePerBox) : existing.coveragePerBox,
        weightPerBox: weightPerBox !== undefined ? Number(weightPerBox) : existing.weightPerBox,
        pricePerPiece: pricePerPiece !== undefined ? Number(pricePerPiece) : existing.pricePerPiece,
        pricePerBox: pricePerBox !== undefined ? Number(pricePerBox) : existing.pricePerBox,
        status: resolvedStatus,
        isSoldOut: resolvedSoldOut,
        featured: featured !== undefined ? !!featured : existing.featured,
        updatedAt: new Date().toISOString(),
    };
    store_1.store.products[index] = updatedProduct;
    (0, logger_1.logSecurityEvent)('ADMIN_PRODUCT_UPDATE', req.user?.id || null, req, { productId: id });
    return res.json({ success: true, message: 'Product updated successfully.', data: updatedProduct });
};
exports.updateAdminProduct = updateAdminProduct;
const toggleAdminProductSoldOut = (req, res) => {
    const { id } = req.params;
    const index = store_1.store.products.findIndex(p => p.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    const existing = store_1.store.products[index];
    const newSoldOut = !existing.isSoldOut;
    existing.isSoldOut = newSoldOut;
    existing.status = newSoldOut ? 'SOLD_OUT' : 'PUBLISHED';
    existing.updatedAt = new Date().toISOString();
    store_1.store.products[index] = existing;
    (0, logger_1.logSecurityEvent)('ADMIN_PRODUCT_TOGGLE_SOLDOUT', req.user?.id || null, req, { productId: id, isSoldOut: newSoldOut });
    return res.json({
        success: true,
        message: newSoldOut ? 'สินค้าถูกตั้งเป็น "สินค้าหมด (Sold Out)" แล้ว' : 'สินค้าถูกเปิดขายตามปกติ (Active) แล้ว',
        data: existing,
    });
};
exports.toggleAdminProductSoldOut = toggleAdminProductSoldOut;
const deleteAdminProduct = (req, res) => {
    const { id } = req.params;
    store_1.store.products = store_1.store.products.filter(p => p.id !== id);
    (0, logger_1.logSecurityEvent)('ADMIN_PRODUCT_DELETE', req.user?.id || null, req, { productId: id });
    return res.json({ success: true, message: 'Product deleted.' });
};
exports.deleteAdminProduct = deleteAdminProduct;
// Admin Orders
const getAdminOrders = (req, res) => {
    return res.json({ success: true, data: store_1.store.orders });
};
exports.getAdminOrders = getAdminOrders;
const updateOrderStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }
    const order = store_1.store.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    order.status = status;
    order.updatedAt = new Date().toISOString();
    (0, logger_1.logSecurityEvent)('ADMIN_ORDER_STATUS_UPDATE', req.user?.id || null, req, { orderId: id, newStatus: status });
    return res.json({ success: true, message: `Order status updated to ${status}.`, data: order });
};
exports.updateOrderStatus = updateOrderStatus;
// Admin Customers
const getAdminCustomers = (req, res) => {
    const customers = store_1.store.users.map(u => {
        const userOrders = store_1.store.orders.filter(o => o.userId === u.id || o.userEmail === u.email);
        const totalSpent = userOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        return {
            id: u.id,
            email: u.email,
            fullName: u.fullName,
            phone: u.phone,
            role: u.role,
            ordersCount: userOrders.length,
            totalSpent,
            createdAt: u.createdAt,
        };
    });
    return res.json({ success: true, data: customers });
};
exports.getAdminCustomers = getAdminCustomers;
// Admin Inventory / Catalog Status
const getAdminInventory = (req, res) => {
    const inventory = store_1.store.products.map(p => ({
        id: p.id,
        productCode: p.productCode,
        name: p.name,
        nameTh: p.nameTh,
        size: p.size,
        isSoldOut: !!p.isSoldOut,
        status: p.status,
        pricePerPiece: p.pricePerPiece,
        pricePerBox: p.pricePerBox,
        piecesPerBox: p.piecesPerBox,
    }));
    return res.json({ success: true, data: inventory });
};
exports.getAdminInventory = getAdminInventory;
// Admin Promotions
const getAdminPromotions = (req, res) => {
    return res.json({ success: true, data: store_1.store.promotions });
};
exports.getAdminPromotions = getAdminPromotions;
const createAdminPromotion = (req, res) => {
    const { code, title, description, discountPercentage, discountAmount, minPurchaseAmount, maxDiscountAmount, startDate, endDate, isActive, minQuantity, categoryIds } = req.body;
    const newPromo = {
        id: `promo-${Date.now()}`,
        code: code || `PROMO-${Date.now()}`,
        name: title || 'Promotion',
        title: title || 'Special Offer',
        description: description || '',
        discountPercentage: Number(discountPercentage) || 0,
        discountAmount: Number(discountAmount) || 0,
        minPurchaseAmount: Number(minPurchaseAmount) || 0,
        maxDiscountAmount: Number(maxDiscountAmount) || 0,
        startDate: startDate || new Date().toISOString(),
        endDate: endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
        isActive: isActive !== undefined ? !!isActive : true,
        minQuantity: Number(minQuantity) || 1,
        categoryIds: categoryIds || [],
    };
    store_1.store.promotions.push(newPromo);
    return res.status(201).json({ success: true, message: 'Promotion created.', data: newPromo });
};
exports.createAdminPromotion = createAdminPromotion;
const updateAdminPromotion = (req, res) => {
    const { id } = req.params;
    const index = store_1.store.promotions.findIndex(p => p.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Promotion not found.' });
    }
    const existing = store_1.store.promotions[index];
    const { code, title, description, discountPercentage, discountAmount, minPurchaseAmount, maxDiscountAmount, startDate, endDate, isActive, minQuantity, categoryIds } = req.body;
    store_1.store.promotions[index] = {
        ...existing,
        code: code !== undefined ? code : existing.code,
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : existing.description,
        discountPercentage: discountPercentage !== undefined ? Number(discountPercentage) : existing.discountPercentage,
        discountAmount: discountAmount !== undefined ? Number(discountAmount) : existing.discountAmount,
        minPurchaseAmount: minPurchaseAmount !== undefined ? Number(minPurchaseAmount) : existing.minPurchaseAmount,
        maxDiscountAmount: maxDiscountAmount !== undefined ? Number(maxDiscountAmount) : existing.maxDiscountAmount,
        startDate: startDate !== undefined ? startDate : existing.startDate,
        endDate: endDate !== undefined ? endDate : existing.endDate,
        isActive: isActive !== undefined ? !!isActive : existing.isActive,
        minQuantity: minQuantity !== undefined ? Number(minQuantity) : existing.minQuantity,
        categoryIds: categoryIds !== undefined ? categoryIds : existing.categoryIds,
    };
    return res.json({ success: true, message: 'Promotion updated.', data: store_1.store.promotions[index] });
};
exports.updateAdminPromotion = updateAdminPromotion;
// Category & Brand Admin CRUD
const createAdminCategory = (req, res) => {
    const { name, nameTh, slug, description, descriptionTh, image, sortOrder } = req.body;
    const newCat = {
        id: `cat-${Date.now()}`,
        name,
        nameTh: nameTh || name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: description || '',
        descriptionTh: descriptionTh || '',
        image: image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        sortOrder: sortOrder || store_1.store.categories.length + 1,
        isActive: true,
    };
    store_1.store.categories.push(newCat);
    return res.status(201).json({ success: true, data: newCat });
};
exports.createAdminCategory = createAdminCategory;
const updateAdminCategory = (req, res) => {
    const { id } = req.params;
    const index = store_1.store.categories.findIndex(c => c.id === id || c.slug === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    const existing = store_1.store.categories[index];
    const { name, nameTh, slug, description, descriptionTh, image, sortOrder, isActive } = req.body;
    const updatedCat = {
        ...existing,
        name: name !== undefined ? name : existing.name,
        nameTh: nameTh !== undefined ? nameTh : existing.nameTh,
        slug: slug !== undefined ? slug : existing.slug,
        description: description !== undefined ? description : existing.description,
        descriptionTh: descriptionTh !== undefined ? descriptionTh : existing.descriptionTh,
        image: image !== undefined ? image : existing.image,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : existing.sortOrder,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
    };
    store_1.store.categories[index] = updatedCat;
    return res.json({ success: true, data: updatedCat });
};
exports.updateAdminCategory = updateAdminCategory;
const deleteAdminCategory = (req, res) => {
    const { id } = req.params;
    const index = store_1.store.categories.findIndex(c => c.id === id || c.slug === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    store_1.store.categories.splice(index, 1);
    return res.json({ success: true, message: 'Category deleted successfully.' });
};
exports.deleteAdminCategory = deleteAdminCategory;
const createAdminBrand = (req, res) => {
    const { name, slug, description, country, logo } = req.body;
    const newBrand = {
        id: `brand-${Date.now()}`,
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: description || '',
        country: country || 'Thailand',
        logo: logo || name,
        isActive: true,
    };
    store_1.store.brands.push(newBrand);
    return res.status(201).json({ success: true, data: newBrand });
};
exports.createAdminBrand = createAdminBrand;
// Filter Options Management (Sizes, Surfaces, Materials)
const getShopFilters = (req, res) => {
    return res.json({
        success: true,
        data: {
            sizes: store_1.store.filterConfig.sizes,
            surfaces: store_1.store.filterConfig.surfaces,
            materials: store_1.store.filterConfig.materials,
            categories: store_1.store.categories,
            brands: store_1.store.brands,
        },
    });
};
exports.getShopFilters = getShopFilters;
const updateShopFilters = (req, res) => {
    const { sizes, surfaces, materials } = req.body;
    if (Array.isArray(sizes))
        store_1.store.filterConfig.sizes = sizes;
    if (Array.isArray(surfaces))
        store_1.store.filterConfig.surfaces = surfaces;
    if (Array.isArray(materials))
        store_1.store.filterConfig.materials = materials;
    return res.json({
        success: true,
        message: 'Filters updated successfully.',
        data: {
            ...store_1.store.filterConfig,
            categories: store_1.store.categories,
            brands: store_1.store.brands,
        },
    });
};
exports.updateShopFilters = updateShopFilters;
// Company & Showroom Details Management (Address, Tax ID, Phone, Email)
const getCompanySettings = async (req, res) => {
    const defaults = {
        companyName: 'TS MATERIAL Co., Ltd.',
        companyNameTh: 'บริษัท ทีเอส แมททีเรียล จำกัด',
        taxId: '0105568089913',
        address: '8/32 Moo 3, Pracha Samran Road, Soi Sap Prasit, Khlong Sip Song, Nong Chok, Bangkok 10530',
        addressTh: '8/32 ม.3 ถนนประชาสำราญ ซอยทรัพย์ประสิทธิ์ แขวงคลองสิบสอง เขตหนองจอก กทม. 10530',
        phone: '065-009-3661',
        email: 'tsmaterial15@gmail.com',
        businessHours: 'Mon - Sat: 08:30 - 17:30',
        businessHoursTh: 'จันทร์ - เสาร์: 08:30 - 17:30 น.',
    };
    const sql = (0, db_1.getDbClient)();
    if (sql) {
        try {
            const rows = await sql `
        SELECT section_key, settings FROM cms_sections
        WHERE section_key IN ('contact_info', 'footer_main')
      `;
            let settings = {};
            for (const row of rows) {
                let s = row.settings;
                if (typeof s === 'string') {
                    try {
                        s = JSON.parse(s);
                    }
                    catch (e) { }
                }
                if (s && typeof s === 'object') {
                    settings = { ...settings, ...s };
                }
            }
            return res.json({
                success: true,
                data: {
                    companyName: settings.companyName || defaults.companyName,
                    companyNameTh: settings.companyNameTh || defaults.companyNameTh,
                    taxId: settings.taxId || defaults.taxId,
                    address: settings.address || defaults.address,
                    addressTh: settings.addressTh || defaults.addressTh,
                    phone: settings.phone || defaults.phone,
                    email: settings.email || defaults.email,
                    businessHours: settings.businessHours || defaults.businessHours,
                    businessHoursTh: settings.businessHoursTh || defaults.businessHoursTh,
                },
            });
        }
        catch (e) {
            console.error('Error fetching company settings:', e);
        }
        finally {
            await sql.end().catch(() => { });
        }
    }
    return res.json({ success: true, data: defaults });
};
exports.getCompanySettings = getCompanySettings;
const updateCompanySettings = async (req, res) => {
    const { companyName, companyNameTh, taxId, address, addressTh, phone, email, businessHours, businessHoursTh, } = req.body;
    const sql = (0, db_1.getDbClient)();
    if (!sql) {
        return res.status(500).json({ success: false, message: 'Database connection unavailable.' });
    }
    try {
        // 1. Update contact_info section
        const contactRows = await sql `SELECT settings FROM cms_sections WHERE section_key = 'contact_info' LIMIT 1`;
        let currentContactSettings = contactRows[0]?.settings || {};
        if (typeof currentContactSettings === 'string') {
            try {
                currentContactSettings = JSON.parse(currentContactSettings);
            }
            catch (e) { }
        }
        const updatedContactSettings = {
            ...currentContactSettings,
            companyName: companyName ?? currentContactSettings.companyName,
            companyNameTh: companyNameTh ?? currentContactSettings.companyNameTh,
            taxId: taxId ?? currentContactSettings.taxId,
            address: address ?? currentContactSettings.address,
            addressTh: addressTh ?? currentContactSettings.addressTh,
            phone: phone ?? currentContactSettings.phone,
            email: email ?? currentContactSettings.email,
            businessHours: businessHours ?? currentContactSettings.businessHours,
            businessHoursTh: businessHoursTh ?? currentContactSettings.businessHoursTh,
            atelierName: companyName ?? currentContactSettings.atelierName,
            atelierNameTh: companyNameTh ?? currentContactSettings.atelierNameTh,
        };
        await sql `
      UPDATE cms_sections
      SET settings = ${JSON.stringify(updatedContactSettings)}::jsonb, updated_at = NOW()
      WHERE section_key = 'contact_info'
    `;
        // 2. Update footer_main section
        const footerRows = await sql `SELECT settings FROM cms_sections WHERE section_key = 'footer_main' LIMIT 1`;
        let currentFooterSettings = footerRows[0]?.settings || {};
        if (typeof currentFooterSettings === 'string') {
            try {
                currentFooterSettings = JSON.parse(currentFooterSettings);
            }
            catch (e) { }
        }
        const updatedFooterSettings = {
            ...currentFooterSettings,
            companyName: companyName ?? currentFooterSettings.companyName,
            companyNameTh: companyNameTh ?? currentFooterSettings.companyNameTh,
            taxId: taxId ?? currentFooterSettings.taxId,
            address: address ?? currentFooterSettings.address,
            addressTh: addressTh ?? currentFooterSettings.addressTh,
            phone: phone ?? currentFooterSettings.phone,
            email: email ?? currentFooterSettings.email,
            businessHours: businessHours ?? currentFooterSettings.businessHours,
            businessHoursTh: businessHoursTh ?? currentFooterSettings.businessHoursTh,
            copyright: `© 2026 ${companyName || 'TS MATERIAL CO., LTD.'}. All rights reserved.`,
            copyrightTh: `© 2026 ${companyNameTh || 'บริษัท ทีเอส แมททีเรียล จำกัด'} สงวนลิขสิทธิ์ทั้งหมด`,
        };
        await sql `
      UPDATE cms_sections
      SET settings = ${JSON.stringify(updatedFooterSettings)}::jsonb, updated_at = NOW()
      WHERE section_key = 'footer_main'
    `;
        await (0, logger_1.logSecurityEvent)('ADMIN_COMPANY_SETTINGS_UPDATE', req.user?.id || null, req, {
            companyName,
            taxId,
            phone,
            email,
        });
        return res.json({
            success: true,
            message: 'Company address and details saved successfully to Supabase database.',
            data: updatedContactSettings,
        });
    }
    catch (error) {
        console.error('Error updating company settings:', error);
        return res.status(500).json({ success: false, message: error.message || 'Failed to update company settings.' });
    }
    finally {
        await sql.end().catch(() => { });
    }
};
exports.updateCompanySettings = updateCompanySettings;
