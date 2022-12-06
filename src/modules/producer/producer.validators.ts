import Joi from 'src/plugins/joi';

export const exportNewProductToAgencySchema = Joi.object().keys({
    storageId: Joi.isObjectId().required(),
    agencyId: Joi.isObjectId().required(),
    productIds: Joi.array().items(Joi.isObjectId()).required(),
});
