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
        productIds: ObjectId[],
        producerId: ObjectId,
        storageId: ObjectId,
        agencyId: ObjectId,
    ) {
        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            const transitionId = new ObjectId();
            await this.productStatusTransitionModel.create(
                [
                    {
                        _id: transitionId,
                        previousUserId: new ObjectId(producerId),
                        nextUserId: new ObjectId(agencyId),
                        previousStorageId: new ObjectId(storageId),
                        productIds: productIds.map((id) => new ObjectId(id)),
                        previousStatus: ProductStatus.NEW,
                        nextStatus: ProductStatus.IN_AGENCY,
                        previousLocation: ProductLocation.IN_PRODUCER,
                        nextLocation: ProductLocation.IN_AGENCY,
                        startDate: new Date(),
                        createdBy: new ObjectId(producerId),
                        createdAt: new Date(),
                    },
                ],
                { session },
            );
            await this.productModel.updateMany(
                {
                    _id: {
                        $in: productIds,
                    },
                    ...softDeleteCondition,
                },
                {
                    $set: {
                        userId: null,
                        storageId: null,
                        status: ProductStatus.IN_TRANSITION,
                        location: ProductLocation.IN_TRANSITION,
                        updatedBy: new ObjectId(producerId),
                        updatedAt: new Date(),
                    },
                },
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
}
