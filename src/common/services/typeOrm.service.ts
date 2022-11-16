import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule as TypeORMModule } from '@nestjs/typeorm';
import ConfigKey from '../config/configKey';

@Module({
    imports: [
        TypeORMModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get(ConfigKey.DB_HOST),
                port: configService.get(ConfigKey.DB_PORT),
                username: configService.get(ConfigKey.DB_USERNAME),
                password: configService.get(ConfigKey.DB_PASSWORD),
                database: configService.get(ConfigKey.DB_NAME),
                entities: [
                    __dirname + '/../../modules/**/entities/*.entity{.ts,.js}',
                ],
                synchronize: true,
                logging: configService.get(ConfigKey.DB_DEBUG).split(','),
            }),
        }),
    ],
})
export class TypeOrmModule {}
