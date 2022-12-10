import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { MongoCollection } from 'src/common/constants';
import { BaseEntity } from 'src/common/mongo-schema/base.schema';
import { Storage } from 'src/modules/storage/schemas/storage.schema';
import { User } from 'src/modules/user/schemas/user.schema';
import {
    ProductColor,
    ProductLocation,
    ProductStatus,
} from '../product.constants';
import { ProductLine } from './product-line.schema';

export type ProductDocument = Product & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.PRODUCTS,
})
export class Product extends BaseEntity {
    @Prop({
        type: Types.ObjectId,
        ref: ProductLine.name,
        required: true,
    })
    productLineId: ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: User.name,
        required: false,
    })
    userId: ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Storage.name,
        required: false,
    })
    storageId: ObjectId;

    @Prop({
        type: String,
        required: true,
    })
    name: string;

    @Prop({
        type: String,
        required: true,
    })
    description: string;

    @Prop({
        type: String,
        enum: [...Object.values(ProductStatus)],
        default: ProductStatus.NEW,
        required: true,
    })
    status: ProductStatus;

    @Prop({
        type: String,
        enum: [...Object.values(ProductLocation)],
        default: ProductLocation.IN_PRODUCER,
        required: true,
    })
    location: ProductLocation;

    @Prop({
        type: Boolean,
        default: false,
        required: true,
    })
    sold: boolean;

    @Prop({
        type: Date,
        require: false,
    })
    soldDate: Date;

    @Prop({
        type: Number,
        required: true,
    })
    weight: number;

    @Prop({
        type: Number,
        required: true,
    })
    displaySize: number;

    @Prop({
        type: String,
        required: true,
    })
    bodySize: string;

    @Prop({
        type: String,
        enum: [...Object.values(ProductColor)],
        required: true,
    })
    color: ProductColor;

    @Prop({
        type: String,
        required: true,
    })
    bodyBuild: string;

    @Prop({
        type: Number,
        required: true,
    })
    batteryVolume: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index(
    {
        productLineId: 1,
        userId: 1,
        storageId: 1,
        name: 1,
        status: 1,
        location: 1,
    },
    {
        unique: false,
    },
);

export const productAttributes = [
    'productLineId',
    'userId',
    'storageId',
    'name',
    'description',
    'status',
    'location',
    'sold',
    'soldDate',
    'weight',
    'displaySize',
    'bodySize',
    'color',
    'bodyBuild',
    'batteryVolume',
];
