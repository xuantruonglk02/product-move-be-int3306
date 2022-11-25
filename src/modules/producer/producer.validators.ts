import Joi from 'joi';
import { ID_MIN_NUMBER } from 'src/common/constants';

export const exportNewProductToAgencySchema = Joi.object().keys({
    agencyId: Joi.number().min(ID_MIN_NUMBER).required(),
    productId: Joi.number().min(ID_MIN_NUMBER).required(),
});
