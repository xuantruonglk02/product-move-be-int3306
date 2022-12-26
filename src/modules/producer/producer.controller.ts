import {
    Body,
    Controller,
    Get,
    HttpStatus,
    InternalServerErrorException,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import {
    AuthorizationGuard,
    Roles,
} from 'src/common/guards/authorization.guard';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { TrimBodyPipe } from 'src/common/pipes/trimBody.pipe';
import { ICreateProduct } from '../product/product.interfaces';
import { productMessages } from '../product/product.messages';
import { createProductSchema } from '../product/product.validators';
import { ProductService } from '../product/services/product.service';
import { UserService } from '../user/services/user.service';
import { StorageService } from '../storage/services/storage.service';
import { UserRole } from '../user/user.constants';
import { userMessages } from '../user/user.messages';
import { IExportNewProductToAgency } from './producer.interfaces';
import { producerMessages } from './producer.messages';
import { exportNewProductToAgencySchema } from './producer.validators';
import { ProducerService } from './services/producer.service';
import { storageMessage } from '../storage/storage.messages';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/removeEmptyQuery.pipe';
import { commonListQuerySchema } from 'src/common/constants';
import { ICommonListQuery } from 'src/common/interfaces';
import { ICreateStorage } from '../storage/storage.interfaces';
import { createOwnStorageSchema } from '../storage/storage.validators';
import { ObjectId } from 'mongodb';
import { convertObjectId } from 'src/common/helpers/utilityFunctions';

@Controller('/producer')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(UserRole.PRODUCER)
export class ProducerController {
    constructor(
        private readonly producerService: ProducerService,
        private readonly productService: ProductService,
        private readonly userService: UserService,
        private readonly storageService: StorageService,
    ) {}

    @Get('/storage')
    async getStorageList(
        @Req() req,
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(commonListQuerySchema),
        )
        query: ICommonListQuery,
    ) {
        try {
            return new SuccessResponse(
                await this.storageService.getStorageList({
                    ...query,
                    userId: new ObjectId(req.loggedUser._id),
                }),
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/storage')
    async createStorage(
        @Req() req,
        @Body(new TrimBodyPipe(), new JoiValidationPipe(createOwnStorageSchema))
        body: ICreateStorage,
    ) {
        try {
            body.userId = new ObjectId(req.loggedUser._id);
            body.createdBy = new ObjectId(req.loggedUser._id);
            const storage = await this.storageService.createStorage(body);
            return new SuccessResponse(storage);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/product')
    async createProduct(
        @Req() req,
        @Body(new TrimBodyPipe(), new JoiValidationPipe(createProductSchema))
        body: ICreateProduct,
    ) {
        try {
            convertObjectId(body, ['productLineId', 'storageId']);

            const productLine = await this.productService.getProductLineDetail(
                body.productLineId,
                ['_id'],
            );
            if (!productLine) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: productMessages.errors.productLineNotFound,
                        key: 'productLineId',
                    },
                ]);
            }

            const storage = await this.storageService.getStorageById(
                body.storageId,
                ['userId'],
            );
            if (!storage) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: storageMessage.errors.notFound,
                        key: 'storageId',
                    },
                ]);
            }
            if (storage.userId.toString() !== req.loggedUser._id.toString()) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: producerMessages.errors.wrongStorage,
                        key: 'storageId',
                    },
                ]);
            }

            body.userId = new ObjectId(req.loggedUser._id);
            body.createdBy = new ObjectId(req.loggedUser._id);
            const newProduct = await this.productService.createNewProduct(body);
            return new SuccessResponse(newProduct);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/export-to-agency')
    async exportNewProductToAgency(
        @Req() req,
        @Body(
            new TrimBodyPipe(),
            new JoiValidationPipe(exportNewProductToAgencySchema),
        )
        body: IExportNewProductToAgency,
    ) {
        try {
            convertObjectId(body, ['agencyId', 'storageId', 'productIds']);

            const agency = await this.userService.getUserByField(
                {
                    key: '_id',
                    value: body.agencyId,
                },
                ['role'],
            );
            if (!agency) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: userMessages.errors.userNotFound,
                        key: 'agencyId',
                    },
                ]);
            }
            if (agency.role !== UserRole.AGENCY) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.FORBIDDEN,
                        message: producerMessages.errors.notAgency,
                        key: 'agencyId',
                    },
                ]);
            }

            const storage = await this.storageService.getStorageById(
                body.agencyStorageId,
                ['userId'],
            );
            if (!storage) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: storageMessage.errors.notFound,
                        key: 'storageId',
                    },
                ]);
            }
            if (storage.userId.toString() !== agency._id.toString()) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: producerMessages.errors.wrongStorage,
                        key: 'storageId',
                    },
                ]);
            }

            const products = await this.productService.getProductByIds(
                body.productIds,
                ['storageId'],
            );
            if (products.length !== body.productIds.length) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: productMessages.errors.productNotFound,
                        key: 'productIds',
                    },
                ]);
            }
            if (
                !products.every(
                    (product) =>
                        product.storageId &&
                        product.storageId.toString() ===
                            products[0].storageId.toString(),
                )
            ) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: producerMessages.errors.wrongProducts,
                        key: 'productIds',
                    },
                ]);
            }

            const productStorage = await this.storageService.getStorageById(
                products[0].storageId,
                ['userId'],
            );
            if (!productStorage.userId !== req.loggedUser._id.toString()) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: producerMessages.errors.wrongProducts,
                        key: 'productIds',
                    },
                ]);
            }

            const transition =
                await this.producerService.exportNewProductToAgency(
                    new ObjectId(req.loggedUser._id),
                    products[0].storageId,
                    body,
                );
            return new SuccessResponse(transition);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
