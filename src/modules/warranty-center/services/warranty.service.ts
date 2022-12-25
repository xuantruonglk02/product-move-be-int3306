import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import {
    ProductLocation,
    ProductStatus,
} from 'src/modules/product/product.constants';
import {
    ProductStatusTransition,
    ProductStatusTransitionDocument,
} from 'src/modules/product/schemas/product-status-transition.schema';
import { ProductService } from 'src/modules/product/services/product.service';

@Injectable()
export class WarrantyService {
    constructor(
        @InjectModel(ProductStatusTransition.name)
        private readonly productStatusTransitionModel: Model<ProductStatusTransitionDocument>,
        private readonly productService: ProductService,
    ) {}

    async handleWarranty(productId: ObjectId, warrantyCenterId: ObjectId) {
        try {
            const product = await this.productService.getProductById(productId);
            product.userId = new ObjectId(warrantyCenterId);
            product.storageId = null;
            product.status = ProductStatus.IN_WARRANTY;
            product.location = ProductLocation.IN_WARRANTY_CENTER;
            product.updatedBy = new ObjectId(warrantyCenterId);
            product.updatedAt = new Date();
            await product.save();

            return product;
        } catch (error) {
            throw error;
        }
    }

    async returnFailedProductToProducer(
        productId: number,
        warrantyCenterId: number,
        producerId: number,
    ) {
        try {
            const transition = await this.productStatusTransitionModel.create({
                productId: new ObjectId(productId),
                previousUserId: new ObjectId(warrantyCenterId),
                nextUserId: new ObjectId(producerId),
                previousStatus: ProductStatus.IN_WARRANTY,
                nextStatus: ProductStatus.RETURN_PRODUCER_DONE,
                createdBy: new ObjectId(warrantyCenterId),
                createdAt: new Date(),
            });

            return transition;
        } catch (error) {
            throw error;
        }
    }
}
