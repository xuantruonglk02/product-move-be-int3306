import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { cloneDeep, unset } from 'lodash';
import { SqlEntity } from 'src/common/constants';
import { DataSource, Repository } from 'typeorm';
import { User, userAttributes } from '../entities/user.entity';
import { ICreateUser, IUpdateUser } from '../user.interfaces';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly dataSource: DataSource,
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

    async createUser(body: ICreateUser) {
        try {
            const inserted = await this.userRepository
                .createQueryBuilder()
                .insert()
                .into(
                    SqlEntity.USERS,
                    userAttributes.concat(['password', 'createdBy']),
                )
                .values([
                    {
                        email: body.email,
                        phoneNumber: body.phoneNumber,
                        name: body.name,
                        role: body.role,
                        password: body.password,
                        createdBy: body.createdBy,
                    },
                ])
                .execute();
            return await this.getUserByField({
                key: 'id',
                value: inserted.raw.insertId,
            });
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

    async deleteUser(id: number, deletedBy: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            const user = await queryRunner.manager
                .createQueryBuilder(User, SqlEntity.USERS)
                .where(`${SqlEntity.USERS}.id = :id`, {
                    id,
                })
                .getOne();
            user.deletedBy = deletedBy;

            await queryRunner.manager.save(user);
            await queryRunner.manager.softDelete(User, id);

            await queryRunner.commitTransaction();

            return user;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
