import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TIMEZONE_HEADER, TIMEZONE_NAME_HEADER } from '../constants';
import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_TIMEZONE_NAME = process.env.TIMEZONE_DEFAULT_NAME;
const DEFAULT_TIMEZONE = process.env.TIMEZONE_DEFAULT;

@Injectable()
export class HeaderMiddleware implements NestMiddleware {
    use(req: Request, _res: Response, next: NextFunction) {
        if (!req.headers[TIMEZONE_HEADER]) {
            req.headers[TIMEZONE_HEADER] = DEFAULT_TIMEZONE;
        }
        if (!req.headers[TIMEZONE_NAME_HEADER]) {
            req.headers[TIMEZONE_NAME_HEADER] = DEFAULT_TIMEZONE_NAME;
        }

        next();
    }
}
