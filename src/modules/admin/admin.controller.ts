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
import { ObjectId } from 'mongodb';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import {
    AuthorizationGuard,
    Roles,
} from 'src/common/guards/authorization.guard';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { hashPassword } from 'src/common/helpers/utilityFunctions';
import { ConvertObjectIdPipe } from 'src/common/pipes/convertObjectId.pipe';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { ParseObjectIdPipe } from 'src/common/pipes/objectId.validation.pipe';
import { TrimBodyPipe } from 'src/common/pipes/trimBody.pipe';
import { ICreateProductLine } from '../product/product.interfaces';
import { createProductLineSchema } from '../product/product.validators';
import { ProductService } from '../product/services/product.service';
import { StorageService } from '../storage/services/storage.service';
import { ICreateStorage } from '../storage/storage.interfaces';
import { storageMessage } from '../storage/storage.messages';
import { createStorageSchema } from '../storage/storage.validators';
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
        private readonly storageService: StorageService,
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
                ['_id'],
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
            body.createdBy = new ObjectId(req.loggedUser._id);
            const newUser = await this.userService.createUser(body);
            return new SuccessResponse(newUser);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete('/user/:id')
    async deleteUser(
        @Req() req,
        @Param('id', new ParseObjectIdPipe()) id: ObjectId,
    ) {
        try {
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

            const deletedUser = await this.userService.deleteUser(
                id,
                new ObjectId(req.loggedUser._id),
            );
            return new SuccessResponse(deletedUser);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/storage')
    async createStorage(
        @Req() req,
        @Body(
            new TrimBodyPipe(),
            new JoiValidationPipe(createStorageSchema),
            new ConvertObjectIdPipe(),
        )
        body: ICreateStorage,
    ) {
        try {
            const user = await this.userService.getUserByField(
                { key: '_id', value: body.userId },
                ['_id', 'role'],
            );
            if (!user) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: userMessages.errors.userNotFound,
                        key: 'userId',
                    },
                ]);
            }
            if (
                [
                    UserRole.ADMIN,
                    UserRole.WARRANTY_CENTER,
                    UserRole.CONSUMER,
                ].includes(user.role)
            ) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: storageMessage.errors.createForbidden,
                        key: 'userId',
                    },
                ]);
            }

            body.createdBy = new ObjectId(req.loggedUser._id);
            const storage = await this.storageService.createStorage(body);
            return new SuccessResponse(storage);
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
            body.createdBy = new ObjectId(req.loggedUser._id);
            const newProductLine =
                await this.productService.createNewProductLine(body);
            return new SuccessResponse(newProductLine);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
