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
import { userMessages } from '../user/user.messages';
import { ILogin } from './auth.interfaces';
import { authMessages } from './auth.messages';
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
                    key: 'email',
                    value: body.email,
                },
                ['password'],
            );
            if (!user) {
                return new ErrorResponse(HttpStatus.UNAUTHORIZED, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: userMessages.errors.userNotFound,
                        key: 'email',
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
                        message: authMessages.errors.wrongPassword,
                        key: 'password',
                    },
                ]);
            }

            const loggedUser = await this.authService.login(body.email);
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
