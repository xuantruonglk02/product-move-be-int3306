import {
    Body,
    Controller,
    HttpStatus,
    InternalServerErrorException,
    Post,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { TrimBodyPipe } from 'src/common/pipes/trimBody.pipe';
import { UserService } from '../user/services/user.service';
import { ILogin } from './auth.interfaces';
import { AuthMessages } from './auth.messages';
import { loginSchema } from './auth.validators';
import { AuthService } from './services/auth.service';

@Controller('/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) {}

    @Post('/login')
    async login(
        @Body(new TrimBodyPipe(), new JoiValidationPipe(loginSchema))
        body: ILogin,
    ) {
        try {
            const user = await this.userService.getUserByField(
                {
                    key: 'username',
                    value: body.username,
                },
                ['password'],
            );
            if (!user) {
                return new ErrorResponse(HttpStatus.UNAUTHORIZED, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: AuthMessages.errors.userNotFound,
                        key: 'username',
                    },
                ]);
            }

            const matchPassword = await bcrypt.compare(
                body.password,
                user.password,
            );
            if (!matchPassword) {
                return new ErrorResponse(HttpStatus.UNAUTHORIZED, [
                    {
                        code: HttpStatus.UNAUTHORIZED,
                        message: AuthMessages.errors.wrongPassword,
                        key: 'password',
                    },
                ]);
            }

            const loggedUser = await this.authService.login(body.username);
            return new SuccessResponse({
                user: loggedUser.user,
                accessToken: loggedUser.accessToken,
                refreshToken: loggedUser.refreshToken,
            });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
