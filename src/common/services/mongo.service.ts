import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import ConfigKey from '../config/configKey';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                return {
                    uri: configService.get<string>(
                        ConfigKey.MONGODB_CONNECTION_STRING,
                    ),
                };
            },
        }),
    ],
    providers: [],
})
export class MongoModule {}
