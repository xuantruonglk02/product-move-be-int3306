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
import { ICommonListQuery } from 'src/common/interfaces';
import {
    ICreateProduct,
    ICreateProductLine,
    IGetProductList,
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
                            ],
                        },
                    },
                    {
                        $unwind: {
                            path: '$productLine',
                        },
                    },
                ])
            )[0];
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
                    .limit(limit)
                    .skip(limit * (page - 1)),
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

            const [productList, total] = await Promise.all([
                this.productModel
                    .find(getListQuery)
                    .select(productAttributes)
                    .sort({
                        [orderBy]:
                            orderDirection === OrderDirection.ASCENDING
                                ? 1
                                : -1,
                    })
                    .limit(limit)
                    .skip(limit * (page - 1)),
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
                        productLineId: new ObjectId(body.productLineId),
                        userId: new ObjectId(body.userId),
                        storageId: new ObjectId(body.storageId),
                        createdBy: new ObjectId(body.createdBy),
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
                        updatedBy: new ObjectId(body.createdBy),
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
