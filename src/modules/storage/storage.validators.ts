import {
    commonListQuerySchemaKeys,
    INPUT_TEXT_MAX_LENGTH,
} from 'src/common/constants';
import Joi from 'src/plugins/joi';

export const getStorageListSchema = Joi.object().keys({
    ...commonListQuerySchemaKeys,
    userId: Joi.isObjectId().required(),
});

export const createStorageSchema = Joi.object().keys({
    userId: Joi.isObjectId().required(),
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    address: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
});

export const createOwnStorageSchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    address: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
});
