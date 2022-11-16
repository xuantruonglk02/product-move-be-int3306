export enum HttpStatus {
    OK = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    INTERNAL_SERVER_ERROR = 500,
}

export enum SqlEntity {
    USERS = 'users',
}

export enum UserTokenType {
    ACCESS_TOKEN = 'access_token',
    REFRESH_TOKEN = 'refresh_token',
}

export enum UserRole {
    ADMIN = 'admin',
    PRODUCER = 'producer',
    AGENCY = 'agency',
    WARRANTY_CENTER = 'warranty_center',
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
    PASSWORD: /./,
};

export const PASSWORD_MIN_LENGTH = 8;
export const HASH_PASSWORD_LENGTH = 60;
export const INPUT_TEXT_MAX_LENGTH = 255;
