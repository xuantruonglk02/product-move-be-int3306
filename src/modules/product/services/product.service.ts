import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { ClientSession, Connection, Model } from 'mongoose';
import {
    DEFAULT_ITEM_PER_PAGE_LIMIT,
    DEFAULT_ORDER_BY,
    MIN_POSITIVE_NUMBER,
    MongoCollection,
    OrderDirection,
    softDeleteCondition,
} from 'src/common/constants';
import { ICommonListQuery } from 'src/common/interfaces';
import {
    ICreateProduct,
    ICreateProductLine,
    IGetProductList,
    IGetProductStatusTransitionList,
} from '../product.interfaces';
import {
    ProductErrorReport,
    productErrorReportAttributes,
    ProductErrorReportDocument,
} from '../schemas/product-error-report.schema';
import {
    ProductLine,
    productLineAttributes,
    ProductLineDocument,
} from '../schemas/product-line.schema';
import {
    ProductStatusTransition,
    productStatusTransitionAttributes,
    ProductStatusTransitionDocument,
} from '../schemas/product-status-transition.schema';
import {
    Product,
    productAttributes,
    ProductDocument,
} from '../schemas/product.schema';

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name)
        private readonly productModel: Model<ProductDocument>,
        @InjectModel(ProductLine.name)
        private readonly productLineModel: Model<ProductLineDocument>,
        @InjectModel(ProductStatusTransition.name)
        private readonly productStatusTransitionModel: Model<ProductStatusTransitionDocument>,
        @InjectModel(ProductErrorReport.name)
        private readonly productErrorReportModel: Model<ProductErrorReportDocument>,
        @InjectConnection()
        private readonly connection: Connection,
    ) {}

    async getProductByIds(ids: ObjectId[], attrs = productAttributes) {
        try {
            return await this.productModel
                .find({
                    _id: {
                        $in: ids,
                    },
                    ...softDeleteCondition,
                })
                .select(attrs);
        } catch (error) {
            throw error;
        }
    }

    async getProductById(id: ObjectId, attrs = productAttributes) {
        try {
            return await this.productModel
                .findOne({
                    _id: id,
                    ...softDeleteCondition,
                })
                .select(attrs);
        } catch (error) {
            throw error;
        }
    }

    async getProductDetail(id: ObjectId) {
        try {
            return (
                await this.productModel.aggregate([
                    {
                        $match: {
                            _id: id,
                            ...softDeleteCondition,
                        },
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
                ])
            )[0];
        } catch (error) {
            throw error;
        }
    }

    async getProductList(query: IGetProductList) {
        try {
            const {
                keyword = '',
                page = MIN_POSITIVE_NUMBER,
                limit = DEFAULT_ITEM_PER_PAGE_LIMIT,
                orderDirection = OrderDirection.ASCENDING,
                orderBy = 'name',
            } = query;

            const getListQuery: Record<string, any> = {
                name: {
                    $regex: `.*${keyword}.*`,
                    $options: 'i',
                },
                ...softDeleteCondition,
            };
            if (query.productLineId) {
                getListQuery.productLineId = query.productLineId;
            }
            if (query.userId) {
                getListQuery.userId = query.userId;
            }
            if (query.storageId) {
                getListQuery.storageId = query.storageId;
            }
            if (query.createdBy) {
                getListQuery.createdBy = query.createdBy;
            }
            if (query.status) {
                getListQuery.status = query.status;
            }
            if (query.location) {
                getListQuery.location = query.location;
            }
            if (query.sold) {
                getListQuery.sold =
                    query.sold.toString() === 'true' ? true : false;
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
                items: productList,
                totalItems: total,
            };
        } catch (error) {
            throw error;
        }
    }

    async getProductLineDetail(id: ObjectId, attrs = productLineAttributes) {
        try {
            return await this.productLineModel
                .findOne({
                    _id: id,
                    ...softDeleteCondition,
                })
                .select(attrs);
        } catch (error) {
            throw error;
        }
    }

    async getProductLineList(query: ICommonListQuery) {
        try {
            const {
                keyword = '',
                page = MIN_POSITIVE_NUMBER,
                limit = DEFAULT_ITEM_PER_PAGE_LIMIT,
                orderDirection = OrderDirection.ASCENDING,
                orderBy = 'name',
            } = query;

            const [productLineList, total] = await Promise.all([
                this.productLineModel
                    .find({
                        name: {
                            $regex: `.*${keyword}.*`,
                            $options: 'i',
                        },
                        ...softDeleteCondition,
                    })
                    .select(productLineAttributes)
                    .sort({
                        [orderBy]:
                            orderDirection === OrderDirection.ASCENDING
                                ? 1
                                : -1,
                    })
                    .skip(limit * (page - 1))
                    .limit(limit),
                this.productLineModel.countDocuments({
                    name: {
                        $regex: `.*${keyword}.*`,
                        $options: 'i',
                    },
                    ...softDeleteCondition,
                }),
            ]);

            return {
                items: productLineList,
                totalItems: total,
            };
        } catch (error) {
            throw error;
        }
    }

    async getProductStatusTransition(
        id: ObjectId,
        attrs = productStatusTransitionAttributes,
    ) {
        try {
            return await this.productStatusTransitionModel
                .findOne({
                    _id: id,
                    ...softDeleteCondition,
                })
                .select(attrs);
        } catch (error) {
            throw error;
        }
    }

    async getProductStatusTransitionDetail(id: ObjectId) {
        try {
            return (
                await this.productStatusTransitionModel.aggregate([
                    {
                        $match: {
                            _id: id,
                            ...softDeleteCondition,
                        },
                    },
                    {
                        $project: Object.fromEntries(
                            productStatusTransitionAttributes.map((attr) => [
                                attr,
                                1,
                            ]),
                        ),
                    },
                    {
                        $lookup: {
                            from: MongoCollection.USERS,
                            as: 'previousUser',
                            localField: 'previousUserId',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $match: {
                                        ...softDeleteCondition,
                                    },
                                },
                                {
                                    $project: { email: 1, name: 1, role: 1 },
                                },
                            ],
                        },
                    },
                    {
                        $unwind: {
                            path: '$previousUser',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: MongoCollection.USERS,
                            as: 'nextUser',
                            localField: 'nextUserId',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $match: {
                                        ...softDeleteCondition,
                                    },
                                },
                                {
                                    $project: { email: 1, name: 1, role: 1 },
                                },
                            ],
                        },
                    },
                    {
                        $unwind: {
                            path: '$nextUser',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: MongoCollection.STORAGES,
                            as: 'previousStorage',
                            localField: 'previousStorageId',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $match: {
                                        ...softDeleteCondition,
                                    },
                                },
                                {
                                    $project: { userId: 1, name: 1 },
                                },
                            ],
                        },
                    },
                    {
                        $unwind: {
                            path: '$previousStorage',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: MongoCollection.STORAGES,
                            as: 'nextStorage',
                            localField: 'nextStorageId',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $match: {
                                        ...softDeleteCondition,
                                    },
                                },
                                {
                                    $project: { userId: 1, name: 1 },
                                },
                            ],
                        },
                    },
                    {
                        $unwind: {
                            path: '$nextStorage',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                ])
            )[0];
        } catch (error) {
            throw error;
        }
    }

    async getProductStatusTransitionList(
        query: IGetProductStatusTransitionList,
    ) {
        try {
            const {
                page = MIN_POSITIVE_NUMBER,
                limit = DEFAULT_ITEM_PER_PAGE_LIMIT,
                orderDirection = OrderDirection.ASCENDING,
                orderBy = DEFAULT_ORDER_BY,
            } = query;

            const getListQuery: Record<string, any> = {
                ...softDeleteCondition,
            };
            if (query.previousUserId) {
                getListQuery.previousUserId = query.previousUserId;
            }
            if (query.nextUserId) {
                getListQuery.nextUserId = query.nextUserId;
            }
            if (query.previousStorageId) {
                getListQuery.previousStorageId = query.previousStorageId;
            }
            if (query.nextStorageId) {
                getListQuery.nextStorageId = query.nextStorageId;
            }
            if (query.previousStatus) {
                getListQuery.previousStatus = query.previousStatus;
            }
            if (query.nextStatus) {
                getListQuery.nextStatus = query.nextStatus;
            }
            if (query.previousLocation) {
                getListQuery.previousLocation = query.previousLocation;
            }
            if (query.nextLocation) {
                getListQuery.nextLocation = query.nextLocation;
            }

            const [transitionList, total] = await Promise.all([
                this.productStatusTransitionModel.aggregate([
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
                            productStatusTransitionAttributes.map((attr) => [
                                attr,
                                1,
                            ]),
                        ),
                    },
                    {
                        $lookup: {
                            from: MongoCollection.USERS,
                            as: 'previousUser',
                            localField: 'previousUserId',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $match: {
                                        ...softDeleteCondition,
                                    },
                                },
                                {
                                    $project: { email: 1, name: 1, role: 1 },
                                },
                            ],
                        },
                    },
                    {
                        $unwind: {
                            path: '$previousUser',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: MongoCollection.USERS,
                            as: 'nextUser',
                            localField: 'nextUserId',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $match: {
                                        ...softDeleteCondition,
                                    },
                                },
                                {
                                    $project: { email: 1, name: 1, role: 1 },
                                },
                            ],
                        },
                    },
                    {
                        $unwind: {
                            path: '$nextUser',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: MongoCollection.STORAGES,
                            as: 'previousStorage',
                            localField: 'previousStorageId',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $match: {
                                        ...softDeleteCondition,
                                    },
                                },
                                {
                                    $project: { userId: 1, name: 1 },
                                },
                            ],
                        },
                    },
                    {
                        $unwind: {
                            path: '$previousStorage',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: MongoCollection.STORAGES,
                            as: 'nextStorage',
                            localField: 'nextStorageId',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $match: {
                                        ...softDeleteCondition,
                                    },
                                },
                                {
                                    $project: { userId: 1, name: 1 },
                                },
                            ],
                        },
                    },
                    {
                        $unwind: {
                            path: '$nextStorage',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                ]),
                this.productStatusTransitionModel.countDocuments(getListQuery),
            ]);

            return {
                items: transitionList,
                totalItem: total,
            };
        } catch (error) {
            throw error;
        }
    }

    async getProductErrorReport(
        id: ObjectId,
        attrs = productErrorReportAttributes,
    ) {
        try {
            return await this.productErrorReportModel
                .findOne({
                    _id: id,
                    ...softDeleteCondition,
                })
                .select(attrs);
        } catch (error) {
            throw error;
        }
    }

    async getProductErrorReports(
        ids: ObjectId[],
        attrs = productErrorReportAttributes,
    ) {
        try {
            return await this.productErrorReportModel
                .find({
                    _id: { $in: ids },
                    ...softDeleteCondition,
                })
                .select(attrs);
        } catch (error) {
            throw error;
        }
    }

    async checkProductHasNoErrorReport(id: ObjectId, session?: ClientSession) {
        try {
            return !(await this.productErrorReportModel
                .findOne({
                    productId: id,
                    solved: false,
                    ...softDeleteCondition,
                })
                .select(['_id'])
                .session(session));
        } catch (error) {
            throw error;
        }
    }

    async createNewProductLine(body: ICreateProductLine) {
        try {
            return await this.productLineModel.create({
                ...body,
                createdAt: new Date(),
            });
        } catch (error) {
            throw error;
        }
    }

    async createNewProduct(body: ICreateProduct) {
        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            const product = await this.productModel.create(
                [
                    {
                        ...body,
                        createdAt: new Date(),
                    },
                ],
                { session },
            );
            await this.productLineModel.updateOne(
                {
                    _id: body.productLineId,
                    ...softDeleteCondition,
                },
                {
                    $inc: {
                        quantityOfProduct: 1,
                    },
                    $set: {
                        updatedBy: body.createdBy,
                        updatedAt: new Date(),
                    },
                },
                { session },
            );

            await session.commitTransaction();

            return product[0];
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
