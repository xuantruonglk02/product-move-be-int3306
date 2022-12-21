import { ObjectId } from 'mongodb';
import { ICommonListQuery } from 'src/common/interfaces';

export interface IStorage {
    userId: ObjectId;
    name: string;
    address: string;
}

export interface IGetStorageList extends ICommonListQuery {
    userId: ObjectId;
}

export interface ICreateStorage extends IStorage {
    createdBy: ObjectId;
}
