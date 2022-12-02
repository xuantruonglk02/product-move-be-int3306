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
import { ObjectId } from 'mongodb';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { hashPassword } from 'src/common/helpers/utilityFunctions';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { ParseObjectIdPipe } from 'src/common/pipes/objectId.validation.pipe';
import { TrimBodyPipe } from 'src/common/pipes/trimBody.pipe';
import { authMessages } from '../auth/auth.messages';
import { UserService } from './services/user.service';
import { UserRole } from './user.constants';
import { IUpdateUser } from './user.interfaces';
import { userMessages } from './user.messages';
import { updateUserSchema } from './user.validators';

@Controller('/user')
@UseGuards(AuthenticationGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/:id')
    async getUserDetail(@Param('id', new ParseObjectIdPipe()) id: ObjectId) {
        try {
            const user = await this.userService.getUserByField({
                key: '_id',
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
        @Param('id', new ParseObjectIdPipe()) id: ObjectId,
        @Body(new TrimBodyPipe(), new JoiValidationPipe(updateUserSchema))
        body: IUpdateUser,
    ) {
        try {
            const userRequested = await this.userService.getUserByField(
                { key: '_id', value: req.loggedUser._id },
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
                        message: authMessages.errors.wrongPassword,
                        key: 'password',
                    },
                ]);
            }

            const user = await this.userService.getUserByField(
                {
                    key: '_id',
                    value: id,
                },
                ['_id'],
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

            if (
                req.loggedUser._id.toString() !== id &&
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

            if (body.password) {
                body.password = hashPassword(body.password);
            }
            body.updatedBy = req.loggedUser._id;
            const updatedUser = await this.userService.updateUser(id, body);
            return new SuccessResponse(updatedUser);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
