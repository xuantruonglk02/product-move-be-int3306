import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import ConfigKey from 'src/common/config/configKey';
import { SqlEntity } from 'src/common/constants';
import { User, userAttributes } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/services/user.service';
import { UserRole } from 'src/modules/user/user.constants';
import { IUser } from 'src/modules/user/user.interfaces';
import { Repository } from 'typeorm';
import { IRegister } from '../auth.interfaces';
import { UserToken } from '../entities/userToken.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserToken)
        private readonly userTokenRepository: Repository<UserToken>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) {}

    generateAccessToken(user: IUser) {
        try {
            const secretAccessTokenKey = this.configService.get(
                ConfigKey.JWT_ACCESS_TOKEN_SECRET_KEY,
            );
            const accessTokenExpiresIn = this.configService.get(
                ConfigKey.JWT_ACCESS_TOKEN_EXPIRED_IN,
            );
            const accessTokenOptions = {
                secret: secretAccessTokenKey,
                expiresIn: accessTokenExpiresIn,
            };
            const accessTokenPayload = {
                ...user,
                expiresIn: accessTokenExpiresIn,
            };
            const accessToken = this.jwtService.sign(
                accessTokenPayload,
                accessTokenOptions,
            );
            return accessToken;
        } catch (error) {
            throw error;
        }
    }

    generateRefreshToken(user: IUser) {
        try {
            const secretRefreshTokenKey = this.configService.get(
                ConfigKey.JWT_REFRESH_TOKEN_SECRET_KEY,
            );
            const refreshTokenExpiresIn = this.configService.get(
                ConfigKey.JWT_REFRESH_TOKEN_EXPIRED_IN,
            );
            const refreshTokenOptions = {
                secret: secretRefreshTokenKey,
                expiresIn: refreshTokenExpiresIn,
            };
            const refreshTokenPayload = {
                ...user,
                expiresIn: refreshTokenExpiresIn,
            };
            const refreshToken = this.jwtService.sign(
                refreshTokenPayload,
                refreshTokenOptions,
            );
            return refreshToken;
        } catch (error) {
            throw error;
        }
    }

    async login(email: string) {
        try {
            const user = await this.userService.getUserByField(
                { key: 'email', value: email },
                userAttributes,
            );

            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);

            return {
                user,
                accessToken,
                refreshToken,
            };
        } catch (error) {
            throw error;
        }
    }

    async createUser(body: IRegister) {
        try {
            const inserted = await this.userRepository
                .createQueryBuilder()
                .insert()
                .into(SqlEntity.USERS, userAttributes.concat(['password']))
                .values([
                    {
                        email: body.email,
                        phoneNumber: body.phoneNumber,
                        firstName: body.firstName,
                        lastName: body.lastName,
                        role: UserRole.CONSUMER,
                        password: body.password,
                    },
                ])
                .execute();
            return await this.userService.getUserByField({
                key: 'id',
                value: inserted.raw.insertId,
            });
        } catch (error) {
            throw error;
        }
    }
}
