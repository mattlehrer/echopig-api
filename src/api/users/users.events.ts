import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'nest-emitter';
import { ObjectId } from 'src/graphql.classes';

interface UserEvents {
  notification: string;
  newOrUpdatedUser: (userId: ObjectId) => void;
}

export type UserEventEmitter = StrictEventEmitter<EventEmitter, UserEvents>;
