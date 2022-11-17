export enum SqlEntity {
    USERS = 'users',
    USER_TOKENS = 'user_tokens',
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
