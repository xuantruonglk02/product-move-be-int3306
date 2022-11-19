import { INPUT_TEXT_MAX_LENGTH, SqlEntity } from 'src/common/constants';
import { BaseEntity } from 'src/common/sql-entities/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductLocation, ProductStatus } from '../product.constants';
import { ProductImage } from './product-image.entity';
import { ProductLine } from './product-line.entity';
import { ProductStatusTransition } from './product-status-transition.entity';

@Entity(SqlEntity.PRODUCTS)
export class Product extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * color
     * vehicle identification number
     */

    @Column({
        type: 'varchar',
        length: INPUT_TEXT_MAX_LENGTH,
    })
    productLineId: string;

    @Column({
        type: 'int',
        nullable: true,
    })
    userOfLocationId: number;

    @Column({
        type: 'enum',
        enum: ProductStatus,
        default: ProductStatus.NEW,
    })
    status: ProductStatus;

    @Column({
        type: 'enum',
        enum: ProductLocation,
        default: ProductLocation.IN_PRODUCER,
    })
    location: ProductLocation;

    // relationships
    @ManyToOne(() => ProductLine, (productLine) => productLine.products, {
        nullable: false,
    })
    productLine: ProductLine;

    @ManyToOne(() => User)
    userOfLocation: User;

    @OneToMany(
        () => ProductStatusTransition,
        (statusTransition) => statusTransition.product,
    )
    statusTransitions: ProductStatusTransition[];

    @OneToMany(() => ProductImage, (image) => image.product)
    imageUrls: ProductImage[];
}

export const productAttributes = [
    'id',
    'productLineId',
    'userOfLocationId',
    'status',
    'location',
];
