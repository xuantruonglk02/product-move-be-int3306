import { ObjectId } from 'mongodb';

export interface IExportNewProductToAgency {
    agencyId: ObjectId;
    productId: ObjectId;
}
