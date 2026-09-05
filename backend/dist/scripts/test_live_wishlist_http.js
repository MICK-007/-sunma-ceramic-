"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const jwtSecret = process.env.JWT_SECRET || 'sunma_ceramic_jwt_secret_key_2026_super_secure';
async function testLiveWishlistHttp() {
    console.log('🧪 Testing Live Render Wishlist HTTP Endpoint...\n');
    // Sign JWT token for dil1 (id: 4aa9c816-0414-4cac-bdad-a1a0ff71f222)
    const token = jsonwebtoken_1.default.sign({ sub: '4aa9c816-0414-4cac-bdad-a1a0ff71f222', email: 'prachakchai.srimala@gmail.com', role: 'USER' }, jwtSecret, { expiresIn: '1d' });
    console.log('Generated Test Token for dil1');
    try {
        // 1. POST /api/wishlist
        const addRes = await fetch('https://sunma-ceramic.onrender.com/api/wishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `sunma_access_token=${token}`,
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId: 'prod-1' })
        }).then(r => r.json());
        console.log('POST /api/wishlist Response:', addRes);
        // 2. GET /api/wishlist
        const getRes = await fetch('https://sunma-ceramic.onrender.com/api/wishlist', {
            method: 'GET',
            headers: {
                'Cookie': `sunma_access_token=${token}`,
                'Authorization': `Bearer ${token}`
            }
        }).then(r => r.json());
        console.log('GET /api/wishlist Response:', getRes);
    }
    catch (err) {
        console.error('❌ HTTP Fetch Error:', err.message || err);
    }
}
testLiveWishlistHttp();
