import { ARRAY_MAX_LENGTH } from 'src/common/constants';
import Joi from 'src/plugins/joi';

export const receiveErrorProductFromAgency = Joi.object().keys({
    transitionId: Joi.isObjectId().required(),
});

export const verifyProductErrorsFixedDoneSchema = Joi.object().keys({
    productId: Joi.isObjectId().required(),
    errorReportIds: Joi.array()
        .max(ARRAY_MAX_LENGTH)
        .items(Joi.isObjectId())
        .required(),
});

export const returnFixedProductToAgency = Joi.object().keys({
    agencyId: Joi.isObjectId().required(),
    agencyStorageId: Joi.isObjectId().required(),
    productIds: Joi.array()
        .max(ARRAY_MAX_LENGTH)
        .items(Joi.isObjectId())
        .required(),
});
