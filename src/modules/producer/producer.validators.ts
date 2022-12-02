import Joi from 'src/plugins/joi';

export const exportNewProductToAgencySchema = Joi.object().keys({
    agencyId: Joi.isObjectId().required(),
    productId: Joi.isObjectId().required(),
});
