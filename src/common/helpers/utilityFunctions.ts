import bcrypt from 'bcrypt';
import { isPlainObject } from 'lodash';
import { ObjectId } from 'mongodb';
import { ReportTimeUnit } from '../constants';

export function extractToken(authorization = '') {
    if (/^Bearer /.test(authorization)) {
        return authorization.substring(7, authorization.length);
    }
    return '';
}

export function hashPassword(password: string) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(12));
}

export function convertObjectId(data: Record<string, any>, fields: string[]) {
    const convertValue = (object: Record<string, any>) => {
        Object.entries(object).forEach(([key, value]) => {
            if (typeof value === 'string' && fields.includes(key)) {
                object[key] = new ObjectId(value);
            } else if (Array.isArray(value)) {
                value.forEach((subValue, index) => {
                    if (typeof subValue === 'string' && fields.includes(key)) {
                        value[index] = new ObjectId(subValue);
                    } else if (isPlainObject(subValue)) {
                        convertValue(subValue);
                    }
                });
            } else if (isPlainObject(value)) {
                convertValue(value);
            }
        });
    };

    convertValue(data);
}

export function makeReportTimeline(
    startDate: Date,
    finishDate: Date,
    timeUnit: ReportTimeUnit,
) {
    const monthIncrement = (() => {
        switch (timeUnit) {
            case ReportTimeUnit.MONTH:
                return 1;
            case ReportTimeUnit.QUARTER:
                return 3;
            case ReportTimeUnit.YEAR:
                return 12;
            default:
                return 1;
        }
    })();

    const timeline = [];
    for (
        let d = startDate;
        d < finishDate;
        d.setMonth(d.getMonth() + monthIncrement)
    ) {
        timeline.push({
            month:
                timeUnit === ReportTimeUnit.MONTH
                    ? new Date(d).getMonth() + 1
                    : undefined,
            quarter:
                timeUnit === ReportTimeUnit.QUARTER
                    ? Math.floor(new Date(d).getMonth() / 3) + 1
                    : undefined,
            year: new Date(d).getFullYear(),
        });
    }
    return timeline;
}
