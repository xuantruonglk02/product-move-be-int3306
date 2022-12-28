import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Connection, Model } from 'mongoose';
import { softDeleteCondition } from 'src/common/constants';
import {
    ProductLocation,
    ProductStatus,
} from 'src/modules/product/product.constants';
import {
    ProductErrorReport,
    ProductErrorReportDocument,
} from 'src/modules/product/schemas/product-error-report.schema';
import {
    ProductStatusTransition,
    ProductStatusTransitionDocument,
} from 'src/modules/product/schemas/product-status-transition.schema';
import {
    Product,
    ProductDocument,
} from 'src/modules/product/schemas/product.schema';
import { ProductService } from 'src/modules/product/services/product.service';
import {
    IReceiveErrorProductFromAgency,
    IReturnFixedProductToAgency,
    IVerifyProductErrorsFixedDone,
} from '../warranty-center.interfaces';

@Injectable()
export class WarrantyService {
    constructor(
        @InjectModel(Product.name)
        private readonly productModel: Model<ProductDocument>,
        @InjectModel(ProductStatusTransition.name)
        private readonly productStatusTransitionModel: Model<ProductStatusTransitionDocument>,
        @InjectModel(ProductErrorReport.name)
        private readonly productErrorReportModel: Model<ProductErrorReportDocument>,
        @InjectConnection()
        private readonly connection: Connection,
        private readonly productService: ProductService,
    ) {}

    async handleWarranty(
        warrantyCenterId: ObjectId,
        body: IReceiveErrorProductFromAgency,
    ) {
        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            const transition = await this.productStatusTransitionModel
                .findOneAndUpdate(
                    {
                        _id: body.transitionId,
                        ...softDeleteCondition,
                    },
                    {
                        $set: {
                            finishDate: new Date(),
                            updatedBy: warrantyCenterId,
                            updatedAt: new Date(),
                        },
                    },
                    { session },
                )
                .select(['productIds']);
            await this.productModel.updateMany(
                {
                    _id: {
                        $in: transition.productIds,
                    },
                    ...softDeleteCondition,
                },
                {
                    $set: {
                        userId: warrantyCenterId,
                        storageId: null,
                        status: ProductStatus.IN_WARRANTY,
                        location: ProductLocation.IN_WARRANTY_CENTER,
                        updatedBy: warrantyCenterId,
                        updatedAt: new Date(),
                    },
                },
                { session },
            );

            await session.commitTransaction();

            return await this.productService.getProductStatusTransitionDetail(
                body.transitionId,
            );
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async verifyProductErrorsFixedDone(
        warrantyCenterId: ObjectId,
        body: IVerifyProductErrorsFixedDone,
    ) {
        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            await this.productErrorReportModel.updateMany(
                {
                    _id: {
                        $in: body.errorReportIds,
                    },
                    ...softDeleteCondition,
                },
                {
                    $set: {
                        solved: true,
                        updatedBy: warrantyCenterId,
                        updatedAt: new Date(),
                    },
                },
                { session },
            );

            const fixDone =
                await this.productService.checkProductHasNoErrorReport(
                    body.productId,
                    session,
                );
            if (fixDone) {
                await this.productModel.updateOne(
                    {
                        _id: body.productId,
                        ...softDeleteCondition,
                    },
                    {
                        $set: {
                            status: ProductStatus.WARRANTY_DONE,
                            updatedBy: warrantyCenterId,
                            updatedAt: new Date(),
                        },
                    },
                    { session },
                );
            }

            await session.commitTransaction();

            const [product, reports] = await Promise.all([
                this.productService.getProductById(body.productId),
                this.productService.getProductErrorReports(body.errorReportIds),
            ]);
            return { product, reports };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async returnFixedProductToAgency(
        warrantyCenterId: ObjectId,
        body: IReturnFixedProductToAgency,
    ) {
        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            const transitionId = new ObjectId();
            await this.productStatusTransitionModel.create(
                [
                    {
                        _id: transitionId,
                        previousUserId: warrantyCenterId,
                        nextUserId: body.agencyId,
                        previousStorageId: null,
                        nextStorageId: body.agencyStorageId,
                        productIds: body.productIds,
                        previousStatus: ProductStatus.WARRANTY_DONE,
                        nextStatus: ProductStatus.WARRANTY_DONE,
                        previousLocation: ProductLocation.IN_WARRANTY_CENTER,
                        nextLocation: ProductLocation.IN_AGENCY,
                        startDate: new Date(),
                        createdBy: warrantyCenterId,
                        createdAt: new Date(),
                    },
                ],
                { session },
            );
            await this.productModel.updateMany(
                {
                    _id: {
                        $in: body.productIds,
                    },
                    ...softDeleteCondition,
                },
                {
                    $set: {
                        userId: null,
                        storageId: null,
                        status: ProductStatus.IN_TRANSITION,
                        location: ProductLocation.IN_TRANSITION,
                        updatedBy: warrantyCenterId,
                        updatedAt: new Date(),
                    },
                },
                { session },
            );

            await session.commitTransaction();

            return await this.productService.getProductStatusTransitionDetail(
                transitionId,
            );
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async returnFailedProductToProducer(
        productId: number,
        warrantyCenterId: number,
        producerId: number,
    ) {
        try {
            const transition = await this.productStatusTransitionModel.create({
                productId: productId,
                previousUserId: warrantyCenterId,
                nextUserId: producerId,
                previousStatus: ProductStatus.IN_WARRANTY,
                nextStatus: ProductStatus.RETURN_PRODUCER_DONE,
                createdBy: warrantyCenterId,
                createdAt: new Date(),
            });

            return transition;
        } catch (error) {
            throw error;
        }
    }
}
