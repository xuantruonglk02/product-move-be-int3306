import {
    Body,
    Controller,
    Delete,
    HttpStatus,
    InternalServerErrorException,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
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
import { UserService } from '../user/services/user.service';
import { UserRole } from '../user/user.constants';
import { userMessages } from '../user/user.messages';
import { ICreateUser } from './admin.interfaces';
import { adminMessages } from './admin.messages';
import { createUserSchema } from './admin.validators';
import { AdminService } from './services/admin.service';

@Controller('/admin')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly userService: UserService,
    ) {}

    @Post('/user')
    async createUser(
        @Req() req,
        @Body(new TrimBodyPipe(), new JoiValidationPipe(createUserSchema))
        body: ICreateUser,
    ) {
        try {
            const user = await this.userService.getUserByField(
                {
                    key: 'email',
                    value: body.email,
                },
                ['id'],
            );
            if (user) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.CONFLICT,
                        message: userMessages.errors.userExists,
                        key: 'email',
                    },
                ]);
            }

            body.password = hashPassword(body.password);
            body.createdBy = req.loggedUser.id;
            const newUser = await this.adminService.createUser(body);
            return new SuccessResponse(
                newUser,
                adminMessages.success.createUser,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete('/user/:id')
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
                        message: userMessages.errors.userNotFound,
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
                adminMessages.success.deleteUser,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
