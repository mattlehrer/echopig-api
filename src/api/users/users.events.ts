import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'nest-emitter';
import { UserDocument } from './schemas/user.schema';

interface UserEvents {
  notification: string;
  newUser: (user: UserDocument) => void;
  updatedUser: (user: UserDocument) => void;
}

export type UserEventEmitter = StrictEventEmitter<EventEmitter, UserEvents>;
