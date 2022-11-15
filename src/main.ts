import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import ConfigKey from './common/config/configKey';
import './plugins/moment';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.use(helmet());

    const configService = app.get(ConfigService);

    const corsOptions: CorsOptions = {
        origin: (configService.get(ConfigKey.CORS_WHITELIST) || '').split(','),
        allowedHeaders: ['Content-Type', 'Authorization', 'Language'],
        optionsSuccessStatus: 200,
        methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    };
    app.enableCors(corsOptions);
    app.setGlobalPrefix(configService.get(ConfigKey.BASE_PATH));

    await app.listen(configService.get(ConfigKey.PORT));
}
bootstrap();
