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
    ProductStatusTransition,
    ProductStatusTransitionDocument,
} from 'src/modules/product/schemas/product-status-transition.schema';
import {
    Product,
    ProductDocument,
} from 'src/modules/product/schemas/product.schema';
import { ProductService } from 'src/modules/product/services/product.service';

@Injectable()
export class AgencyService {
    constructor(
        @InjectModel(Product.name)
        private readonly productModel: Model<ProductDocument>,
        @InjectModel(ProductStatusTransition.name)
        private readonly productStatusTransitionModel: Model<ProductStatusTransitionDocument>,
        @InjectConnection()
        private readonly connection: Connection,
        private readonly productService: ProductService,
        private readonly orderService: OrderService,
    ) {}

    async importNewProductFromProducer(
        transitionId: ObjectId,
        agencyId: ObjectId,
    ) {
        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            const transaction = await this.productStatusTransitionModel
                .findOneAndUpdate(
                    {
                        _id: transitionId,
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
                .select(['productId']);
            await this.productModel.updateOne(
                {
                    _id: transaction.productId,
                    ...softDeleteCondition,
                },
                {
                    $set: {
                        userId: agencyId,
                        // storageId:
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
            const order = await this.orderService.createNewOrder(body);
            return order;
        } catch (error) {
            throw error;
        }
    }
}
