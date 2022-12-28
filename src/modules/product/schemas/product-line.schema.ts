import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MongoCollection } from 'src/common/constants';
import { BaseEntity } from 'src/common/mongo-schema/base.schema';

export type ProductLineDocument = ProductLine & Document;

@Schema({
    timestamps: true,
    versionKey: false,
    collection: MongoCollection.PRODUCT_LINES,
})
export class ProductLine extends BaseEntity {
    @Prop({
        type: String,
        required: true,
    })
    name: string;

    @Prop({
        type: Number,
        required: true,
    })
    price: number;

    @Prop({
        type: Number,
        default: 0,
        required: true,
    })
    quantityOfProduct: number;
}

export const ProductLineSchema = SchemaFactory.createForClass(ProductLine);
ProductLineSchema.index(
    {
        name: 1,
    },
    {
        unique: false,
    },
);

export const productLineAttributes = ['name', 'price', 'quantityOfProduct'];
