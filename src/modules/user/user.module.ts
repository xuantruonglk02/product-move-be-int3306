import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Storage, StorageSchema } from '../storage/schemas/storage.schema';
import { StorageService } from '../storage/services/storage.service';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './services/user.service';
import { UserController } from './user.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([
            { name: Storage.name, schema: StorageSchema },
        ]),
    ],
    controllers: [UserController],
    providers: [JwtService, UserService, StorageService],
})
export class UserModule {}
