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

export interface IReturnErrorProductToProducer {
    producerId: ObjectId;
    producerStorageId: ObjectId;
    productIds: ObjectId[];
}
