import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SqlEntity } from 'src/common/constants';
import { User, userAttributes } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/services/user.service';
import { DataSource, Repository } from 'typeorm';
import { ICreateUser } from '../admin.interfaces';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly userService: UserService,
        private readonly dataSource: DataSource,
    ) {}

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
            return await this.userService.getUserByField({
                key: 'id',
                value: inserted.raw.insertId,
            });
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
