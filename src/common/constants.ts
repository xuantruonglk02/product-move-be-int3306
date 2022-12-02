export enum MongoCollection {
    USERS = 'users',
    USER_TOKENS = 'user_tokens',
    PRODUCTS = 'products',
    PRODUCT_LINES = 'product_lines',
    PRODUCT_STATUS_TRANSITIONS = 'product_status_transitions',
    PRODUCT_IMAGES = 'product_images',
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

export const IMAGE_URL_MAX_LENGTH = 255;
export const PASSWORD_MIN_LENGTH = 8;
export const HASH_PASSWORD_LENGTH = 60;
export const INPUT_TEXT_MAX_LENGTH = 255;
export const AREA_TEXT_MAX_LENGTH = 2000;
export const PHONE_NUMBER_MAX_LENGTH = 12;
export const MIN_POSITIVE_NUMBER = 1;

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
