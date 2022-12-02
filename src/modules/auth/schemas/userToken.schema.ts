import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { MongoCollection } from 'src/common/constants';
import { BaseEntity } from 'src/common/mongo-schema/base.schema';
import { User } from 'src/modules/user/schemas/user.schema';
import { UserTokenType } from '../auth.constants';

export type UserTokenDocument = UserToken & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.USER_TOKENS,
})
export class UserToken extends BaseEntity {
    @Prop({
        type: Types.ObjectId,
        ref: User.name,
        required: true,
    })
    userId: ObjectId;

    @Prop({
        type: String,
        required: true,
    })
    token: string;

    @Prop({
        type: String,
        enum: [...Object.values(UserTokenType)],
        required: true,
    })
    tokenType: UserTokenType;
}

export const UserTokenSchema = SchemaFactory.createForClass(UserToken);
UserTokenSchema.index(
    {
        userId: 1,
    },
    {
        unique: false,
    },
);

export const userTokenAttributes = ['userId', 'token', 'tokenType'];
