import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
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
import { AdminController } from './admin.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([
            { name: Product.name, schema: ProductSchema },
        ]),
        MongooseModule.forFeature([
            { name: ProductLine.name, schema: ProductLineSchema },
        ]),
        MongooseModule.forFeature([
            {
                name: ProductStatusTransition.name,
                schema: ProductStatusTransitionSchema,
            },
        ]),
    ],
    controllers: [AdminController],
    providers: [JwtService, UserService, ProductService],
})
export class AdminModule {}
