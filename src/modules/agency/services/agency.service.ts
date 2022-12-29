import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Connection, Model } from 'mongoose';
import {
    DEFAULT_ITEM_PER_PAGE_LIMIT,
    MIN_POSITIVE_NUMBER,
    MongoCollection,
    OrderDirection,
    softDeleteCondition,
} from 'src/common/constants';
import { ICreateOrder } from 'src/modules/order/order.interfaces';
import {
    OrderDetail,
    OrderDetailDocument,
} from 'src/modules/order/schemas/order-detail.schema';
import {
    Order,
    orderAttributes,
    OrderDocument,
} from 'src/modules/order/schemas/order.schema';
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
    productAttributes,
    ProductDocument,
} from 'src/modules/product/schemas/product.schema';
import { ProductService } from 'src/modules/product/services/product.service';
import {
    IGetSoldProducts,
    IImportNewProductFromProducer,
    IReceiveErrorProduct,
    IReceiveFixedProduct,
    IReturnNewProductToCustomer,
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
        @InjectModel(Order.name)
        private readonly orderModel: Model<OrderDocument>,
        @InjectModel(OrderDetail.name)
        private readonly orderDetailModel: Model<OrderDetailDocument>,
        @InjectConnection()
        private readonly connection: Connection,
        private readonly productService: ProductService,
        private readonly orderService: OrderService,
    ) {}

    async getSoldProducts(agencyId: ObjectId, query: IGetSoldProducts) {
        try {
            const orderDetails = await this.orderDetailModel
                .find({
                    createdBy: agencyId,
                    ...softDeleteCondition,
                })
                .select(['orderId', 'productId']);
            const orders = await this.orderModel
                .find({
                    _id: {
                        $in: orderDetails.map((detail) => detail.orderId),
                    },
                    ...softDeleteCondition,
                })
                .select(orderAttributes);

            const mapProductIdToOrder = new Map<string, any>();
            orderDetails.forEach((orderDetail) => {
                if (
                    !mapProductIdToOrder.get(orderDetail.productId.toString())
                ) {
                    mapProductIdToOrder.set(
                        orderDetail.productId.toString(),
                        orders.find(
                            (order) =>
                                order._id.toString() ===
                                orderDetail.orderId.toString(),
                        ),
                    );
                }
            });

            const {
                page = MIN_POSITIVE_NUMBER,
                limit = DEFAULT_ITEM_PER_PAGE_LIMIT,
                orderDirection = OrderDirection.ASCENDING,
                orderBy = 'soldDate',
            } = query;

            const getListQuery: Record<string, any> = {
                _id: {
                    $in: orderDetails.map((detail) => detail.productId),
                },
                ...softDeleteCondition,
            };
            if (query.productLineId) {
                getListQuery.productLineId = query.productLineId;
            }

            const [productList, total] = await Promise.all([
                this.productModel.aggregate([
                    {
                        $match: getListQuery,
                    },
                    {
                        $sort: {
                            [orderBy]:
                                orderDirection === OrderDirection.ASCENDING
                                    ? 1
                                    : -1,
                        },
                    },
                    {
                        $skip: limit * (page - 1),
                    },
                    {
                        $limit: parseInt(limit.toString()),
                    },
                    {
                        $project: Object.fromEntries(
                            productAttributes
                                .map((attr) => [attr, 1])
                                .concat([['createdBy', 1]]),
                        ),
                    },
                    {
                        $lookup: {
                            from: MongoCollection.PRODUCT_LINES,
                            as: 'productLine',
                            localField: 'productLineId',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $match: {
                                        ...softDeleteCondition,
                                    },
                                },
                                {
                                    $project: { name: 1, price: 1 },
                                },
                            ],
                        },
                    },
                    {
                        $unwind: {
                            path: '$productLine',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: MongoCollection.USERS,
                            as: 'createdBy',
                            localField: 'createdBy',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $match: {
                                        ...softDeleteCondition,
                                    },
                                },
                                {
                                    $project: { email: 1, name: 1 },
                                },
                            ],
                        },
                    },
                    {
                        $unwind: {
                            path: '$createdBy',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: MongoCollection.USERS,
                            as: 'user',
                            localField: 'userId',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $match: {
                                        ...softDeleteCondition,
                                    },
                                },
                                {
                                    $project: { email: 1, name: 1 },
                                },
                            ],
                        },
                    },
                    {
                        $unwind: {
                            path: '$user',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: MongoCollection.STORAGES,
                            as: 'storage',
                            localField: 'storageId',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $match: {
                                        ...softDeleteCondition,
                                    },
                                },
                                {
                                    $project: { name: 1, address: 1 },
                                },
                            ],
                        },
                    },
                    {
                        $unwind: {
                            path: '$storage',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                ]),
                this.productModel.countDocuments(getListQuery),
            ]);

            return {
                items: productList.map((product) => ({
                    ...product,
                    order: mapProductIdToOrder.get(product._id.toString()),
                })),
                totalItems: total,
            };
        } catch (error) {
            throw error;
        }
    }

    async importNewProductFromProducer(
        agencyId: ObjectId,
        body: IImportNewProductFromProducer,
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
                            updatedBy: agencyId,
                            updatedAt: new Date(),
                        },
                    },
                    { session },
                )
                .select(['productIds', 'nextStorageId']);
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
                        storageId: transition.nextStorageId,
                        status: ProductStatus.IN_AGENCY,
                        location: ProductLocation.IN_AGENCY,
                        updatedBy: agencyId,
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
            const errorReports = body.errors.map((error) => ({
                _id: new ObjectId(),
                productId: body.productId,
                description: error,
                createdBy: agencyId,
                createdAt: new Date(),
            }));

            session.startTransaction();

            await this.productErrorReportModel.insertMany(errorReports, {
                session,
            });
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
                { session },
            );

            await session.commitTransaction();

            const [product, reports] = await Promise.all([
                this.productService.getProductById(body.productId),
                this.productService.getProductErrorReports(
                    errorReports.map((report) => report._id),
                ),
            ]);
            return { product, reports };
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

    async receiveFixedProduct(agencyId: ObjectId, body: IReceiveFixedProduct) {
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
                            updatedBy: agencyId,
                            updatedAt: new Date(),
                        },
                    },
                    { session },
                )
                .select(['productIds', 'nextStorageId']);
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
                        storageId: transition.nextStorageId,
                        status: ProductStatus.WARRANTY_DONE,
                        location: ProductLocation.IN_AGENCY,
                        updatedBy: agencyId,
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

    async returnFixedProductToCustomer(
        agencyId: ObjectId,
        productId: ObjectId,
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
        agencyId: ObjectId,
        body: IReturnNewProductToCustomer,
    ) {
        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            await this.productModel.updateOne(
                {
                    _id: body.newProductId,
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
                [
                    {
                        oldProductId: body.oldProductId,
                        newProductId: body.newProductId,
                        createdBy: agencyId,
                        createdAt: new Date(),
                    },
                ],
                { session },
            );

            await session.commitTransaction();

            return await this.productService.getProductDetail(
                body.newProductId,
            );
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
