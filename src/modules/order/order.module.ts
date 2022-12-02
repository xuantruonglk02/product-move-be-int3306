import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    ProductLine,
    ProductLineSchema,
} from '../product/schemas/product-line.schema';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import { OrderDetail, OrderDetailSchema } from './schemas/order-detail.schema';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderService } from './services/order.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
        MongooseModule.forFeature([
            { name: OrderDetail.name, schema: OrderDetailSchema },
        ]),
        MongooseModule.forFeature([
            { name: Product.name, schema: ProductSchema },
        ]),
        MongooseModule.forFeature([
            { name: ProductLine.name, schema: ProductLineSchema },
        ]),
    ],
    controllers: [],
    providers: [OrderService],
})
export class OrderModule {}
