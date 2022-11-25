import { SqlEntity } from 'src/common/constants';
import { BaseEntity } from 'src/common/sql-entities/base.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity(SqlEntity.ORDER_DETAILS)
export class OrderDetail extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'int',
    })
    orderId: number;

    @Column({
        type: 'int',
    })
    productId: number;

    @Column({
        type: 'int',
    })
    productPrice: number;

    // relationships
    @ManyToOne(() => Order, (order) => order.orderDetails, {
        nullable: false,
    })
    order: Order;

    @ManyToOne(() => Product, {
        nullable: false,
    })
    product: Product;
}

export const orderDetailAttributes = [
    'id',
    'orderId',
    'productId',
    'productPrice',
];
