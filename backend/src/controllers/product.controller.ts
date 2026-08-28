import { Request, Response } from 'express';
import { store } from '../repositories/store';

export const getProducts = (req: Request, res: Response) => {
  let list = [...store.products].filter(p => p.status === 'PUBLISHED');

  const {
    search,
    category,
    brand,
    collection,
    size,
    color,
    surface,
    material,
    indoorOutdoor,
    countryOfOrigin,
    sort,
    featured,
    page = 1,
    limit = 12,
  } = req.query;

  // Search filter (Product code, name, description, color, pattern, size)
  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    list = list.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        (p.nameTh && p.nameTh.toLowerCase().includes(q)) ||
        p.productCode.toLowerCase().includes(q) ||
        (p.brandName && p.brandName.toLowerCase().includes(q)) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
        p.color.toLowerCase().includes(q) ||
        p.size.toLowerCase().includes(q) ||
        p.pattern.toLowerCase().includes(q)
    );
  }

  // Category filter (slug or ID)
  if (category && typeof category === 'string') {
    const cat = store.categories.find(c => c.slug === category || c.id === category);
    if (cat) {
      list = list.filter(p => p.categoryId === cat.id);
    }
  }

  // Brand filter
  if (brand && typeof brand === 'string') {
    const b = store.brands.find(br => br.slug === brand || br.id === brand);
    if (b) {
      list = list.filter(p => p.brandId === b.id);
    }
  }

  // Collection filter
  if (collection && typeof collection === 'string') {
    const col = store.collections.find(c => c.slug === collection || c.id === collection);
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
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.pricePerPiece - a.pricePerPiece);
  } else if (sort === 'newest') {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === 'popular') {
    list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 12;
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

export const getProductBySlug = (req: Request, res: Response) => {
  const { slug } = req.params;
  const product = store.products.find(p => p.slug === slug || p.id === slug);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  return res.json({ success: true, data: product });
};

export const getCategories = (req: Request, res: Response) => {
  const categories = store.categories.filter(c => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  return res.json({ success: true, data: categories });
};

export const getBrands = (req: Request, res: Response) => {
  const brands = store.brands.filter(b => b.isActive);
  return res.json({ success: true, data: brands });
};

export const getCollections = (req: Request, res: Response) => {
  const collections = store.collections.filter(c => c.isActive);
  return res.json({ success: true, data: collections });
};
