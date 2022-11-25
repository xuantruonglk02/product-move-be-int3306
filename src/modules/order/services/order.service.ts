import { Injectable } from '@nestjs/common';
import { SqlEntity } from 'src/common/constants';
import { ICheckout } from 'src/modules/agency/agency.interfaces';
import { ProductLine } from 'src/modules/product/entities/product-line.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { DataSource } from 'typeorm';
import { orderDetailAttributes } from '../entities/order-detail.entity';
import { orderAttributes } from '../entities/order.entity';

@Injectable()
export class OrderService {
    constructor(private readonly dataSource: DataSource) {}

    async createNewOrder(body: ICheckout) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            const order = await queryRunner.manager
                .createQueryBuilder()
                .insert()
                .into(SqlEntity.ORDERS, orderAttributes.concat(['createdBy']))
                .values([
                    {
                        customerName: body.customerName,
                        customerEmail: body.customerName,
                        customerPhone: body.customerName,
                        createdBy: body.agencyId,
                    },
                ])
                .execute();

            const products = await queryRunner.manager
                .createQueryBuilder(Product, SqlEntity.PRODUCTS)
                .select(
                    ['id', 'productLineId', 'price'].map(
                        (attr) => `${SqlEntity.PRODUCTS}.${attr}`,
                    ),
                )
                .where(`${SqlEntity.PRODUCTS}.id IN (:...ids)`, {
                    ids: body.productIds,
                })
                .getMany();
            const mapProductLineIdToQuantity = new Map<string, number>();
            products.forEach((product) => {
                if (!mapProductLineIdToQuantity.get(product.productLineId)) {
                    mapProductLineIdToQuantity.set(product.productLineId, 1);
                } else {
                    mapProductLineIdToQuantity.set(
                        product.productLineId,
                        mapProductLineIdToQuantity.get(product.productLineId) +
                            1,
                    );
                }
            });

            const productLines = await queryRunner.manager
                .createQueryBuilder(ProductLine, SqlEntity.PRODUCT_LINES)
                .select(
                    ['id', 'price', 'quantityOfProduct'].map(
                        (attr) => `${SqlEntity.PRODUCT_LINES}.${attr}`,
                    ),
                )
                .where(`${SqlEntity.PRODUCT_LINES}.id IN (:...ids)`, {
                    ids: Array.from(mapProductLineIdToQuantity.keys()),
                })
                .getMany();
            const mapProductLineIdToPrice = new Map<string, number>();
            productLines.forEach((productLine) => {
                productLine.quantityOfProduct -= mapProductLineIdToQuantity.get(
                    productLine.id,
                );
                productLine.updatedBy = body.agencyId;
                mapProductLineIdToPrice.set(productLine.id, productLine.price);
            });
            await queryRunner.manager.save(productLines);

            const orderDetails = await queryRunner.manager
                .createQueryBuilder()
                .insert()
                .into(
                    SqlEntity.ORDER_DETAILS,
                    orderDetailAttributes.concat(['createdBy']),
                )
                .values(
                    products.map((product) => {
                        return {
                            orderId: order.raw.insertId,
                            productId: product.id,
                            productPrice: mapProductLineIdToPrice.get(
                                product.productLineId,
                            ),
                            createdBy: body.agencyId,
                        };
                    }),
                )
                .execute();

            await queryRunner.commitTransaction();

            return {
                ...order,
                details: orderDetails,
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
