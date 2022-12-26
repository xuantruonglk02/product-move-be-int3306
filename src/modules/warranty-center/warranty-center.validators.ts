import Joi from 'src/plugins/joi';

export const receiveErrorProductFromAgency = Joi.object().keys({
    transitionId: Joi.isObjectId().required(),
});
