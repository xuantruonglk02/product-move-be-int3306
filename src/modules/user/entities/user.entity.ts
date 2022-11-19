import {
    HASH_PASSWORD_LENGTH,
    INPUT_TEXT_MAX_LENGTH,
    SqlEntity,
    UserRole,
} from 'src/common/constants';
import { BaseEntity } from 'src/common/sql-entities/base.entity';
import { UserToken } from 'src/modules/auth/entities/userToken.entity';
import {
    Column,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity(SqlEntity.USERS)
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: INPUT_TEXT_MAX_LENGTH,
    })
    @Index()
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

    // relationships
    @OneToMany(() => UserToken, (token) => token.user)
    tokens: UserToken[];
}

export const userAttributes = ['id', 'username', 'role'];
