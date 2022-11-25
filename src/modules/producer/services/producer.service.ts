import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SqlEntity } from 'src/common/constants';
import {
    ProductStatusTransition,
    productStatusTransitionAttributes,
} from 'src/modules/product/entities/product-status-transition.entity';
import { ProductStatus } from 'src/modules/product/product.constants';
import { ProductService } from 'src/modules/product/services/product.service';
import { Repository } from 'typeorm';

@Injectable()
export class ProducerService {
    constructor(
        @InjectRepository(ProductStatusTransition)
        private readonly productStatusTransitionRepository: Repository<ProductStatusTransition>,
        private readonly productService: ProductService,
    ) {}

    async exportNewProductToAgency(
        productId: number,
        producerId: number,
        agencyId: number,
    ) {
        try {
            const inserted = await this.productStatusTransitionRepository
                .createQueryBuilder()
                .insert()
                .into(
                    SqlEntity.PRODUCT_STATUS_TRANSITIONS,
                    productStatusTransitionAttributes.concat(['createdBy']),
                )
                .values([
                    {
                        productId,
                        userOfPreviousLocationId: producerId,
                        userOfNextLocationId: agencyId,
                        previousStatus: ProductStatus.NEW,
                        nextStatus: ProductStatus.IN_AGENCY,
                    },
                ])
                .execute();
            return await this.productService.getProductStatusTransition(
                inserted.raw.insertId,
            );
        } catch (error) {
            throw error;
        }
    }
}
