import { ObjectId } from 'mongodb';
import { IBaseReportProduct } from 'src/common/interfaces';

export interface IExportNewProductToAgency {
    agencyId: ObjectId;
    agencyStorageId: ObjectId;
    productIds: ObjectId[];
}

export interface IReceiveErrorProductFromWarrantyCenter {
    transitionId: ObjectId;
}

export interface IReportProduct extends IBaseReportProduct {
    productLineIds?: ObjectId[];
}
