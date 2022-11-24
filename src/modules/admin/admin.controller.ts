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
import { ICreateProductLine } from '../product/product.interfaces';
import { productMessages } from '../product/product.messages';
import { createProductLineSchema } from '../product/product.validators';
import { ProductService } from '../product/services/product.service';
import { UserService } from '../user/services/user.service';
import { UserRole } from '../user/user.constants';
import { ICreateUser } from '../user/user.interfaces';
import { userMessages } from '../user/user.messages';
import { createUserSchema } from '../user/user.validators';

@Controller('/admin')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(
        private readonly userService: UserService,
        private readonly productService: ProductService,
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
            const newUser = await this.userService.createUser(body);
            return new SuccessResponse(
                newUser,
                userMessages.success.createUser,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete('/user/:id')
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

            const deletedUser = await this.userService.deleteUser(
                id,
                req.loggedUser.id,
            );
            return new SuccessResponse(
                deletedUser,
                userMessages.success.deleteUser,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/product-line')
    async createProductLine(
        @Req() req,
        @Body(
            new TrimBodyPipe(),
            new JoiValidationPipe(createProductLineSchema),
        )
        body: ICreateProductLine,
    ) {
        try {
            const productLine = await this.productService.getProductLineDetail(
                body.id,
            );
            if (productLine) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.CONFLICT,
                        message: productMessages.errors.productLineExists,
                        key: 'id',
                    },
                ]);
            }

            body.createdBy = req.loggedUser.id;
            const newProductLine =
                await this.productService.createNewProductLine(body);
            return new SuccessResponse(
                newProductLine,
                productMessages.success.createProductLine,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
