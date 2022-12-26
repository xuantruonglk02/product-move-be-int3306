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
    ProductStatusTransition,
    ProductStatusTransitionDocument,
} from 'src/modules/product/schemas/product-status-transition.schema';
import {
    Product,
    ProductDocument,
} from 'src/modules/product/schemas/product.schema';
import { ProductService } from 'src/modules/product/services/product.service';
import { IReceiveErrorProductFromAgency } from '../warranty-center.interfaces';

@Injectable()
export class WarrantyService {
    constructor(
        @InjectModel(Product.name)
        private readonly productModel: Model<ProductDocument>,
        @InjectModel(ProductStatusTransition.name)
        private readonly productStatusTransitionModel: Model<ProductStatusTransitionDocument>,
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

            return await this.productService.getProductStatusTransition(
                body.transitionId,
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
