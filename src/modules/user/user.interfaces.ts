import { ObjectId } from 'mongodb';
import { ICommonListQuery } from 'src/common/interfaces';
import { UserRole } from './user.constants';

export interface IUser {
    email: string;
    phoneNumber: string;
    name: string;
    role: UserRole;
    avatar: string;
}

export interface IGetUserList extends ICommonListQuery {
    role?: UserRole;
}

export interface ICreateUser extends IUser {
    password: string;
    createdBy: ObjectId;
}

export interface IUpdateUser extends Omit<IUser, 'email' | 'role'> {
    confirmPassword: string;

    phoneNumber: string;
    name: string;
    avatar: string;
    password: string;
    updatedBy: ObjectId;
}
