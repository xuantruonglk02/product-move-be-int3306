import JoiBase from 'joi';
import JoiDate from '@joi/date';
import { ObjectId } from 'mongodb';

const joiDateExtension = (joi) => {
    return {
        ...JoiDate(joi),
        prepare: (value) => {
            if (
                value !== null &&
                value !== undefined &&
                typeof value !== 'string'
            ) {
                value = value.toString();
            }
            return { value };
        },
    };
};

const joiObjectIdExtension = (joi) => {
    return {
        type: 'isObjectId',
        base: joi.string(),
        validate(value, helpers) {
            if (value && !ObjectId.isValid(value)) {
                return { value, errors: helpers.error('any.invalid') };
            }
            return { value };
        },
    };
};

const Joi = JoiBase.extend(joiDateExtension, joiObjectIdExtension);
export default Joi;
