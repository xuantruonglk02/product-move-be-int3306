import { ObjectId } from 'mongodb';
import { OrderDirection, ReportTimeUnit } from './constants';

export interface ICommonListQuery {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: OrderDirection;
    keyword?: string;
}

export interface IBaseReportProductQuery {
    startDate: Date;
    finishDate: Date;
    timeUnit: ReportTimeUnit;
}

export interface IProductReportTimeUnit {
    year: number;
    quarter?: number;
    month?: number;
}

export interface IProductReportUnit {
    time: IProductReportTimeUnit;
    productQuantity: {
        total: number;
        productLines?: [
            {
                productLine: {
                    _id: ObjectId;
                    name: string;
                };
                quantity: number;
            },
        ];
    };
}
