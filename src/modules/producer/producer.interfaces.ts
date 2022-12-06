import { ObjectId } from 'mongodb';

export interface IExportNewProductToAgency {
    storageId: ObjectId;
    agencyId: ObjectId;
    productIds: ObjectId[];
}
