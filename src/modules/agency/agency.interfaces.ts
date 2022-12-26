import { ObjectId } from 'mongodb';

export interface IImportNewProductFromProducer {
    transitionId: ObjectId;
}

export interface IReturnFixedProduct {
    productId: ObjectId;
}

export interface IReceiveErrorProduct {
    productId: ObjectId;
    errorDescription: string;
    agencyStorageId: ObjectId;
}

export interface ITransferErrorProduct {
    productIds: ObjectId[];
    warrantyCenterId: ObjectId;
}
