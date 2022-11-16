import { UserRole } from 'src/common/constants';

export interface IUser {
    id: number;
    username: string;
    role: UserRole;
}

export interface ICreateUser extends IUser {
    password: string;
    createdBy: number;
}
