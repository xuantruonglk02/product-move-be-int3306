import Joi from 'joi';
import {
    ID_MIN_NUMBER,
    INPUT_TEXT_MAX_LENGTH,
    PHONE_NUMBER_MAX_LENGTH,
    Regex,
} from 'src/common/constants';

export const importNewProductFromProducerSchema = Joi.object().keys({
    producerId: Joi.number().min(ID_MIN_NUMBER).required(),
    productId: Joi.number().min(ID_MIN_NUMBER).required(),
});

export const checkoutProductSchema = Joi.object().keys({
    productIds: Joi.array().items(Joi.number().min(ID_MIN_NUMBER)).required(),
    customerName: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    customerEmail: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .regex(Regex.EMAIL)
        .required(),
    customerPhone: Joi.string().max(PHONE_NUMBER_MAX_LENGTH).required(),
});
