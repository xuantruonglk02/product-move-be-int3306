import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MongoCollection } from 'src/common/constants';
import { BaseEntity } from 'src/common/mongo-schema/base.schema';
import { UserRole } from '../user.constants';

export type UserDocument = User & Document;

@Schema({
    timestamps: true,
    versionKey: false,
    collection: MongoCollection.USERS,
})
export class User extends BaseEntity {
    @Prop({
        type: String,
        required: true,
    })
    email: string;

    @Prop({
        type: String,
        required: false,
    })
    phoneNumber: string;

    @Prop({
        type: String,
        required: true,
    })
    name: string;

    @Prop({
        type: String,
        enum: [...Object.values(UserRole)],
        required: true,
    })
    role: UserRole;

    @Prop({
        type: String,
        required: true,
    })
    password: string;

    @Prop({
        type: String,
        required: false,
    })
    avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index(
    {
        email: 1,
    },
    {
        unique: true,
    },
);

export const userAttributes = [
    'email',
    'phoneNumber',
    'name',
    'role',
    'avatar',
];
