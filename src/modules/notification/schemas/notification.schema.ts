import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MongoCollection } from 'src/common/constants';
import { BaseEntity } from 'src/common/mongo-schema/base.schema';
import { NotificationType } from '../notification.constants';

export type NotificationDocument = Notification & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.NOTIFICATIONS,
})
export class Notification extends BaseEntity {
    @Prop({
        type: String,
        enum: [...Object.values(NotificationType)],
        required: true,
    })
    type: NotificationType;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

export const notificationAttributes = ['type'];
