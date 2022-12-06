import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { softDeleteCondition } from 'src/common/constants';
import {
    Storage,
    storageAttributes,
    StorageDocument,
} from '../schemas/storage.schema';
import { ICreateStorage } from '../storage.interfaces';

@Injectable()
export class StorageService {
    constructor(
        @InjectModel(Storage.name)
        private readonly storageModel: Model<StorageDocument>,
    ) {}

    async getStorageById(id: ObjectId, attrs = storageAttributes) {
        try {
            return await this.storageModel
                .findOne({
                    _id: id,
                    ...softDeleteCondition,
                })
                .select(attrs);
        } catch (error) {
            throw error;
        }
    }

    async createStorage(body: ICreateStorage) {
        try {
            return await this.storageModel.create({
                ...body,
                createdAt: new Date(),
            });
        } catch (error) {
            throw error;
        }
    }
}
