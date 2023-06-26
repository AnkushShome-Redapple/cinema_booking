"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class Validator {
    static validateCreateCinema(req, res, next) {
        const { error } = Validator.createCinemaSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    }
}
Validator.createCinemaSchema = joi_1.default.object({
    numSeats: joi_1.default.number().integer().positive().required(),
});
exports.default = Validator;
