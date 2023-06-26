import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

class Validator {
    private static createCinemaSchema = Joi.object({
        numSeats: Joi.number().integer().positive().required(),
    });

    public static validateCreateCinema(req: Request, res: Response, next: NextFunction) {
        const { error } = Validator.createCinemaSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    }
}


export default Validator;