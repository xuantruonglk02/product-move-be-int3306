import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<any, ObjectId> {
    transform(value: any): ObjectId {
        if (!Types.ObjectId.isValid(value)) {
            throw new BadRequestException('Invalid Id');
        }

        return new ObjectId(value);
    }
}
