import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { cloneDeep, unset } from 'lodash';
import { SqlEntity } from 'src/common/constants';
import { Repository } from 'typeorm';
import { User, userAttributes } from '../entities/user.entity';
import { IUpdateUser } from '../user.interfaces';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getUserByField(
        field: { key: string; value: any },
        attrs = userAttributes,
    ) {
        try {
            return await this.userRepository
                .createQueryBuilder(SqlEntity.USERS)
                .select(attrs.map((attr) => `${SqlEntity.USERS}.${attr}`))
                .where(`${SqlEntity.USERS}.${field.key} = :${field.key}`, {
                    [field.key]: field.value,
                })
                .getOne();
        } catch (error) {
            throw error;
        }
    }

    async updateUser(id: number, body: IUpdateUser) {
        try {
            const updateBody = cloneDeep(body);
            unset(updateBody, 'confirmPassword');

            await this.userRepository
                .createQueryBuilder()
                .update(User)
                .set(updateBody)
                .where('id = :id', { id })
                .execute();

            return await this.getUserByField({ key: 'id', value: id });
        } catch (error) {
            throw error;
        }
    }
}
