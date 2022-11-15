import {
    BadRequestException,
    Injectable,
    PipeTransform,
    Scope,
} from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable({ scope: Scope.REQUEST })
export class JoiValidationPipe implements PipeTransform {
    constructor(private readonly schema: ObjectSchema) {}

    transform(value) {
        const { error } = this.schema.validate(value, {
            abortEarly: false,
        });
        if (error) {
            const { details } = error;
            throw new BadRequestException({ error: details });
        }
        return value;
    }
}
