import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { MongoCollection } from 'src/common/constants';
import { BaseEntity } from 'src/common/mongo-schema/base.schema';
import { Product } from './product.schema';

export type ProductErrorReportDocument = ProductErrorReport & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.PRODUCT_ERROR_REPORTS,
})
export class ProductErrorReport extends BaseEntity {
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
    description: string;

    @Prop({
        type: Boolean,
        required: true,
        default: false,
    })
    solved: boolean;
}

export const ProductErrorReportSchema =
    SchemaFactory.createForClass(ProductErrorReport);
ProductErrorReportSchema.index(
    {
        productId: 1,
    },
    { unique: false },
);

export const productErrorReportAttributes = [
    'productId',
    'description',
    'solved',
];
