import Joi from 'joi';
import {
    INPUT_TEXT_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    PHONE_NUMBER_MAX_LENGTH,
    Regex,
    WORD_MAX_LENGTH,
} from 'src/common/constants';
import { UserRole } from '../user/user.constants';

export const createUserSchema = Joi.object().keys({
    email: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .regex(Regex.EMAIL)
        .required(),
    phoneNumber: Joi.string().max(PHONE_NUMBER_MAX_LENGTH).optional(),
    firstName: Joi.string().max(WORD_MAX_LENGTH).required(),
    lastName: Joi.string().max(WORD_MAX_LENGTH).required(),
    role: Joi.string()
        .valid(...Object.values(UserRole))
        .required(),
    password: Joi.string()
        .min(PASSWORD_MIN_LENGTH)
        .max(INPUT_TEXT_MAX_LENGTH)
        .regex(Regex.PASSWORD)
        .required(),
});
