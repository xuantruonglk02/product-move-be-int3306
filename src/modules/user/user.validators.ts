import {
    commonListQuerySchemaKeys,
    INPUT_TEXT_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    PHONE_NUMBER_MAX_LENGTH,
    Regex,
} from 'src/common/constants';
import Joi from 'src/plugins/joi';
import { UserRole } from './user.constants';

export const getUserListSchema = Joi.object().keys({
    ...commonListQuerySchemaKeys,
    role: Joi.string()
        .valid(...Object.values(UserRole))
        .optional(),
});

export const createUserSchema = Joi.object().keys({
    email: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .regex(Regex.EMAIL)
        .required(),
    phoneNumber: Joi.string().max(PHONE_NUMBER_MAX_LENGTH).optional(),
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    avatar: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional(),
    role: Joi.string()
        .valid(...Object.values(UserRole))
        .required(),
    password: Joi.string()
        .min(PASSWORD_MIN_LENGTH)
        .max(INPUT_TEXT_MAX_LENGTH)
        .regex(Regex.PASSWORD)
        .required(),
});

export const updateUserSchema = Joi.object().keys({
    confirmPassword: Joi.string()
        .min(PASSWORD_MIN_LENGTH)
        .max(INPUT_TEXT_MAX_LENGTH)
        .required(),

    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional(),
    phoneNumber: Joi.string().max(PHONE_NUMBER_MAX_LENGTH).optional(),
    avatar: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional(),
    password: Joi.string()
        .min(PASSWORD_MIN_LENGTH)
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional(),
});
