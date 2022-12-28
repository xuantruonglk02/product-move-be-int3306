import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { MongoCollection } from 'src/common/constants';
import { BaseEntity } from 'src/common/mongo-schema/base.schema';
import { Product } from './product.schema';

export type ProductImageDocument = ProductImage & Document;

@Schema({
    timestamps: true,
    versionKey: false,
    collection: MongoCollection.PRODUCT_IMAGES,
})
export class ProductImage extends BaseEntity {
    @Prop({
        type: Types.ObjectId,
        ref: Product.name,
        required: true,
    })
    productId: ObjectId;

    @Prop({
        type: String,
        required: true,
    })
    url: string;
}

export const ProductImageSchema = SchemaFactory.createForClass(ProductImage);
ProductImageSchema.index(
    {
        productId: 1,
    },
    { unique: false },
);

export const productImageAttributes = ['productId', 'url'];
