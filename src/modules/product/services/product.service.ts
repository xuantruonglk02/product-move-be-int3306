import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Connection, Model } from 'mongoose';
import { MongoCollection, softDeleteCondition } from 'src/common/constants';
import { ICreateProduct, ICreateProductLine } from '../product.interfaces';
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
