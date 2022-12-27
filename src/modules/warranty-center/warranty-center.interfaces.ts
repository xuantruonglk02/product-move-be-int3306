import { ObjectId } from 'mongodb';

export interface IReceiveErrorProductFromAgency {
    transitionId: ObjectId;
}

export interface IVerifyProductErrorsFixedDone {
    productId: ObjectId;
    errorReportIds: ObjectId[];
}

export interface IReturnFixedProductToAgency {
    agencyId: ObjectId;
    agencyStorageId: ObjectId;
    productIds: ObjectId[];
}
