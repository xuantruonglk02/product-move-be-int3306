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
    ProductLine,
    ProductLineDocument,
} from 'src/modules/product/schemas/product-line.schema';
import {
    Product,
    ProductDocument,
} from 'src/modules/product/schemas/product.schema';
import { ICreateOrder } from '../order.interfaces';
import {
    OrderDetail,
    OrderDetailDocument,
} from '../schemas/order-detail.schema';
import { Order, OrderDocument } from '../schemas/order.schema';

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order.name)
        private readonly orderModel: Model<OrderDocument>,
        @InjectModel(OrderDetail.name)
        private readonly orderDetailModel: Model<OrderDetailDocument>,
        @InjectModel(Product.name)
        private readonly productModel: Model<ProductDocument>,
        @InjectModel(ProductLine.name)
        private readonly productLineModel: Model<ProductLineDocument>,
        @InjectConnection()
        private readonly connection: Connection,
    ) {}

    async createNewOrder(body: ICreateOrder) {
        const session = await this.connection.startSession();

        try {
            const products = await this.productModel
                .find({
                    _id: { $in: body.productIds },
                    ...softDeleteCondition,
                })
                .select(['productLineId']);

            const mapProductLineIdToQuantity = new Map<string, number>();
            products.forEach((product) => {
                if (
                    !mapProductLineIdToQuantity.get(
                        product.productLineId.toString(),
                    )
                ) {
                    mapProductLineIdToQuantity.set(
                        product.productLineId.toString(),
                        1,
                    );
                } else {
                    mapProductLineIdToQuantity.set(
                        product.productLineId.toString(),
                        mapProductLineIdToQuantity.get(
                            product.productLineId.toString(),
                        ) + 1,
                    );
                }
            });

            const productLines = await this.productLineModel
                .find({
                    _id: {
                        $in: Array.from(mapProductLineIdToQuantity.keys()),
                    },
                    ...softDeleteCondition,
                })
                .select(['price']);

            const mapProductLineIdToPrice = new Map<string, number>();
            productLines.forEach((productLine) => {
                mapProductLineIdToPrice.set(
                    productLine._id.toString(),
                    productLine.price,
                );
            });

            const updateProductLineQuery = productLines.map((productLine) => {
                return {
                    updateOne: {
                        filter: {
                            _id: productLine._id,
                            ...softDeleteCondition,
                        },
                        update: {
                            $inc: {
                                quantityOfProduct:
                                    -mapProductLineIdToQuantity.get(
                                        productLine._id.toString(),
                                    ),
                            },
                            $set: {
                                updatedBy: body.createdBy,
                                updatedAt: new Date(),
                            },
                        },
                    },
                };
            });

            const orderId = new ObjectId();
            const orderDetails = products.map((product) => {
                return {
                    orderId,
                    productId: product.id,
                    productPrice: mapProductLineIdToPrice.get(
                        product.productLineId.toString(),
                    ),
                    createdBy: body.createdBy,
                    createdAt: new Date(),
                };
            });

            session.startTransaction();

            await this.productModel.updateMany(
                {
                    _id: { $in: body.productIds },
                    ...softDeleteCondition,
                },
                {
                    $set: {
                        userId: null,
                        storageId: null,
                        status: ProductStatus.SOLD,
                        location: ProductLocation.IN_CUSTOMER,
                        sold: true,
                        soldDate: new Date(),
                        updatedBy: body.createdBy,
                        updatedAt: new Date(),
                    },
                },
                { session },
            );
            await this.productLineModel.bulkWrite(updateProductLineQuery, {
                session,
            });

            const order = await this.orderModel.create({
                _id: orderId,
                customerName: body.customerName,
                customerEmail: body.customerName,
                customerPhone: body.customerName,
                createdBy: body.createdBy,
                createdAt: new Date(),
            });
            await this.orderDetailModel.insertMany(orderDetails, { session });

            await session.commitTransaction();

            return {
                ...order,
                details: orderDetails,
            };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
