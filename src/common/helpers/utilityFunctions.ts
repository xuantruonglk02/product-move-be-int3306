import bcrypt from 'bcrypt';
import { isPlainObject } from 'lodash';
import { ObjectId } from 'mongodb';

export function extractToken(authorization = '') {
    if (/^Bearer /.test(authorization)) {
        return authorization.substring(7, authorization.length);
    }
    return '';
}

export function hashPassword(password: string) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(12));
}

export function convertObjectId(data: Record<string, any>, fields: string[]) {
    const convertValue = (object: Record<string, any>) => {
        Object.entries(object).forEach(([key, value]) => {
            if (typeof value === 'string' && fields.includes(key)) {
                object[key] = new ObjectId(value);
            } else if (Array.isArray(value)) {
                value.forEach((subValue, index) => {
                    if (typeof subValue === 'string' && fields.includes(key)) {
                        value[index] = new ObjectId(subValue);
                    } else if (isPlainObject(subValue)) {
                        convertValue(subValue);
                    }
                });
            } else if (isPlainObject(value)) {
                convertValue(value);
            }
        });
    };

    convertValue(data);
}
