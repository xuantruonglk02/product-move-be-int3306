import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/services/user.service';
import { AdminController } from './admin.controller';
import { AdminService } from './services/admin.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [AdminController],
    providers: [JwtService, AdminService, UserService],
})
export class AdminModule {}
