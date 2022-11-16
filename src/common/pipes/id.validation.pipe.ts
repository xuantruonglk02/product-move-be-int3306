import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIdPipe implements PipeTransform<any, number> {
    transform(value: any): number {
        if (isNaN(value) || parseInt(value).toString() !== value.toString()) {
            throw new BadRequestException('Invalid Id');
        }

        return parseInt(value);
    }
}
