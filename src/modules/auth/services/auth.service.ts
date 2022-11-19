import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import ConfigKey from 'src/common/config/configKey';
import { UserService } from 'src/modules/user/services/user.service';
import { IUser } from 'src/modules/user/user.interfaces';
import { Repository } from 'typeorm';
import { UserToken } from '../entities/userToken.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserToken)
        private readonly userTokenRepository: Repository<UserToken>,
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

    async login(username: string) {
        try {
            const user = await this.userService.getUserByField(
                { key: 'username', value: username },
                ['id', 'username', 'role'],
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
}
