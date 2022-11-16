import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SqlEntity } from 'src/common/constants';
import { Repository } from 'typeorm';
import { User, userAttributes } from '../entities/user.entity';
import { ICreateUser } from '../user.interfaces';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async createUser(body: ICreateUser) {
        try {
            return await this.userRepository
                .createQueryBuilder()
                .insert()
                .into(SqlEntity.USERS, userAttributes.concat(['createdBy']))
                .values([
                    {
                        username: body.username,
                        role: body.role,
                        password: body.password,
                        createdBy: body.createdBy,
                    },
                ])
                .execute();
        } catch (error) {
            throw error;
        }
    }

    async getUserDetail(id: number) {
        try {
            return await this.userRepository
                .createQueryBuilder(SqlEntity.USERS)
                .select(
                    userAttributes
                        .concat(['id'])
                        .map((attr) => `${SqlEntity.USERS}.${attr}`),
                )
                .where(`${SqlEntity.USERS}.id = :id`, { id })
                .getOne();
        } catch (error) {
            throw error;
        }
    }

    async getUserByUsername(username: string) {
        try {
            return await this.userRepository
                .createQueryBuilder(SqlEntity.USERS)
                .select([`${SqlEntity.USERS}.id`])
                .where(`${SqlEntity.USERS}.username = :username`, { username })
                .getOne();
        } catch (error) {
            throw error;
        }
    }
}
