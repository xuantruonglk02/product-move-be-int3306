import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { MongoCollection } from 'src/common/constants';
import { BaseEntity } from 'src/common/mongo-schema/base.schema';
import { User } from 'src/modules/user/schemas/user.schema';
import { ProductStatus } from '../product.constants';
import { Product } from './product.schema';

export type ProductStatusTransitionDocument = ProductStatusTransition &
    Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.PRODUCT_STATUS_TRANSITIONS,
})
export class ProductStatusTransition extends BaseEntity {
    @Prop({
        type: Types.ObjectId,
        ref: Product.name,
        required: true,
    })
    productId: ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: User.name,
        required: true,
    })
    previousUserId: ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: User.name,
        required: true,
    })
    nextUserId: ObjectId;

    @Prop({
        type: String,
        enum: [...Object.values(ProductStatus)],
        required: true,
    })
    previousStatus: ProductStatus;

    @Prop({
        type: String,
        enum: [...Object.values(ProductStatus)],
        required: true,
    })
    nextStatus: ProductStatus;

    @Prop({
        type: Date,
        default: Date.now,
        required: true,
    })
    startDate: Date;

    @Prop({
        type: Date,
        required: false,
    })
    finishDate: Date;
}

export const ProductStatusTransitionSchema = SchemaFactory.createForClass(
    ProductStatusTransition,
);
ProductStatusTransitionSchema.index(
    {
        productId: 1,
        previousUserId: 1,
        nextUserId: 1,
    },
    {
        unique: false,
    },
);

export const productStatusTransitionAttributes = [
    'productId',
    'previousUserId',
    'nextUserId',
    'previousStatus',
    'nextStatus',
    'startDate',
    'finishDate',
];
