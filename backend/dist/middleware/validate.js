"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateBody = void 0;
const zod_1 = require("zod");
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                const primaryMessage = formattedErrors.length > 0 ? formattedErrors[0].message : 'Validation failed. Invalid request payload.';
                return res.status(400).json({
                    success: false,
                    message: primaryMessage,
                    errors: formattedErrors,
                });
            }
            next(error);
        }
    };
};
exports.validateBody = validateBody;
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            req.params = schema.parse(req.params);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                const primaryMessage = formattedErrors.length > 0 ? formattedErrors[0].message : 'Validation failed. Invalid path parameter.';
                return res.status(400).json({
                    success: false,
                    message: primaryMessage,
                    errors: formattedErrors,
                });
            }
            next(error);
        }
    };
};
exports.validateParams = validateParams;
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                const primaryMessage = formattedErrors.length > 0 ? formattedErrors[0].message : 'Validation failed. Invalid query parameters.';
                return res.status(400).json({
                    success: false,
                    message: primaryMessage,
                    errors: formattedErrors,
                });
            }
            next(error);
        }
    };
};
exports.validateQuery = validateQuery;
