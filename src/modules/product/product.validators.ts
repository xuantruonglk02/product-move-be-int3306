import {
    AREA_TEXT_MAX_LENGTH,
    commonListQuerySchemaKeys,
    INPUT_TEXT_MAX_LENGTH,
    MIN_POSITIVE_NUMBER,
} from 'src/common/constants';
import Joi from 'src/plugins/joi';
import { ProductColor } from './product.constants';

export const getProductListSchema = Joi.object().keys({
    ...commonListQuerySchemaKeys,
    productLineId: Joi.isObjectId().optional().allow(null),
});

export const createProductLineSchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    price: Joi.number().required(),
});

export const createProductSchema = Joi.object().keys({
    productLineId: Joi.isObjectId().required(),
    storageId: Joi.isObjectId().required(),
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    description: Joi.string().max(AREA_TEXT_MAX_LENGTH).required(),
    weight: Joi.number().min(MIN_POSITIVE_NUMBER).required(),
    displaySize: Joi.number().min(MIN_POSITIVE_NUMBER).required(),
    bodySize: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    color: Joi.string()
        .valid(...Object.values(ProductColor))
        .required(),
    bodyBuild: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    batteryVolume: Joi.number().min(MIN_POSITIVE_NUMBER).required(),
});
