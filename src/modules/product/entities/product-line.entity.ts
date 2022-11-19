import { INPUT_TEXT_MAX_LENGTH, SqlEntity } from 'src/common/constants';
import { BaseEntity } from 'src/common/sql-entities/base.entity';
import { Column, Entity, Index, OneToMany, PrimaryColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity(SqlEntity.PRODUCT_LINES)
export class ProductLine extends BaseEntity {
    @PrimaryColumn({
        type: 'varchar',
        length: INPUT_TEXT_MAX_LENGTH,
    })
    id: string;

    @Column({
        type: 'varchar',
        length: INPUT_TEXT_MAX_LENGTH,
    })
    @Index()
    name: string;

    @Column({
        type: 'int',
    })
    price: number;

    @Column({
        type: 'int',
        default: 0,
    })
    quantityOfProduct: number;

    // relationships
    @OneToMany(() => Product, (product) => product.productLine)
    products: Product[];
}

export const productLineAttributes = [
    'id',
    'name',
    'price',
    'quantityOfProduct',
];
