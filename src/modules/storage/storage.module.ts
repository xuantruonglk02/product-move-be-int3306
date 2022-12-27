import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Storage, StorageSchema } from './schemas/storage.schema';
import { StorageService } from './services/storage.service';
import { StorageController } from './storage.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Storage.name, schema: StorageSchema },
        ]),
    ],
    controllers: [StorageController],
    providers: [JwtService, StorageService],
})
export class StorageModule {}
