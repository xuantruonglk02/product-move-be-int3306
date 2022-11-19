import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    InternalServerErrorException,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { UserRole } from 'src/common/constants';
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
import { UserService } from './services/user.service';
import { ICreateUser } from './user.interfaces';
import { UserMessages } from './user.messages';
import { createUserSchema } from './user.validators';

@Controller('/user')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/:id')
    async getUserDetail(@Param('id', new ParseIdPipe()) id: number) {
        try {
            const user = await this.userService.getOneUserByField({
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
            const user = await this.userService.getOneUserByField(
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
            const newUser = await this.userService.createUser(body);
            return new SuccessResponse(
                newUser,
                UserMessages.success.createUser,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete('/:id')
    @Roles(UserRole.ADMIN)
    async deleteUser(@Req() req, @Param('id', new ParseIdPipe()) id: number) {
        try {
            const user = await this.userService.getOneUserByField(
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

            const deletedUser = await this.userService.deleteUser(
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
