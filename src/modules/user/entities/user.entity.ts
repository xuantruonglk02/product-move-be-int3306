import {
    HASH_PASSWORD_LENGTH,
    INPUT_TEXT_MAX_LENGTH,
    SqlEntity,
    UserRole,
} from 'src/common/constants';
import { BaseEntity } from 'src/common/sql-entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity(SqlEntity.USERS)
export class User extends BaseEntity {
    @Column({
        type: 'varchar',
        length: INPUT_TEXT_MAX_LENGTH,
        unique: true,
    })
    username: string;

    @Column({
        type: 'enum',
        enum: UserRole,
    })
    role: UserRole;

    @Column({
        type: 'char',
        length: HASH_PASSWORD_LENGTH,
    })
    password: string;
}

export const userAttributes = ['username', 'role', 'password'];
