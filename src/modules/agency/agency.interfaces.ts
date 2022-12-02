import { ObjectId } from 'mongodb';

export interface IImportNewProductFromProducer {
    transitionId: ObjectId;
    producerId: ObjectId;
    productId: ObjectId;
}
