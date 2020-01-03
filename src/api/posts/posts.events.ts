import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'nest-emitter';
import { ObjectId } from 'src/graphql.classes';

interface PostEvents {
  notification: string;
  feedNeedsUpdate: (userId: ObjectId) => void;
}

export type PostEventEmitter = StrictEventEmitter<EventEmitter, PostEvents>;
