import { ObjectId } from 'mongodb';

export interface IStorage {
    userId: ObjectId;
    name: string;
    address: string;
}

export interface ICreateStorage extends IStorage {
    createdBy: ObjectId;
}
