import { INPUT_TEXT_MAX_LENGTH } from 'src/common/constants';
import Joi from 'src/plugins/joi';

export const createStorageSchema = Joi.object().keys({
    userId: Joi.isObjectId().required(),
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    address: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
});
