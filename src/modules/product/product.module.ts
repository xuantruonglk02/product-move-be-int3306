import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductController } from './product.controller';
import {
    ProductErrorReport,
    ProductErrorReportSchema,
} from './schemas/product-error-report.schema';
import { ProductLine, ProductLineSchema } from './schemas/product-line.schema';
import {
    ProductStatusTransition,
    ProductStatusTransitionSchema,
} from './schemas/product-status-transition.schema';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductService } from './services/product.service';

@Module({
    imports: [
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
        MongooseModule.forFeature([
            {
                name: ProductErrorReport.name,
                schema: ProductErrorReportSchema,
            },
        ]),
    ],
    controllers: [ProductController],
    providers: [JwtService, ProductService],
})
export class ProductModule {}
