import { ObjectId } from '../../graphql.classes';

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
