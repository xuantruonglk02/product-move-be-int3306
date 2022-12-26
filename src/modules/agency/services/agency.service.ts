import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Connection, Model } from 'mongoose';
import { softDeleteCondition } from 'src/common/constants';
import { ICreateOrder } from 'src/modules/order/order.interfaces';
import { OrderService } from 'src/modules/order/services/order.service';
import {
    ProductLocation,
    ProductStatus,
} from 'src/modules/product/product.constants';
import {
    ProductErrorReport,
    ProductErrorReportDocument,
} from 'src/modules/product/schemas/product-error-report.schema';
import {
    ProductReplacement,
    ProductReplacementDocument,
} from 'src/modules/product/schemas/product-replacement.schema';
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
    IReceiveErrorProduct,
    ITransferErrorProduct,
} from '../agency.interfaces';

@Injectable()
export class AgencyService {
    constructor(
        @InjectModel(Product.name)
        private readonly productModel: Model<ProductDocument>,
        @InjectModel(ProductStatusTransition.name)
        private readonly productStatusTransitionModel: Model<ProductStatusTransitionDocument>,
        @InjectModel(ProductReplacement.name)
        private readonly productReplacementModel: Model<ProductReplacementDocument>,
        @InjectModel(ProductErrorReport.name)
        private readonly productErrorReportModel: Model<ProductErrorReportDocument>,
        @InjectConnection()
        private readonly connection: Connection,
        private readonly productService: ProductService,
        private readonly orderService: OrderService,
    ) {}

    async importNewProductFromProducer(
        transitionId: ObjectId,
        agencyId: ObjectId,
        storageId: ObjectId,
    ) {
        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            const transition = await this.productStatusTransitionModel
                .findOneAndUpdate(
                    {
                        _id: transitionId,
                        ...softDeleteCondition,
                    },
                    {
                        $set: {
                            nextStorageId: storageId,
                            finishDate: new Date(),
                            updatedBy: agencyId,
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
                        userId: agencyId,
                        storageId: storageId,
                        status: ProductStatus.IN_AGENCY,
                        location: ProductLocation.IN_AGENCY,
                        updatedBy: agencyId,
                        updatedAt: new Date(),
                    },
                },
                { session },
            );

            await session.commitTransaction();

            return await this.productService.getProductStatusTransition(
                transitionId,
            );
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async createNewCheckout(body: ICreateOrder) {
        try {
            return await this.orderService.createNewOrder(body);
        } catch (error) {
            throw error;
        }
    }

    async receiveErrorProductFromCustomer(
        body: IReceiveErrorProduct,
        agencyId: ObjectId,
    ) {
        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            const reportId = new ObjectId();
            await this.productErrorReportModel.create(
                [
                    {
                        _id: reportId,
                        productId: body.productId,
                        description: body.errorDescription,
                        createdBy: agencyId,
                        createdAt: new Date(),
                    },
                ],
                { session },
            );

            await this.productModel.updateOne(
                {
                    _id: body.productId,
                    ...softDeleteCondition,
                },
                {
                    $set: {
                        userId: agencyId,
                        storageId: body.agencyStorageId,
                        status: ProductStatus.NEED_WARRANTY,
                        location: ProductLocation.IN_AGENCY,
                        updatedBy: agencyId,
                        updatedAt: new Date(),
                    },
                },
            );

            await session.commitTransaction();

            return {
                product: await this.productService.getProductById(
                    body.productId,
                ),
                report: await this.productService.getProductErrorReport(
                    reportId,
                ),
            };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async transferErrorProductToWarrantyCenter(
        agencyId: ObjectId,
        storageId: ObjectId,
        body: ITransferErrorProduct,
    ) {
        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            const transitionId = new ObjectId();
            await this.productStatusTransitionModel.create(
                [
                    {
                        _id: transitionId,
                        previousUserId: agencyId,
                        nextUserId: body.warrantyCenterId,
                        previousStorageId: storageId,
                        nextStorageId: null,
                        previousStatus: ProductStatus.NEED_WARRANTY,
                        nextStatus: ProductStatus.IN_WARRANTY,
                        previousLocation: ProductLocation.IN_AGENCY,
                        nextLocation: ProductLocation.IN_WARRANTY_CENTER,
                        productIds: body.productIds,
                        startDate: new Date(),
                        createdBy: agencyId,
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
                        updatedBy: agencyId,
                        updatedAt: new Date(),
                    },
                },
                { session },
            );

            await session.commitTransaction();

            return await this.productService.getProductStatusTransition(
                transitionId,
            );
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async receiveFixedProduct(
        transitionId: ObjectId,
        agencyId: ObjectId,
        storageId: ObjectId,
    ) {
        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            const transition = await this.productStatusTransitionModel
                .findOneAndUpdate(
                    {
                        _id: transitionId,
                        ...softDeleteCondition,
                    },
                    {
                        $set: {
                            nextStorageId: storageId,
                            finishDate: new Date(),
                            updatedBy: agencyId,
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
                        userId: agencyId,
                        storageId: storageId,
                        status: ProductStatus.WARRANTY_DONE,
                        location: ProductLocation.IN_AGENCY,
                        updatedBy: agencyId,
                        updatedAt: new Date(),
                    },
                },
                { session },
            );

            await session.abortTransaction();

            return await this.productService.getProductStatusTransition(
                transitionId,
            );
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async returnFixedProductToCustomer(
        productId: ObjectId,
        agencyId: ObjectId,
    ) {
        try {
            await this.productModel.updateOne(
                {
                    _id: productId,
                    ...softDeleteCondition,
                },
                {
                    $set: {
                        userId: null,
                        storageId: null,
                        status: ProductStatus.RETURN_CONSUMER,
                        location: ProductLocation.IN_CUSTOMER,
                        updatedBy: agencyId,
                        updatedAt: new Date(),
                    },
                },
            );

            return await this.productService.getProductDetail(productId);
        } catch (error) {
            throw error;
        }
    }

    async returnNewProductToCustomer(
        oldProductId: ObjectId,
        newProductId: ObjectId,
        agencyId: ObjectId,
    ) {
        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            await this.productModel.updateOne(
                {
                    _id: newProductId,
                    ...softDeleteCondition,
                },
                {
                    $set: {
                        userId: null,
                        storageId: null,
                        status: ProductStatus.RETURN_CONSUMER,
                        location: ProductLocation.IN_CUSTOMER,
                        updatedBy: agencyId,
                        updatedAt: new Date(),
                    },
                },
                { session },
            );
            await this.productReplacementModel.create(
                {
                    oldProductId: oldProductId,
                    newProductId: newProductId,
                    createdBy: agencyId,
                    createdAt: new Date(),
                },
                { session },
            );

            await session.commitTransaction();

            return await this.productService.getProductDetail(newProductId);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
