import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Storage, StorageSchema } from './schemas/storage.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Storage.name, schema: StorageSchema },
        ]),
    ],
    controllers: [],
    providers: [],
})
export class StorageModule {}
