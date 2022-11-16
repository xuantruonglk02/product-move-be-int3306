import { Module, Scope } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AllExceptionsFilter } from './common/exceptions.filter';
import { TypeOrmModule } from './common/services/typeOrm.service';
import { TransformInterceptor } from './common/transform.interceptor';
import { UserModule } from './modules/user/user.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
        }),
        TypeOrmModule,
        UserModule,
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
export class AppModule {}
