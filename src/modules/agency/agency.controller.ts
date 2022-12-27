import {
    Body,
    Controller,
    HttpStatus,
    InternalServerErrorException,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import moment from 'moment';
import { ObjectId } from 'mongodb';
import ConfigKey from 'src/common/config/configKey';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import {
    AuthorizationGuard,
    Roles,
} from 'src/common/guards/authorization.guard';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { convertObjectId } from 'src/common/helpers/utilityFunctions';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { TrimBodyPipe } from 'src/common/pipes/trimBody.pipe';
import { ICreateOrder } from '../order/order.interfaces';
import { ProductLocation, ProductStatus } from '../product/product.constants';
import { productMessages } from '../product/product.messages';
import { ProductService } from '../product/services/product.service';
import { StorageService } from '../storage/services/storage.service';
import { ICreateStorage } from '../storage/storage.interfaces';
import { storageMessage } from '../storage/storage.messages';
import { createOwnStorageSchema } from '../storage/storage.validators';
import { UserRole } from '../user/user.constants';
import warrantyCenterMessages from '../warranty-center/warranty-center.messages';
import {
    IImportNewProductFromProducer,
    IReceiveErrorProduct,
    IReturnFixedProduct,
    ITransferErrorProduct,
} from './agency.interfaces';
import { agencyMessages } from './agency.messages';
import {
    checkoutProductSchema,
    importNewProductFromProducerSchema,
    receiveErrorProduct,
    returnFixedProduct,
    transferErrorProductSchema,
} from './agency.validators';
import { AgencyService } from './services/agency.service';

@Controller('/agency')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(UserRole.AGENCY)
export class AgencyController {
    constructor(
        private readonly agencyService: AgencyService,
        private readonly productService: ProductService,
        private readonly storageService: StorageService,
        private readonly configService: ConfigService,
    ) {}

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
            convertObjectId(body, ['transitionId']);

            const transition =
                await this.productService.getProductStatusTransition(
                    body.transitionId,
                    ['nextUserId', 'previousStatus', 'nextStatus'],
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
            if (
                transition.previousStatus !== ProductStatus.NEW &&
                transition.nextStatus !== ProductStatus.IN_AGENCY
            ) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: productMessages.errors.transitionWrong,
                        key: 'transitionId',
                    },
                ]);
            }
            if (
                transition.nextUserId.toString() !==
                req.loggedUser._id.toString()
            ) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message:
                            warrantyCenterMessages.errors.transitionNotToThis,
                        key: 'transitionId',
                    },
                ]);
            }

            return new SuccessResponse(
                await this.agencyService.importNewProductFromProducer(
                    new ObjectId(req.loggedUser._id),
                    body,
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
                        key: 'productIds',
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
                        message: agencyMessages.errors.unprocessableProducts,
                        key: 'productIds',
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
            // TODO: check product status in customer

            const storage = await this.storageService.getStorageById(
                body.agencyStorageId,
                ['userId'],
            );
            if (!storage) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: storageMessage.errors.notFound,
                        key: 'agencyStorageId',
                    },
                ]);
            }
            if (storage.userId.toString() !== req.loggedUser._id.toString()) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: storageMessage.errors.notOfAgency,
                        key: 'agencyStorageId',
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

    @Post('/transfer-error-product')
    async transferErrorProduct(
        @Req() req,
        @Body(
            new TrimBodyPipe(),
            new JoiValidationPipe(transferErrorProductSchema),
        )
        body: ITransferErrorProduct,
    ) {
        try {
            convertObjectId(body, ['productIds', 'warrantyCenterId']);

            const products = await this.productService.getProductByIds(
                body.productIds,
                ['storageId', 'status', 'location'],
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
                            products[0].storageId.toString() &&
                        product.status === ProductStatus.NEED_WARRANTY &&
                        product.location === ProductLocation.IN_AGENCY,
                )
            ) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: agencyMessages.errors.unprocessableProducts,
                        key: 'productIds',
                    },
                ]);
            }

            const storage = await this.storageService.getStorageById(
                products[0].storageId,
                ['userId'],
            );
            if (!storage) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: storageMessage.errors.notFound,
                        key: 'product.storageId',
                    },
                ]);
            }
            if (storage.userId.toString() !== req.loggedUser._id.toString()) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: agencyMessages.errors.notInAgency,
                        key: 'product.userId',
                    },
                ]);
            }

            const transition =
                await this.agencyService.transferErrorProductToWarrantyCenter(
                    new ObjectId(req.loggedUser._id),
                    products[0].storageId,
                    body,
                );
            return new SuccessResponse(transition);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

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
                ['userId', 'status', 'location'],
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
            if (product.userId !== req.loggedUser._id.toString()) {
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
                    new ObjectId(req.loggedUser._id),
                    body.productId,
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
