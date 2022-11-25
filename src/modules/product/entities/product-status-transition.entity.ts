import { SqlEntity } from 'src/common/constants';
import { BaseEntity } from 'src/common/sql-entities/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductStatus } from '../product.constants';
import { Product } from './product.entity';

@Entity(SqlEntity.PRODUCT_STATUS_TRANSITIONS)
export class ProductStatusTransition extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'int',
    })
    productId: number;

    @Column({
        type: 'int',
    })
    userOfPreviousLocationId: number;

    @Column({
        type: 'int',
    })
    userOfNextLocationId: number;

    @Column({
        type: 'enum',
        enum: ProductStatus,
    })
    previousStatus: ProductStatus;

    @Column({
        type: 'enum',
        enum: ProductStatus,
    })
    nextStatus: ProductStatus;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
    })
    startDate: Date;

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    finishDate: Date;

    // relationships
    @ManyToOne(() => Product, (product) => product.statusTransitions, {
        nullable: false,
    })
    product: Product;

    @ManyToOne(() => User)
    userOfPreviousLocation: User;

    @ManyToOne(() => User)
    userOfNextLocation: User;
}

export const productStatusTransitionAttributes = [
    'id',
    'productId',
    'userOfPreviousLocationId',
    'userOfNextLocationId',
    'previousStatus',
    'currentStatus',
    'startDate',
    'finishDate',
];
