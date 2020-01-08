import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'nest-emitter';
import { UserDocument } from '../users/schemas/user.schema';

interface PostEvents {
  notification: string;
  feedNeedsUpdate: PostEventData;
}

interface PostEventData {
  user: UserDocument;
  event: string;
}

export type PostEventEmitter = StrictEventEmitter<EventEmitter, PostEvents>;
