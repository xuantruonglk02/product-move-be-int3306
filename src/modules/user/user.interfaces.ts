import { UserRole } from './user.constants';

export interface IUser {
    id: number;
    email: string;
    phoneNumber: string;
    name: string;
    role: UserRole;
}

export interface IUpdateUser extends Omit<IUser, 'id' | 'email' | 'role'> {
    confirmPassword: string;

    password: string;
    updatedBy: number;
}
