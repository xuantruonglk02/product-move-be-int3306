import { MiddlewareConsumer, Module, NestModule, Scope } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import mongoose from 'mongoose';
import ConfigKey from './common/config/configKey';
import { AppController } from './app.controller';
import { AllExceptionsFilter } from './common/exceptions.filter';
import { MongoModule } from './common/services/mongo.service';
import { TransformInterceptor } from './common/transform.interceptor';
import { AdminModule } from './modules/admin/admin.module';
import { AgencyModule } from './modules/agency/agency.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrderModule } from './modules/order/order.module';
import { ProducerModule } from './modules/producer/producer.module';
import { ProductModule } from './modules/product/product.module';
import { StorageModule } from './modules/storage/storage.module';
import { UserModule } from './modules/user/user.module';
import { warrantyCenterModule } from './modules/warranty-center/warranty-center.module';
import { HeaderMiddleware } from './common/middlewares/header.middleware';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
        }),
        MongoModule,
        AuthModule,
        UserModule,
        StorageModule,
        ProductModule,
        AdminModule,
        ProducerModule,
        AgencyModule,
        warrantyCenterModule,
        OrderModule,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_FILTER,
            scope: Scope.REQUEST,
            useClass: AllExceptionsFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TransformInterceptor,
        },
    ],
    exports: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(HeaderMiddleware).forRoutes('*');
        mongoose.set('debug', process.env[ConfigKey.MONGO_DEBUG] === 'enable');
    }
}
