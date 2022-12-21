import { ObjectId } from 'mongodb';

export interface IImportNewProductFromProducer {
    transitionId: ObjectId;
    producerId: ObjectId;
    productId: ObjectId;
    storageId: ObjectId;
}

export interface IReturnFixedProduct {
    productId: ObjectId;
}
