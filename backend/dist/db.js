"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbUrl = getDbUrl;
exports.getDbClient = getDbClient;
const postgres_1 = __importDefault(require("postgres"));
const config_1 = require("./config");
const FALLBACK_DATABASE_URL = "postgresql://postgres.xacaeysrrfqhwpkdjkvm:1103703370197Aa@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
function getDbUrl() {
    return process.env.DATABASE_URL || config_1.config.databaseUrl || FALLBACK_DATABASE_URL;
}
function getDbClient() {
    const dbUrl = getDbUrl();
    try {
        return (0, postgres_1.default)(dbUrl, {
            max: 1,
            idle_timeout: 5,
            connect_timeout: 10,
            ssl: { rejectUnauthorized: false },
        });
    }
    catch (err) {
        console.error('Failed to create postgres client:', err);
        return null;
    }
}
