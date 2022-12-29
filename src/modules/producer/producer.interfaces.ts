import { ObjectId } from 'mongodb';

export interface IExportNewProductToAgency {
    agencyId: ObjectId;
    agencyStorageId: ObjectId;
    productIds: ObjectId[];
}

export interface IReceiveErrorProductFromWarrantyCenter {
    transitionId: ObjectId;
}
