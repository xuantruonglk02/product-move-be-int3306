import { ObjectId } from 'mongodb';

export interface ICreateOrder {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    productIds: ObjectId[];
    createdBy: ObjectId;
}
