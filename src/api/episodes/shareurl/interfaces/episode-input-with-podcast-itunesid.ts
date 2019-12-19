import { EpisodeInputData } from 'src/api/types/inputs';

export interface PodcastInit {
  itunesId?: number;
  title?: string;
  appURL: string;
}

export interface EpInputWithPodcastItunesId {
  episodeData: EpisodeInputData;
  podcastInit: PodcastInit;
}
