import { ObjectId } from 'src/graphql.classes';

export interface EpisodeInputData {
  podcast?: ObjectId;
  title: string;
  description?: string;
  image?: string;
  mp3URL: string;
  releaseDate?: Date;
  duration?: number;
  shareURLs?: string[];
  posts?: ObjectId[];
  parentalRating?: string;
  mp3RedirectChain?: string[];
}

export interface PodcastInit {
  itunesId?: number;
  title?: string;
  appURL?: string;
}

export interface EpInputWithPodcastInit {
  episodeData: EpisodeInputData;
  podcastInit: PodcastInit;
}
