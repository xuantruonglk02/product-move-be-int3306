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
