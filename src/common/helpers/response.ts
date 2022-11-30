import { HttpStatus, Injectable } from '@nestjs/common';
import { DEFAULT_ERROR_MESSAGE, DEFAULT_SUCCESS_MESSAGE } from '../messages';

const { VERSION: version = '1.0.0' } = process.env;

export class SuccessResponse {
    constructor(data = {}, message = DEFAULT_SUCCESS_MESSAGE) {
        return {
            code: HttpStatus.OK,
            message,
            data,
            version,
        };
    }
}

export class ErrorResponse {
    constructor(
        code = HttpStatus.INTERNAL_SERVER_ERROR,
        errors: {
            code: number;
            message: string;
            key: string;
        }[],
        message = DEFAULT_ERROR_MESSAGE,
    ) {
        return {
            code,
            message,
            errors,
            version,
        };
    }
}

@Injectable()
export class ApiResponse<T> {
    public code: number;

    public message: string;

    public data: T;

    public errors: T[];
}
