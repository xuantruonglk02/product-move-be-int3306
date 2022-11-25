import {
    INPUT_TEXT_MAX_LENGTH,
    PHONE_NUMBER_MAX_LENGTH,
    SqlEntity,
} from 'src/common/constants';
import { BaseEntity } from 'src/common/sql-entities/base.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderDetail } from './order-detail.entity';

@Entity(SqlEntity.ORDERS)
export class Order extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: INPUT_TEXT_MAX_LENGTH,
    })
    customerName: string;

    @Column({
        type: 'varchar',
        length: INPUT_TEXT_MAX_LENGTH,
    })
    customerEmail: string;

    @Column({
        type: 'varchar',
        length: PHONE_NUMBER_MAX_LENGTH,
        nullable: true,
    })
    customerPhone: string;

    // relationships
    @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
    orderDetails: OrderDetail[];
}

export const orderAttributes = [
    'id',
    'customerName',
    'customerEmail',
    'customerPhone',
];
