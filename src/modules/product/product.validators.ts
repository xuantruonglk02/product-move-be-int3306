import Joi from 'joi';
import { INPUT_TEXT_MAX_LENGTH } from 'src/common/constants';

export const createProductLineSchema = Joi.object().keys({
    id: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    price: Joi.number().required(),
});

export const createProductSchema = Joi.object().keys({
    productLineId: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
});
