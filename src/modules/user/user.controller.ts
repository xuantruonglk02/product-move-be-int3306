import {
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { HttpStatus } from 'src/common/constants';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
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
@UseGuards(AuthenticationGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/:id')
    async getUserDetail(@Param('id', new ParseIdPipe()) id: number) {
        try {
            const user = await this.userService.getUserDetail(id);
            if (!user) {
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    UserMessages.errors.userNotFound,
                    'id',
                );
            }

            return new SuccessResponse(user);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/')
    async createUser(
        @Req() req,
        @Body(new TrimBodyPipe(), new JoiValidationPipe(createUserSchema))
        body: ICreateUser,
    ) {
        try {
            const user = await this.userService.getUserByUsername(
                body.username,
            );
            if (user) {
                return new ErrorResponse(
                    HttpStatus.CONFLICT,
                    UserMessages.errors.userExists,
                    'username',
                );
            }
            body.password = hashPassword(body.password);
            // body.createdBy = req.loggedUser.id;
            body.createdBy = 1;
            const newUser = await this.userService.createUser(body);
            return new SuccessResponse(
                newUser,
                UserMessages.success.createUser,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
