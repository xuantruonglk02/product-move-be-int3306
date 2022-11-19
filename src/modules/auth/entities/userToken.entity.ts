import { SqlEntity } from 'src/common/constants';
import { BaseEntity } from 'src/common/sql-entities/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserTokenType } from '../auth.constants';

@Entity(SqlEntity.USER_TOKENS)
export class UserToken extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'int',
    })
    userId: NumberConstructor;

    @Column({})
    token: string;

    @Column({
        type: 'enum',
        enum: UserTokenType,
    })
    tokenType: UserTokenType;

    // relationships
    @ManyToOne(() => User, (user) => user.tokens, {
        nullable: false,
    })
    user: User;
}

export const userTokenAttributes = ['id', 'userId', 'token', 'tokenType'];
