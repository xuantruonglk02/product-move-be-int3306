import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import {
    OrderDetail,
    OrderDetailSchema,
} from '../order/schemas/order-detail.schema';
import { Order, OrderSchema } from '../order/schemas/order.schema';
import { OrderService } from '../order/services/order.service';
import {
    ProductLine,
    ProductLineSchema,
} from '../product/schemas/product-line.schema';
import {
    ProductStatusTransition,
    ProductStatusTransitionSchema,
} from '../product/schemas/product-status-transition.schema';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import { ProductService } from '../product/services/product.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { UserService } from '../user/services/user.service';
import { AgencyController } from './agency.controller';
import { AgencyService } from './services/agency.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: ProductStatusTransition.name,
                schema: ProductStatusTransitionSchema,
            },
        ]),
        MongooseModule.forFeature([
            { name: Product.name, schema: ProductSchema },
        ]),
        MongooseModule.forFeature([
            { name: ProductLine.name, schema: ProductLineSchema },
        ]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
        MongooseModule.forFeature([
            { name: OrderDetail.name, schema: OrderDetailSchema },
        ]),
    ],
    controllers: [AgencyController],
    providers: [
        JwtService,
        AgencyService,
        ProductService,
        UserService,
        OrderService,
    ],
})
export class AgencyModule {}
