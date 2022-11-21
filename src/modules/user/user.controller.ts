import {
    Body,
    Controller,
    Get,
    HttpStatus,
    InternalServerErrorException,
    Param,
    Patch,
    Req,
    UseGuards,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { hashPassword } from 'src/common/helpers/utilityFunctions';
import { ParseIdPipe } from 'src/common/pipes/id.validation.pipe';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { TrimBodyPipe } from 'src/common/pipes/trimBody.pipe';
import { authMessages } from '../auth/auth.messages';
import { UserService } from './services/user.service';
import { UserRole } from './user.constants';
import { IUpdateUser } from './user.interfaces';
import { userMessages } from './user.messages';
import { updateUserSchema } from './user.validators';

@Controller('/user')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/:id')
    async getUserDetail(@Param('id', new ParseIdPipe()) id: number) {
        try {
            const user = await this.userService.getUserByField({
                key: 'id',
                value: id,
            });
            if (!user) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: userMessages.errors.userNotFound,
                        key: 'id',
                    },
                ]);
            }

            return new SuccessResponse(user);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch('/:id')
    async updateUser(
        @Req() req,
        @Param('id', new ParseIdPipe()) id: number,
        @Body(new TrimBodyPipe(), new JoiValidationPipe(updateUserSchema))
        body: IUpdateUser,
    ) {
        try {
            const userRequested = await this.userService.getUserByField(
                { key: 'id', value: req.loggedUser.id },
                ['role', 'password'],
            );

            if (
                req.loggedUser.id !== id &&
                userRequested.role !== UserRole.ADMIN
            ) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.FORBIDDEN,
                        message: userMessages.errors.updateUserForbidden,
                        key: 'id',
                    },
                ]);
            }

            const matchPassword = await bcrypt.compare(
                body.confirmPassword,
                userRequested.password,
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

            if (body.password) {
                body.password = hashPassword(body.password);
            }
            body.updatedBy = req.loggedUser.id;
            const updatedUser = await this.userService.updateUser(id, body);
            return new SuccessResponse(updatedUser);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
