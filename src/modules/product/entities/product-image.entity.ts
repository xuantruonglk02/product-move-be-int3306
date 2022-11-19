import { IMAGE_URL_MAX_LENGTH, SqlEntity } from 'src/common/constants';
import { BaseEntity } from 'src/common/sql-entities/base.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity(SqlEntity.PRODUCT_IMAGES)
export class ProductImage extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'int',
    })
    productId: number;

    @Column({
        type: 'varchar',
        length: IMAGE_URL_MAX_LENGTH,
    })
    url: string;

    // relationships
    @ManyToOne(() => Product, (product) => product.imageUrls, {
        nullable: false,
    })
    product: Product;
}

export const productImageAttributes = ['id', 'productId', 'url'];
