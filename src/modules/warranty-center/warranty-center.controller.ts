import {
    Body,
    Controller,
    HttpStatus,
    InternalServerErrorException,
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
import { convertObjectId } from 'src/common/helpers/utilityFunctions';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { TrimBodyPipe } from 'src/common/pipes/trimBody.pipe';
import { producerMessages } from '../producer/producer.messages';
import { ProductStatus } from '../product/product.constants';
import { productMessages } from '../product/product.messages';
import { ProductService } from '../product/services/product.service';
import { StorageService } from '../storage/services/storage.service';
import { storageMessage } from '../storage/storage.messages';
import { UserService } from '../user/services/user.service';
import { UserRole } from '../user/user.constants';
import { userMessages } from '../user/user.messages';
import { WarrantyService } from './services/warranty.service';
import {
    IReceiveErrorProductFromAgency,
    IReturnFixedProductToAgency,
    IVerifyProductErrorsFixedDone,
} from './warranty-center.interfaces';
import warrantyCenterMessages from './warranty-center.messages';
import {
    receiveErrorProductFromAgency,
    returnFixedProductToAgency,
    verifyProductErrorsFixedDoneSchema,
} from './warranty-center.validators';

@Controller('/warranty-center')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(UserRole.WARRANTY_CENTER)
export class WarrantyCenterController {
    constructor(
        private readonly warrantyService: WarrantyService,
        private readonly userService: UserService,
        private readonly productService: ProductService,
        private readonly storageService: StorageService,
    ) {}

    @Post('/receive-error-product')
    async receiveErrorProduct(
        @Req() req,
        @Body(
            new TrimBodyPipe(),
            new JoiValidationPipe(receiveErrorProductFromAgency),
        )
        body: IReceiveErrorProductFromAgency,
    ) {
        try {
            convertObjectId(body, ['transitionId']);

            const transition =
                await this.productService.getProductStatusTransition(
                    body.transitionId,
                    [
                        'nextUserId',
                        'previousStatus',
                        'nextStatus',
                        'finishDate',
                    ],
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
                transition.previousStatus !== ProductStatus.NEED_WARRANTY ||
                transition.nextStatus !== ProductStatus.IN_WARRANTY ||
                transition.finishDate
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
                await this.warrantyService.handleWarranty(
                    new ObjectId(req.loggedUser._id),
                    body,
                ),
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/verify-errors-fix-done')
    async verifyProductErrorsFixedDone(
        @Req() req,
        @Body(
            new TrimBodyPipe(),
            new JoiValidationPipe(verifyProductErrorsFixedDoneSchema),
        )
        body: IVerifyProductErrorsFixedDone,
    ) {
        try {
            convertObjectId(body, ['productId', 'errorReportIds']);

            const product = await this.productService.getProductById(
                body.productId,
                ['userId', 'status'],
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
            if (
                !product.userId ||
                product.userId.toString() !== req.loggedUser._id.toString()
            ) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: warrantyCenterMessages.errors.productNotInThis,
                        key: 'productId',
                    },
                ]);
            }

            const errorReports =
                await this.productService.getProductErrorReports(
                    body.errorReportIds,
                    ['productId'],
                );
            if (errorReports.length !== body.errorReportIds.length) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: productMessages.errors.errorReportNotFound,
                        key: 'errorReportIds',
                    },
                ]);
            }
            if (
                !errorReports.every(
                    (report) =>
                        report.productId.toString() ===
                        body.productId.toString(),
                )
            ) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: productMessages.errors.errorReportNotOfProduct,
                        key: 'errorReportIds',
                    },
                ]);
            }

            return new SuccessResponse(
                await this.warrantyService.verifyProductErrorsFixedDone(
                    new ObjectId(req.loggedUser._id),
                    body,
                ),
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/return-fixed-product')
    async returnFixedProductToAgency(
        @Req() req,
        @Body(
            new TrimBodyPipe(),
            new JoiValidationPipe(returnFixedProductToAgency),
        )
        body: IReturnFixedProductToAgency,
    ) {
        try {
            convertObjectId(body, [
                'agencyId',
                'agencyStorageId',
                'productIds',
            ]);

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
                ['userId', 'status'],
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
                products.findIndex(
                    (product) =>
                        product.userId.toString() !==
                        req.loggedUser._id.toString(),
                ) !== -1
            ) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: warrantyCenterMessages.errors.productNotInThis,
                        key: 'productIds',
                    },
                ]);
            }
            if (
                products.findIndex(
                    (product) => product.status !== ProductStatus.WARRANTY_DONE,
                ) !== -1
            ) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message:
                            warrantyCenterMessages.errors.productNotFixedDone,
                        key: 'productIds',
                    },
                ]);
            }

            return new SuccessResponse(
                await this.warrantyService.returnFixedProductToAgency(
                    new ObjectId(req.loggedUser._id),
                    body,
                ),
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
