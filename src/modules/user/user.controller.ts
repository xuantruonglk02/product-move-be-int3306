import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    InternalServerErrorException,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import {
    AuthorizationGuard,
    Roles,
} from 'src/common/guards/authorization.guard';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { hashPassword } from 'src/common/helpers/utilityFunctions';
import { ParseIdPipe } from 'src/common/pipes/id.validation.pipe';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { TrimBodyPipe } from 'src/common/pipes/trimBody.pipe';
import { AuthMessages } from '../auth/auth.messages';
import { AdminService } from './services/admin.service';
import { UserService } from './services/user.service';
import { UserRole } from './user.constants';
import { ICreateUser, IUpdateUser } from './user.interfaces';
import { UserMessages } from './user.messages';
import { createUserSchema, updateUserSchema } from './user.validators';

@Controller('/user')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class UserController {
    constructor(
        private readonly adminService: AdminService,
        private readonly userService: UserService,
    ) {}

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
                        message: UserMessages.errors.userNotFound,
                        key: 'id',
                    },
                ]);
            }

            return new SuccessResponse(user);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/')
    @Roles(UserRole.ADMIN)
    async createUser(
        @Req() req,
        @Body(new TrimBodyPipe(), new JoiValidationPipe(createUserSchema))
        body: ICreateUser,
    ) {
        try {
            const user = await this.userService.getUserByField(
                {
                    key: 'username',
                    value: body.username,
                },
                ['id'],
            );
            if (user) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.CONFLICT,
                        message: UserMessages.errors.userExists,
                        key: 'username',
                    },
                ]);
            }

            body.password = hashPassword(body.password);
            body.createdBy = req.loggedUser.id;
            const newUser = await this.adminService.createUser(body);
            return new SuccessResponse(
                newUser,
                UserMessages.success.createUser,
            );
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

            const matchPassword = await bcrypt.compare(
                body.confirmPassword,
                userRequested.password,
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

            if (
                req.loggedUser.id !== id &&
                userRequested.role !== UserRole.ADMIN
            ) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.FORBIDDEN,
                        message: UserMessages.errors.updateUserForbidden,
                        key: 'id',
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

    @Delete('/:id')
    @Roles(UserRole.ADMIN)
    async deleteUser(@Req() req, @Param('id', new ParseIdPipe()) id: number) {
        try {
            const user = await this.userService.getUserByField(
                {
                    key: 'id',
                    value: id,
                },
                ['id'],
            );
            if (!user) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: UserMessages.errors.userNotFound,
                        key: 'id',
                    },
                ]);
            }

            const deletedUser = await this.adminService.deleteUser(
                id,
                req.loggedUser.id,
            );
            return new SuccessResponse(
                deletedUser,
                UserMessages.success.deleteUser,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
