import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'nest-emitter';
import { UserDocument } from './schemas/user.schema';
import { Logger } from '@nestjs/common';
import { ObjectId } from 'src/graphql.classes';

interface UserEvents {
  notification: string;
  newUser: (user: UserDocument) => void;
  updateFeed: (user: UserDocument) => void;
}

export type UserEventEmitter = StrictEventEmitter<EventEmitter, UserEvents>;

export function onNewUser(user: UserDocument) {
  Logger.debug(`Event! New user ${user.username}`);
}

export function onFeedUpdate(userId: ObjectId) {
  Logger.debug(`Event! Update feed for ${userId}`);
}
