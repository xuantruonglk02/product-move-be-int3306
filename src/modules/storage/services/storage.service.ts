import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import {
    DEFAULT_ITEM_PER_PAGE_LIMIT,
    MIN_POSITIVE_NUMBER,
    OrderDirection,
    softDeleteCondition,
} from 'src/common/constants';
import {
    Storage,
    storageAttributes,
    StorageDocument,
} from '../schemas/storage.schema';
import { ICreateStorage, IGetStorageList } from '../storage.interfaces';

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

    async getStorageList(query: IGetStorageList) {
        try {
            const {
                userId,
                keyword = '',
                page = MIN_POSITIVE_NUMBER,
                limit = DEFAULT_ITEM_PER_PAGE_LIMIT,
                orderDirection = OrderDirection.ASCENDING,
                orderBy = 'name',
            } = query;

            const [storageList, total] = await Promise.all([
                this.storageModel
                    .find({
                        userId,
                        name: {
                            $regex: `.*${keyword}.*`,
                            $options: 'i',
                        },
                        ...softDeleteCondition,
                    })
                    .select(storageAttributes)
                    .sort({
                        [orderBy]:
                            orderDirection === OrderDirection.ASCENDING
                                ? 1
                                : -1,
                    })
                    .limit(limit)
                    .skip(limit * (page - 1)),
                this.storageModel.countDocuments({
                    userId,
                    name: {
                        $regex: `.*${keyword}.*`,
                        $options: 'i',
                    },
                    ...softDeleteCondition,
                }),
            ]);

            return {
                items: storageList,
                totalItems: total,
            };
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
