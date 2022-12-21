import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { MongoCollection } from 'src/common/constants';
import { BaseEntity } from 'src/common/mongo-schema/base.schema';
import { Product } from './product.schema';

export type ProductReplacementDocument = ProductReplacement & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.PRODUCT_REPLACEMENTS,
})
export class ProductReplacement extends BaseEntity {
    @Prop({
        type: Types.ObjectId,
        ref: Product.name,
        required: true,
    })
    oldProductId: ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Product.name,
        required: true,
    })
    newProductId: ObjectId;
}

export const ProductReplacementSchema =
    SchemaFactory.createForClass(ProductReplacement);
ProductReplacementSchema.index(
    {
        oldProductId: 1,
        newProductId: 1,
    },
    {
        unique: false,
    },
);

export const productReplacementAttributes = ['oldProductId', 'newProductId'];
