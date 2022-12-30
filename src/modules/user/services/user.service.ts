import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { cloneDeep, unset } from 'lodash';
import { ObjectId } from 'mongodb';
import { Connection, Model } from 'mongoose';
import {
    DEFAULT_ITEM_PER_PAGE_LIMIT,
    DEFAULT_ORDER_BY,
    DEFAULT_ORDER_DIRECTION,
    MIN_POSITIVE_NUMBER,
    OrderDirection,
    softDeleteCondition,
} from 'src/common/constants';
import {
    Storage,
    StorageDocument,
} from 'src/modules/storage/schemas/storage.schema';
import { StorageService } from 'src/modules/storage/services/storage.service';
import { User, userAttributes, UserDocument } from '../schemas/user.schema';
import { ICreateUser, IGetUserList, IUpdateUser } from '../user.interfaces';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        @InjectModel(Storage.name)
        private readonly storageModel: Model<StorageDocument>,
        @InjectConnection()
        private readonly connection: Connection,
        private readonly storageService: StorageService,
    ) {}

    async getUserByField(
        field: { key: string; value: any },
        attrs = userAttributes,
    ) {
        try {
            return await this.userModel
                .findOne({
                    [field.key]: field.value,
                    ...softDeleteCondition,
                })
                .select(attrs);
        } catch (error) {
            throw error;
        }
    }

    async getUserList(query: IGetUserList) {
        try {
            const {
                page = MIN_POSITIVE_NUMBER,
                limit = DEFAULT_ITEM_PER_PAGE_LIMIT,
                orderDirection = DEFAULT_ORDER_DIRECTION,
                orderBy = DEFAULT_ORDER_BY,
            } = query;

            const getListQuery: Record<string, any> = {
                ...softDeleteCondition,
            };
            if (query.role) {
                getListQuery.role = query.role;
            }

            const [userList, total] = await Promise.all([
                this.userModel
                    .find(getListQuery)
                    .select(userAttributes)
                    .sort({
                        [orderBy]:
                            orderDirection === OrderDirection.ASCENDING
                                ? 1
                                : -1,
                    })
                    .skip(limit * (page - 1))
                    .limit(limit),
                this.userModel.countDocuments(getListQuery),
            ]);

            return {
                items: userList,
                totalItems: total,
            };
        } catch (error) {
            throw error;
        }
    }

    async createUser(body: ICreateUser) {
        try {
            const user = await this.userModel.create({
                ...body,
                createdAt: new Date(),
            });
            return this.getUserByField({ key: '_id', value: user._id });
        } catch (error) {
            throw error;
        }
    }

    async updateUser(id: ObjectId, body: IUpdateUser) {
        try {
            const updateBody = cloneDeep(body);
            unset(updateBody, 'confirmPassword');

            await this.userModel.updateOne(
                {
                    _id: id,
                    ...softDeleteCondition,
                },
                {
                    $set: {
                        ...updateBody,
                        updatedAt: new Date(),
                    },
                },
            );
            return await this.getUserByField({ key: '_id', value: id });
        } catch (error) {
            throw error;
        }
    }

    async deleteUser(id: ObjectId, deletedBy: ObjectId) {
        const session = await this.connection.startSession();

        try {
            const storages = await this.storageService.getStoragesByUserId(id);

            session.startTransaction();

            const user = await this.userModel
                .findOneAndUpdate(
                    {
                        _id: id,
                        ...softDeleteCondition,
                    },
                    {
                        $set: {
                            deletedBy: deletedBy,
                            deletedAt: new Date(),
                        },
                    },
                    { session },
                )
                .select(userAttributes);
            await this.storageModel.updateMany(
                {
                    _id: {
                        $in: storages.map((storage) => storage._id),
                    },
                    ...softDeleteCondition,
                },
                {
                    $set: {
                        deletedBy: deletedBy,
                        deletedAt: new Date(),
                    },
                },
                { session },
            );

            await session.commitTransaction();

            return {
                user,
                storages,
            };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
