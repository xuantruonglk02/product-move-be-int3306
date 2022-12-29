import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Storage, StorageSchema } from '../storage/schemas/storage.schema';
import { StorageService } from '../storage/services/storage.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { UserService } from '../user/services/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([
            { name: Storage.name, schema: StorageSchema },
        ]),
    ],
    controllers: [AuthController],
    providers: [JwtService, AuthService, UserService, StorageService],
})
export class AuthModule {}
