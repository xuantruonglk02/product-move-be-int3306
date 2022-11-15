import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { MySqlModule } from './common/services/mysql.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
        }),
        MySqlModule,
    ],
    controllers: [AppController],
    providers: [],
    exports: [],
})
export class AppModule {}
