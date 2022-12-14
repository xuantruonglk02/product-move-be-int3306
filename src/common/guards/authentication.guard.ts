import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserTokenType } from 'src/modules/auth/auth.constants';
import ConfigKey from '../config/configKey';
import { extractToken } from '../helpers/utilityFunctions';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = extractToken(request.headers.authorization || '');
        if (!token) {
            throw new UnauthorizedException();
        }

        const decrypt = await this.validateToken(
            token,
            request.authorizationType === UserTokenType.REFRESH_TOKEN,
        );
        request.loggedUser = decrypt._doc;
        request.accessToken = token;
        return true;
    }

    async validateToken(token: string, isRefreshToken = false) {
        try {
            if (isRefreshToken) {
                return await this.jwtService.verify(token, {
                    secret: this.configService.get(
                        ConfigKey.JWT_REFRESH_TOKEN_SECRET_KEY,
                    ),
                    ignoreExpiration: false,
                });
            } else {
                return await this.jwtService.verify(token, {
                    secret: this.configService.get(
                        ConfigKey.JWT_ACCESS_TOKEN_SECRET_KEY,
                    ),
                    ignoreExpiration: false,
                });
            }
        } catch (error) {
            throw new UnauthorizedException();
        }
    }
}
