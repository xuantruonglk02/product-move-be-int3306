import {
    Column,
    Entity,
    BaseEntity as TypeORMBaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';

@Entity()
export class BaseEntity extends TypeORMBaseEntity {
    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
        onUpdate: 'CURRENT_TIMESTAMP(6)',
    })
    updatedAt: Date;

    @DeleteDateColumn({
        type: 'timestamp',
    })
    deletedAt: Date;

    @Column({
        nullable: true,
        default: null,
    })
    createdBy: number;

    @Column({
        nullable: true,
        default: null,
    })
    updatedBy: number;

    @Column({
        nullable: true,
        default: null,
    })
    deletedBy: number;
}
