import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MongoCollection } from 'src/common/constants';
import { BaseEntity } from 'src/common/mongo-schema/base.schema';

export type OrderDocument = Order & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.ORDERS,
})
export class Order extends BaseEntity {
    @Prop({
        type: String,
        required: true,
    })
    customerName: string;

    @Prop({
        type: String,
        required: true,
    })
    customerEmail: string;

    @Prop({
        type: String,
        required: false,
    })
    customerPhone: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

export const orderAttributes = [
    'customerName',
    'customerEmail',
    'customerPhone',
];
