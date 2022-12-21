import { OrderDirection } from './constants';

export interface ICommonListQuery {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: OrderDirection;
    keyword?: string;
}
