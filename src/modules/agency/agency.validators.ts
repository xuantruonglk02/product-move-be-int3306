import {
    INPUT_TEXT_MAX_LENGTH,
    PHONE_NUMBER_MAX_LENGTH,
    Regex,
} from 'src/common/constants';
import Joi from 'src/plugins/joi';

export const importNewProductFromProducerSchema = Joi.object().keys({
    transitionId: Joi.isObjectId().required(),
    producerId: Joi.isObjectId().required(),
    productId: Joi.isObjectId().required(),
});

export const checkoutProductSchema = Joi.object().keys({
    customerName: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    customerEmail: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .regex(Regex.EMAIL)
        .required(),
    customerPhone: Joi.string().max(PHONE_NUMBER_MAX_LENGTH).required(),
    productIds: Joi.array().items(Joi.isObjectId()).required(),
});
