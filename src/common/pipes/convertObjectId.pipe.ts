import { Injectable, PipeTransform } from '@nestjs/common';
import { isPlainObject, mapKeys } from 'lodash';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';

@Injectable()
export class ConvertObjectIdPipe implements PipeTransform {
    constructor() {
        //
    }

    trimData(body: Record<string, any>) {
        const trimValue = (item: any) => {
            mapKeys(item, (value, key) => {
                if (
                    typeof value === 'string' &&
                    Types.ObjectId.isValid(value)
                ) {
                    item[key] = new ObjectId(value);
                }

                // iterate array
                else if (Array.isArray(value)) {
                    value.forEach((subValue, index) => {
                        // remove string contain only space characters
                        if (
                            typeof subValue === 'string' &&
                            Types.ObjectId.isValid(subValue)
                        ) {
                            value[index] = new ObjectId(subValue);
                        } else if (isPlainObject(subValue)) {
                            trimValue(subValue);
                        }
                    });
                } else if (isPlainObject(value)) {
                    trimValue(value);
                }
            });
        };

        trimValue(body);
    }

    transform(body: Record<string, any>) {
        this.trimData(body);
        return body;
    }
}
