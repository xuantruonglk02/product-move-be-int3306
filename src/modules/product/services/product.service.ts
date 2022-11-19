import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SqlEntity } from 'src/common/constants';
import { Repository } from 'typeorm';
import {
    ProductLine,
    productLineAttributes,
} from '../entities/product-line.entity';
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
            return await this.productLineRepository
                .createQueryBuilder(SqlEntity.PRODUCT_LINES)
                .select(
                    productLineAttributes.map(
                        (attr) => `${SqlEntity.PRODUCT_LINES}.${attr}`,
                    ),
                )
                .where(`${SqlEntity.PRODUCT_LINES}.id = :id`, {
                    id: inserted.raw.insertId,
                })
                .getOne();
        } catch (error) {
            throw error;
        }
    }

    async createNewProduct(body: ICreateProduct) {
        try {
            const inserted = await this.productRepository
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
            return await this.productRepository
                .createQueryBuilder(SqlEntity.PRODUCTS)
                .select(
                    productAttributes.map(
                        (attr) => `${SqlEntity.PRODUCTS}.${attr}`,
                    ),
                )
                .where(`${SqlEntity.PRODUCTS}.id = :id`, {
                    id: inserted.raw.insertId,
                })
                .getOne();
        } catch (error) {
            throw error;
        }
    }
}
