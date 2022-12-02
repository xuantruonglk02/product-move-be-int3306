import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { ProductStatus } from 'src/modules/product/product.constants';
import {
    ProductStatusTransition,
    ProductStatusTransitionDocument,
} from 'src/modules/product/schemas/product-status-transition.schema';

@Injectable()
export class ProducerService {
    constructor(
        @InjectModel(ProductStatusTransition.name)
        private readonly productStatusTransitionModel: Model<ProductStatusTransitionDocument>,
    ) {}

    async exportNewProductToAgency(
        productId: ObjectId,
        producerId: ObjectId,
        agencyId: ObjectId,
    ) {
        try {
            const transition = await this.productStatusTransitionModel.create({
                productId,
                previousUserId: producerId,
                nextUserId: agencyId,
                previousStatus: ProductStatus.NEW,
                nextStatus: ProductStatus.IN_AGENCY,
                createdBy: producerId,
                createdAt: new Date(),
            });

            return transition;
        } catch (error) {
            throw error;
        }
    }
}
