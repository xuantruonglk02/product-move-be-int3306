import {
    AREA_TEXT_MAX_LENGTH,
    commonListQuerySchemaKeys,
    INPUT_TEXT_MAX_LENGTH,
    MIN_POSITIVE_NUMBER,
} from 'src/common/constants';
import Joi from 'src/plugins/joi';
import {
    ProductColor,
    ProductLocation,
    ProductStatus,
} from './product.constants';

export const getProductListSchema = Joi.object().keys({
    ...commonListQuerySchemaKeys,
    productLineId: Joi.isObjectId().optional(),
    userId: Joi.isObjectId().optional(),
    storageId: Joi.isObjectId().optional(),
    status: Joi.string()
        .valid(...Object.values(ProductStatus))
        .optional(),
    location: Joi.string()
        .valid(...Object.values(ProductLocation))
        .optional(),
    sold: Joi.boolean().optional(),
    createdBy: Joi.isObjectId().optional(),
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

export const getProductStatusTransitionListSchema = Joi.object().keys({
    ...commonListQuerySchemaKeys,
    previousUserId: Joi.isObjectId().optional(),
    nextUserId: Joi.isObjectId().optional(),
    previousStorageId: Joi.isObjectId().optional(),
    nextStorageId: Joi.isObjectId().optional(),
    previousStatus: Joi.string()
        .valid(...Object.values(ProductStatus))
        .optional(),
    nextStatus: Joi.string()
        .valid(...Object.values(ProductStatus))
        .optional(),
    previousLocation: Joi.string()
        .valid(...Object.values(ProductLocation))
        .optional(),
    nextLocation: Joi.string()
        .valid(...Object.values(ProductLocation))
        .optional(),
    finished: Joi.boolean().optional(),
});
