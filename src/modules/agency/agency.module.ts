import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from '../order/services/order.service';
import { ProductLine } from '../product/entities/product-line.entity';
import { ProductStatusTransition } from '../product/entities/product-status-transition.entity';
import { Product } from '../product/entities/product.entity';
import { ProductService } from '../product/services/product.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/services/user.service';
import { AgencyController } from './agency.controller';
import { AgencyService } from './services/agency.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Product]),
        TypeOrmModule.forFeature([ProductLine]),
        TypeOrmModule.forFeature([ProductStatusTransition]),
        TypeOrmModule.forFeature([User]),
    ],
    controllers: [AgencyController],
    providers: [
        JwtService,
        AgencyService,
        UserService,
        ProductService,
        OrderService,
    ],
})
export class AgencyModule {}
