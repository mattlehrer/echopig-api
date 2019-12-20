import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  EpInputWithPodcastItunesId,
  PodcastInit,
} from '../interfaces/episode-input-with-podcast-itunesid';
import { parseDurationString } from './helpers';

@Injectable()
export class ApplePodcastsService {
  async parse(url: string): Promise<EpInputWithPodcastItunesId> {
    const { data } = await axios.get(url);
    if (data.length < 500) {
      throw new Error(`Bad share URL or episode removed at ${url}`);
    }

    const $ = cheerio.load(data);

    const podcastInit: PodcastInit = {
      itunesId: Number(url.match(/(?:\/id)(\d+)(?:\?)/)[1]),
      appURL: url.split('?')[0],
    };

    const episodeData = {
      shareURLs: [url],
      mp3URL: data.match(/(?:"assetUrl":")(http.*m(p3|4a).*?)(?:[?"])/)[1],
      title: $('.product-header__title')
        .text()
        .trim(),
      description: $('meta[name="description"]').attr('content'),
      releaseDate: data.match(/(?:"datePublished":")(.*?)(?:")/)[1],
      duration: parseDurationString(
        data.match(/(?:"duration":"PT)(.*?)(?:")/)[1],
      ),
    };

    Logger.log(`ApplePodcastsService parsed ${url}:`);
    Logger.log(episodeData);
    Logger.log(podcastInit);

    return { episodeData, podcastInit };
  }
}
