import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductLine } from '../product/entities/product-line.entity';
import { ProductStatusTransition } from '../product/entities/product-status-transition.entity';
import { Product } from '../product/entities/product.entity';
import { ProductService } from '../product/services/product.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/services/user.service';
import { AdminController } from './admin.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([ProductLine]),
        TypeOrmModule.forFeature([Product]),
        TypeOrmModule.forFeature([ProductStatusTransition]),
    ],
    controllers: [AdminController],
    providers: [JwtService, UserService, ProductService],
})
export class AdminModule {}
