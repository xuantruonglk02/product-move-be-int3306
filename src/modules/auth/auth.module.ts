import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/services/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [AuthController],
    providers: [JwtService, AuthService, UserService],
})
export class AuthModule {}
