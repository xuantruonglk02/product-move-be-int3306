import {
    AREA_TEXT_MAX_LENGTH,
    ARRAY_MAX_LENGTH,
    commonListQuerySchemaKeys,
    INPUT_TEXT_MAX_LENGTH,
    MIN_POSITIVE_NUMBER,
    PHONE_NUMBER_MAX_LENGTH,
    Regex,
} from 'src/common/constants';
import Joi from 'src/plugins/joi';

export const importNewProductFromProducerSchema = Joi.object().keys({
    transitionId: Joi.isObjectId().required(),
});

export const checkoutProductSchema = Joi.object().keys({
    customerName: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    customerEmail: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .regex(Regex.EMAIL)
        .required(),
    customerPhone: Joi.string().max(PHONE_NUMBER_MAX_LENGTH).required(),
    productIds: Joi.array()
        .min(MIN_POSITIVE_NUMBER)
        .max(ARRAY_MAX_LENGTH)
        .items(Joi.isObjectId())
        .required(),
});

export const returnFixedProduct = Joi.object().keys({
    productId: Joi.isObjectId().required(),
});

export const receiveErrorProduct = Joi.object().keys({
    productId: Joi.isObjectId().required(),
    errors: Joi.array()
        .min(MIN_POSITIVE_NUMBER)
        .max(ARRAY_MAX_LENGTH)
        .items(Joi.string().max(AREA_TEXT_MAX_LENGTH)),
    agencyStorageId: Joi.isObjectId().required(),
});

export const transferErrorProductSchema = Joi.object().keys({
    productIds: Joi.array()
        .min(MIN_POSITIVE_NUMBER)
        .max(ARRAY_MAX_LENGTH)
        .items(Joi.isObjectId())
        .required(),
    warrantyCenterId: Joi.isObjectId().required(),
});

export const receiveFixedProductSchema = Joi.object().keys({
    transitionId: Joi.isObjectId().required(),
});

export const returnNewProductSchema = Joi.object().keys({
    oldProductId: Joi.isObjectId().required(),
    newProductId: Joi.isObjectId().required(),
});

export const getSoldProductsSchema = Joi.object().keys({
    ...commonListQuerySchemaKeys,
    productLineId: Joi.isObjectId().optional(),
});
