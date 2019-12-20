import { Request } from 'express';
import { ObjectId } from '../../graphql.classes';
import { UserDocument } from '../users/schemas/user.schema';

export type EpisodeInputData = {
  podcast?: ObjectId;
  title?: string;
  description?: string;
  image?: string;
  mp3URL: string;
  releaseDate?: Date;
  duration?: number;
  shareURLs?: string[];
  posts?: ObjectId[];
  parentalRating?: string;
  mp3RedirectChain?: string[];
};

export interface RequestWithUser extends Request {
  user: UserDocument | ObjectId;
}
