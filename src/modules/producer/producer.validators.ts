import { ARRAY_MAX_LENGTH } from 'src/common/constants';
import Joi from 'src/plugins/joi';

export const exportNewProductToAgencySchema = Joi.object().keys({
    storageId: Joi.isObjectId().required(),
    agencyId: Joi.isObjectId().required(),
    productIds: Joi.array()
        .max(ARRAY_MAX_LENGTH)
        .items(Joi.isObjectId())
        .required(),
});
