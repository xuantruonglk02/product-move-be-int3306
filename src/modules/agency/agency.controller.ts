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
import { ConfigService } from '@nestjs/config';
import moment from 'moment';
import { ObjectId } from 'mongodb';
import ConfigKey from 'src/common/config/configKey';
import { commonListQuerySchema } from 'src/common/constants';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import {
    AuthorizationGuard,
    Roles,
} from 'src/common/guards/authorization.guard';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { convertObjectId } from 'src/common/helpers/utilityFunctions';
import { ICommonListQuery } from 'src/common/interfaces';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/removeEmptyQuery.pipe';
import { TrimBodyPipe } from 'src/common/pipes/trimBody.pipe';
import { ICreateOrder } from '../order/order.interfaces';
import { ProductLocation, ProductStatus } from '../product/product.constants';
import { productMessages } from '../product/product.messages';
import { ProductService } from '../product/services/product.service';
import { StorageService } from '../storage/services/storage.service';
import { ICreateStorage } from '../storage/storage.interfaces';
import { createOwnStorageSchema } from '../storage/storage.validators';
import { UserService } from '../user/services/user.service';
import { UserRole } from '../user/user.constants';
import { userMessages } from '../user/user.messages';
import {
    IImportNewProductFromProducer,
    IReceiveErrorProduct,
    IReturnFixedProduct,
} from './agency.interfaces';
import { agencyMessages } from './agency.messages';
import {
    checkoutProductSchema,
    importNewProductFromProducerSchema,
    receiveErrorProduct,
    returnFixedProduct,
} from './agency.validators';
import { AgencyService } from './services/agency.service';

@Controller('/agency')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(UserRole.AGENCY)
export class AgencyController {
    constructor(
        private readonly agencyService: AgencyService,
        private readonly productService: ProductService,
        private readonly userService: UserService,
        private readonly storageService: StorageService,
        private readonly configService: ConfigService,
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

    @Post('/import-new-product')
    async importNewProductFromProducer(
        @Req() req,
        @Body(
            new TrimBodyPipe(),
            new JoiValidationPipe(importNewProductFromProducerSchema),
        )
        body: IImportNewProductFromProducer,
    ) {
        try {
            convertObjectId(body, [
                'transitionId',
                'producerId',
                'agencyStorageId',
            ]);

            const producer = await this.userService.getUserByField(
                {
                    key: '_id',
                    value: body.producerId,
                },
                ['role'],
            );
            if (!producer) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: userMessages.errors.userNotFound,
                        key: 'producerId',
                    },
                ]);
            }
            if (producer.role !== UserRole.PRODUCER) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.FORBIDDEN,
                        message: agencyMessages.errors.notProducer,
                        key: 'producerId',
                    },
                ]);
            }

            const transition =
                await this.productService.getProductStatusTransition(
                    body.transitionId,
                    ['_id'],
                );
            if (!transition) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: productMessages.errors.transitionNotFound,
                        key: 'transitionId',
                    },
                ]);
            }

            return new SuccessResponse(
                await this.agencyService.importNewProductFromProducer(
                    body.transitionId,
                    new ObjectId(req.loggedUser._id),
                    body.agencyStorageId,
                ),
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/checkout')
    async checkout(
        @Req() req,
        @Body(new TrimBodyPipe(), new JoiValidationPipe(checkoutProductSchema))
        body: ICreateOrder,
    ) {
        try {
            convertObjectId(body, ['productIds']);

            const products = await this.productService.getProductByIds(
                body.productIds,
                ['userId', 'status', 'location', 'sold'],
            );
            if (products.length !== body.productIds.length) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: productMessages.errors.productNotFound,
                        key: 'productId',
                    },
                ]);
            }
            if (
                !products.every(
                    (product) =>
                        product.userId &&
                        product.userId.toString() ===
                            req.loggedUser._id.toString() &&
                        product.status === ProductStatus.IN_AGENCY &&
                        product.location === ProductLocation.IN_AGENCY &&
                        !product.sold,
                )
            ) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: agencyMessages.errors.unprocessableProduct,
                        key: 'productId',
                    },
                ]);
            }

            body.createdBy = new ObjectId(req.loggedUser._id);
            const order = await this.agencyService.createNewCheckout(body);
            return new SuccessResponse(order);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/receive-error-product')
    async receiveErrorProductFromCustomer(
        @Req() req,
        @Body(new TrimBodyPipe(), new JoiValidationPipe(receiveErrorProduct))
        body: IReceiveErrorProduct,
    ) {
        try {
            convertObjectId(body, ['productId', 'agencyStorageId']);

            const product = await this.productService.getProductById(
                body.productId,
                ['sold', 'soldDate'],
            );
            if (!product) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: productMessages.errors.productNotFound,
                        key: 'productId',
                    },
                ]);
            }
            if (!product.sold) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: productMessages.errors.productNotSold,
                        key: 'productId',
                    },
                ]);
            }

            if (
                moment(new Date()).diff(moment(product.soldDate), 'years') >
                this.configService.get(ConfigKey.PRODUCT_WARRANTY_TIME_IN_YEAR)
            ) {
                // TOTO: error with out of warranty
            } else {
                return new SuccessResponse(
                    await this.agencyService.receiveErrorProductFromCustomer(
                        body,
                        new ObjectId(req.loggedUser._id),
                    ),
                );
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    // TODO
    // @Post('/transfer-error-product')
    // async transferErrorProduct() {}

    // TODO
    // @Post('/receive-fixed-product')
    // async receiveFixedProduct() {}

    @Post('/return-fixed-product')
    async returnFixedProduct(
        @Req() req,
        @Body(new TrimBodyPipe(), new JoiValidationPipe(returnFixedProduct))
        body: IReturnFixedProduct,
    ) {
        try {
            convertObjectId(body, ['productId']);

            const product = await this.productService.getProductById(
                body.productId,
                ['_id', 'userId', 'status', 'location'],
            );
            if (!product) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: productMessages.errors.productNotFound,
                        key: 'productId',
                    },
                ]);
            }
            if (req.loggedUser._id.toString() !== product.userId) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: productMessages.errors.productNotOfAgency,
                        key: 'productId',
                    },
                ]);
            }
            if (
                product.status !== ProductStatus.WARRANTY_DONE ||
                product.location !== ProductLocation.IN_AGENCY
            ) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: productMessages.errors.cantReturn,
                        key: 'productId',
                    },
                ]);
            }

            const fixedProduct =
                await this.agencyService.returnFixedProductToCustomer(
                    body.productId,
                    new ObjectId(req.loggedUser._id),
                );
            return new SuccessResponse(fixedProduct);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    // TODO
    // @Post('/return-fixed-product')
    // async returnNewProduct() {}
}
