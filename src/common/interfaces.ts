import { OrderDirection, ReportTimeUnit } from './constants';

export interface ICommonListQuery {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: OrderDirection;
    keyword?: string;
}

export interface IBaseReportProduct {
    startDate: Date;
    finishDate: Date;
    timeUnit: ReportTimeUnit;
}
