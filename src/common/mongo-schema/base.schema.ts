import { Prop } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';

export class BaseEntity {
    _id: ObjectId;

    @Prop({
        type: Date,
        required: true,
        default: Date.now,
    })
    createdAt: Date;

    @Prop({
        type: Date,
        required: false,
        default: null,
    })
    updatedAt: Date;

    @Prop({
        type: Date,
        required: false,
        default: null,
    })
    deletedAt: Date;

    @Prop({
        type: Types.ObjectId,
        required: true,
    })
    createdBy: ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: false,
        default: null,
    })
    updatedBy: ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: false,
        default: null,
    })
    deletedBy: ObjectId;
}
