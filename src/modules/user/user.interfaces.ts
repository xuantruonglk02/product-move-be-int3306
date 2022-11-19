import { UserRole } from './user.constants';

export interface IUser {
    id: number;
    username: string;
    role: UserRole;
}

export interface ICreateUser extends IUser {
    password: string;
    createdBy: number;
}

export interface IUpdateUser extends Omit<IUser, 'id' | 'username' | 'role'> {
    confirmPassword: string;

    password: string;
    updatedBy: number;
}
