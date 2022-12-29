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
import {
    IExportNewProductToAgency,
    IReceiveErrorProductFromWarrantyCenter,
} from '../producer.interfaces';

@Injectable()
export class ProducerService {
    constructor(
        @InjectModel(Product.name)
        private readonly productModel: Model<ProductDocument>,
        @InjectModel(ProductStatusTransition.name)
        private readonly productStatusTransitionModel: Model<ProductStatusTransitionDocument>,
        @InjectConnection()
        private readonly connection: Connection,
        private readonly productService: ProductService,
    ) {}

    async exportNewProductToAgency(
        producerId: ObjectId,
        producerStorageId: ObjectId,
        body: IExportNewProductToAgency,
    ) {
        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            const transitionId = new ObjectId();
            await this.productStatusTransitionModel.create(
                [
                    {
                        _id: transitionId,
                        previousUserId: producerId,
                        nextUserId: body.agencyId,
                        previousStorageId: producerStorageId,
                        nextStorageId: body.agencyStorageId,
                        productIds: body.productIds,
                        previousStatus: ProductStatus.NEW,
                        nextStatus: ProductStatus.IN_AGENCY,
                        previousLocation: ProductLocation.IN_PRODUCER,
                        nextLocation: ProductLocation.IN_AGENCY,
                        startDate: new Date(),
                        createdBy: producerId,
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
                        updatedBy: producerId,
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

    async receiveErrorProductFromWarrantyCenter(
        producerId: ObjectId,
        body: IReceiveErrorProductFromWarrantyCenter,
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
                            updatedBy: producerId,
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
                        userId: producerId,
                        storageId: transition.nextStorageId,
                        status: ProductStatus.RETURN_PRODUCER_DONE,
                        location: ProductLocation.IN_PRODUCER,
                        updatedBy: producerId,
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
}
