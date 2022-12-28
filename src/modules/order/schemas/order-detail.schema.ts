import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { MongoCollection } from 'src/common/constants';
import { BaseEntity } from 'src/common/mongo-schema/base.schema';
import { Product } from 'src/modules/product/schemas/product.schema';
import { Order } from './order.schema';

export type OrderDetailDocument = OrderDetail & Document;

@Schema({
    timestamps: true,
    versionKey: false,
    collection: MongoCollection.ORDER_DETAILS,
})
export class OrderDetail extends BaseEntity {
    @Prop({
        type: Types.ObjectId,
        ref: Order.name,
        required: true,
    })
    orderId: ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: Product.name,
        required: true,
    })
    productId: ObjectId;

    @Prop({
        type: Number,
        required: true,
    })
    productPrice: number;
}

export const OrderDetailSchema = SchemaFactory.createForClass(OrderDetail);
OrderDetailSchema.index(
    {
        orderId: 1,
        productId: 1,
    },
    {
        unique: false,
    },
);

export const orderDetailAttributes = ['orderId', 'productId', 'productPrice'];
