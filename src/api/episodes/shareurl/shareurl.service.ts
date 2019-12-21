import { Injectable, Logger } from '@nestjs/common';
import { OvercastService } from './overcast/overcast.service';
import { ApplePodcastsService } from './applepodcasts/applepodcasts.service';
import { PocketcastsService } from './pocketcasts/pocketcasts.service';
import { BreakerService } from './breaker/breaker.service';
import { StitcherService } from './stitcher/stitcher.service';
import { PodcastsService } from 'src/api/podcasts/podcasts.service';
import { PodcastDocument } from 'src/api/podcasts/schemas/podcast.schema';
import {
  EpisodeInputData,
  EpInputWithPodcastInit,
} from './interfaces/episode-input-with-podcast-itunesid';
import { UserInputError } from 'apollo-server-core';

@Injectable()
export class ShareurlService {
  constructor(
    private overcastService: OvercastService,
    private applePodcastsService: ApplePodcastsService,
    private pocketcastsService: PocketcastsService,
    private breakerService: BreakerService,
    private stitcherService: StitcherService,
    private podcastsService: PodcastsService,
  ) {}

  private HANDLERS: {
    [key: string]: (url: string) => Promise<EpInputWithPodcastInit>;
  } = {
    'overcast.fm': this.overcastService.parse,
    'apple.com': this.applePodcastsService.parse,
    'pca.st': this.pocketcastsService.parse,
    'breaker.audio': this.breakerService.parse,
    'stitcher.com': this.stitcherService.parse,
  };

  async shareURLHandler(url: string): Promise<EpisodeInputData> {
    const domainRegex = /:\/\/(.[^/]+)/;
    let domainParts = url.match(domainRegex);
    if (!domainParts) throw new UserInputError('Bad share URL');
    domainParts = domainParts[1].split('.');
    const domain = domainParts.slice(domainParts.length - 2).join('.');
    const handler = this.HANDLERS[domain];
    if (!handler) {
      Logger.error(`No handler for shareURL: ${url}`);
      throw new Error(`Podcast app not yet implemented: ${url}`);
    }

    const { episodeData, podcastInit } = await handler(url);
    let podcast: PodcastDocument | undefined;
    if (podcastInit.itunesId) {
      podcast = await this.podcastsService.findOrCreateByItunesId(
        podcastInit.itunesId,
      );
    } else if (podcastInit.title) {
      podcast = await this.podcastsService.findOrCreateByTitle(
        podcastInit.title,
      );
    }
    if (!podcast) throw new Error('Could not create podcast');
    if (podcastInit.appURL) {
      podcast.appURLs =
        podcast.appURLs && podcast.appURLs.length
          ? [...new Set([...podcast.appURLs, podcastInit.appURL])]
          : [podcastInit.appURL];
      podcast.save();
    }
    episodeData.podcast = podcast._id;

    return episodeData;
  }
}
