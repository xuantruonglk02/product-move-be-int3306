import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SqlEntity } from 'src/common/constants';
import { DataSource, Repository } from 'typeorm';
import {
    ProductLine,
    productLineAttributes,
} from '../entities/product-line.entity';
import {
    ProductStatusTransition,
    productStatusTransitionAttributes,
} from '../entities/product-status-transition.entity';
import { Product, productAttributes } from '../entities/product.entity';
import { ProductLocation, ProductStatus } from '../product.constants';
import { ICreateProduct, ICreateProductLine } from '../product.interfaces';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductLine)
        private readonly productLineRepository: Repository<ProductLine>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(ProductStatusTransition)
        private readonly productStatusTransactionRepository: Repository<ProductStatusTransition>,
        private readonly dataSource: DataSource,
    ) {}

    async getProductDetail(id: number, attrs = productAttributes) {
        try {
            return await this.productRepository
                .createQueryBuilder(SqlEntity.PRODUCTS)
                .select(attrs.map((attr) => `${SqlEntity.PRODUCTS}.${attr}`))
                .where(`${SqlEntity.PRODUCTS}.id = :id`, { id })
                .getOne();
        } catch (error) {
            throw error;
        }
    }

    async getProductLineDetail(id: string, attrs = productLineAttributes) {
        try {
            return await this.productLineRepository
                .createQueryBuilder(SqlEntity.PRODUCT_LINES)
                .select(
                    attrs.map((attr) => `${SqlEntity.PRODUCT_LINES}.${attr}`),
                )
                .where(`${SqlEntity.PRODUCT_LINES}.id = :id`, { id })
                .getOne();
        } catch (error) {
            throw error;
        }
    }

    async getProductStatusTransition(
        id: number,
        attrs = productStatusTransitionAttributes,
    ) {
        try {
            return await this.productStatusTransactionRepository
                .createQueryBuilder(SqlEntity.PRODUCT_STATUS_TRANSITIONS)
                .select(
                    attrs.map(
                        (attr) =>
                            `${SqlEntity.PRODUCT_STATUS_TRANSITIONS}.${attr}`,
                    ),
                )
                .where(`${SqlEntity.PRODUCT_STATUS_TRANSITIONS}.id = :id`, {
                    id,
                })
                .getOne();
        } catch (error) {
            throw error;
        }
    }

    async createNewProductLine(body: ICreateProductLine) {
        try {
            const inserted = await this.productLineRepository
                .createQueryBuilder()
                .insert()
                .into(
                    SqlEntity.PRODUCT_LINES,
                    productLineAttributes.concat(['createdBy']),
                )
                .values([
                    {
                        id: body.id,
                        name: body.name,
                        price: body.price,
                        createdBy: body.createdBy,
                    },
                ])
                .execute();
            return await this.getProductLineDetail(inserted.raw.insertId);
        } catch (error) {
            throw error;
        }
    }

    async createNewProduct(body: ICreateProduct) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            const inserted = await queryRunner.manager
                .createQueryBuilder()
                .insert()
                .into(
                    SqlEntity.PRODUCTS,
                    productAttributes.concat(['createdBy']),
                )
                .values([
                    {
                        status: ProductStatus.NEW,
                        location: ProductLocation.IN_PRODUCER,
                        productLineId: body.productLineId,
                        userOfLocationId: body.userOfLocationId,
                        createdBy: body.createdBy,
                    },
                ])
                .execute();
            await queryRunner.manager
                .createQueryBuilder()
                .update(ProductLine)
                .set({
                    quantityOfProduct: () => 'quantityOfProduct + 1',
                    updatedBy: body.createdBy,
                })
                .where('id = :id', { id: body.productLineId })
                .execute();

            await queryRunner.commitTransaction();

            return await this.getProductDetail(inserted.raw.insertId);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
