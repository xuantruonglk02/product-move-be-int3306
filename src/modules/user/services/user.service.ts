import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { cloneDeep, unset } from 'lodash';
import { ObjectId } from 'mongodb';
import { Connection, Model } from 'mongoose';
import { softDeleteCondition } from 'src/common/constants';
import { User, userAttributes, UserDocument } from '../schemas/user.schema';
import { ICreateUser, IUpdateUser } from '../user.interfaces';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        @InjectConnection()
        private readonly connection: Connection,
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

    async createUser(body: ICreateUser) {
        try {
            return await this.userModel.create({
                ...body,
                createdAt: new Date(),
            });
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
            session.startTransaction();

            await this.userModel.updateOne(
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
            );

            // TODO: Delete storage;

            await session.commitTransaction();

            return this.getUserByField({ key: '_id', value: id });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
