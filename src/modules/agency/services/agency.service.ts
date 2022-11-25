import { Injectable } from '@nestjs/common';
import { OrderService } from 'src/modules/order/services/order.service';
import { ProductStatusTransition } from 'src/modules/product/entities/product-status-transition.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import {
    ProductLocation,
    ProductStatus,
} from 'src/modules/product/product.constants';
import { ProductService } from 'src/modules/product/services/product.service';
import { DataSource } from 'typeorm';
import { ICheckout } from '../agency.interfaces';

@Injectable()
export class AgencyService {
    constructor(
        private readonly productService: ProductService,
        private readonly orderService: OrderService,
        private readonly dataSource: DataSource,
    ) {}

    async importNewProductFromProducer(transitionId: number, agencyId: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            const transition =
                await this.productService.getProductStatusTransition(
                    transitionId,
                    ['productId'],
                );

            await queryRunner.manager
                .createQueryBuilder()
                .update(ProductStatusTransition)
                .set({
                    finishDate: new Date(),
                    updatedBy: agencyId,
                })
                .where('id = :id', { id: transitionId })
                .execute();
            await queryRunner.manager
                .createQueryBuilder()
                .update(Product)
                .set({
                    userOfLocationId: agencyId,
                    status: ProductStatus.IN_AGENCY,
                    location: ProductLocation.IN_AGENCY,
                    updatedBy: agencyId,
                })
                .where(`id = :id`, { id: transition.productId })
                .execute();

            await queryRunner.commitTransaction();

            return await this.productService.getProductStatusTransition(
                transitionId,
            );
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async createNewCheckout(body: ICheckout) {
        try {
            const order = await this.orderService.createNewOrder(body);

            return order;
        } catch (error) {
            throw error;
        }
    }
}
