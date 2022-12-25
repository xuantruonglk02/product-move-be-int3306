import Joi from 'src/plugins/joi';

export enum MongoCollection {
    USERS = 'users',
    USER_TOKENS = 'user_tokens',
    PRODUCTS = 'products',
    PRODUCT_LINES = 'product_lines',
    PRODUCT_STATUS_TRANSITIONS = 'product_status_transitions',
    PRODUCT_IMAGES = 'product_images',
    PRODUCT_REPLACEMENTS = 'product_replacements',
    PRODUCT_ERROR_REPORTS = 'Product_error_reports',
    ORDERS = 'orders',
    ORDER_DETAILS = 'order_details',
    STORAGES = 'storages',
}

export enum OrderDirection {
    ASCENDING = 'ascending',
    DESCENDING = 'descending',
}

export enum OrderBy {
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
}

export const Regex = {
    EMAIL: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    PASSWORD:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

export const AREA_TEXT_MAX_LENGTH = 2000;
export const DEFAULT_ITEM_PER_PAGE_LIMIT = 10;
export const HASH_PASSWORD_LENGTH = 60;
export const IMAGE_URL_MAX_LENGTH = 255;
export const INPUT_TEXT_MAX_LENGTH = 255;
export const MAX_ITEM_PER_PAGE_LIMIT = 10000;
export const MIN_POSITIVE_NUMBER = 1;
export const PASSWORD_MIN_LENGTH = 8;
export const PHONE_NUMBER_MAX_LENGTH = 12;

export const softDeleteCondition = {
    $or: [
        {
            deletedAt: {
                $exists: true,
                $eq: null,
            },
        },
        {
            deletedAt: {
                $exists: false,
            },
        },
    ],
};

export const commonListQuerySchemaKeys = {
    page: Joi.number().positive().optional().allow(null),
    limit: Joi.number()
        .positive()
        .max(MAX_ITEM_PER_PAGE_LIMIT)
        .optional()
        .allow(null),
    keyword: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
    orderDirection: Joi.string()
        .valid(...Object.values(OrderDirection))
        .optional(),
    orderBy: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
};

export const commonListQuerySchema = Joi.object().keys({
    ...commonListQuerySchemaKeys,
});
