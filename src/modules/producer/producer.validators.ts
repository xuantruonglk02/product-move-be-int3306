import { ARRAY_MAX_LENGTH, MIN_POSITIVE_NUMBER } from 'src/common/constants';
import Joi from 'src/plugins/joi';

export const exportNewProductToAgencySchema = Joi.object().keys({
    agencyId: Joi.isObjectId().required(),
    agencyStorageId: Joi.isObjectId().required(),
    productIds: Joi.array()
        .min(MIN_POSITIVE_NUMBER)
        .max(ARRAY_MAX_LENGTH)
        .items(Joi.isObjectId())
        .required(),
});
