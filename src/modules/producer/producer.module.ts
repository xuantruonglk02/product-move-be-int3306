import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductLine } from '../product/entities/product-line.entity';
import { Product } from '../product/entities/product.entity';
import { ProductService } from '../product/services/product.service';
import { ProducerController } from './producer.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([ProductLine]),
        TypeOrmModule.forFeature([Product]),
    ],
    controllers: [ProducerController],
    providers: [JwtService, ProductService],
})
export class ProducerModule {}
