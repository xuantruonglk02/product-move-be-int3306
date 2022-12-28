import { ObjectId } from 'mongodb';

export interface IImportNewProductFromProducer {
    transitionId: ObjectId;
}

export interface IReturnFixedProduct {
    productId: ObjectId;
}

export interface IReceiveErrorProduct {
    productId: ObjectId;
    errors: string[];
    agencyStorageId: ObjectId;
}

export interface ITransferErrorProduct {
    productIds: ObjectId[];
    warrantyCenterId: ObjectId;
}

export interface IReceiveFixedProduct {
    transitionId: ObjectId;
}

export interface IReturnNewProductToCustomer {
    oldProductId: ObjectId;
    newProductId: ObjectId;
}
