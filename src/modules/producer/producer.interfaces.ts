import { ObjectId } from 'mongodb';
import { IBaseReportProductQuery } from 'src/common/interfaces';

export interface IExportNewProductToAgency {
    agencyId: ObjectId;
    agencyStorageId: ObjectId;
    productIds: ObjectId[];
}

export interface IReceiveErrorProductFromWarrantyCenter {
    transitionId: ObjectId;
}

export interface IReportProductQuery extends IBaseReportProductQuery {
    productLineIds?: ObjectId[];
}
