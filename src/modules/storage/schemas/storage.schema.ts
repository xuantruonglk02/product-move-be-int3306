import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { MongoCollection } from 'src/common/constants';
import { BaseEntity } from 'src/common/mongo-schema/base.schema';
import { User } from 'src/modules/user/schemas/user.schema';

export type StorageDocument = Storage & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.STORAGES,
})
export class Storage extends BaseEntity {
    @Prop({
        type: Types.ObjectId,
        ref: User.name,
        required: true,
    })
    userId: ObjectId;

    @Prop({
        type: String,
        required: true,
    })
    name: string;

    @Prop({
        type: String,
        required: true,
    })
    address: string;
}

export const StorageSchema = SchemaFactory.createForClass(Storage);
StorageSchema.index(
    {
        userId: 1,
    },
    {
        unique: false,
    },
);

export const storageAttributes = ['userId', 'name', 'address'];
