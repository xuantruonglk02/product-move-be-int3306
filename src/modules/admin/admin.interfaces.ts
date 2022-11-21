import { IUser } from '../user/user.interfaces';

export interface ICreateUser extends IUser {
    password: string;
    createdBy: number;
}
