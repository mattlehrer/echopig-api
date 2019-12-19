import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  EpInputWithPodcastItunesId,
  PodcastInit,
} from '../interfaces/episode-input-with-podcast-itunesid';

@Injectable()
export class PocketcastsService {
  async parse(url: string): Promise<EpInputWithPodcastItunesId> {
    const { data } = await axios.get(url);
    if (data.length < 500) {
      throw new Error(`Bad share URL or episode removed at ${url}`);
    }

    const $ = cheerio.load(data);
    const podcastInit: PodcastInit = {
      itunesId: $('a', '.itunes_button')
        .attr('href')
        .match(/(?:id)(\d+)/)[1],
      appURL: $('a', '#artwork').attr('href'),
    };

    const episodeData = {
      shareURLs: [url],
      mp3URL: $('audio').attr('src'),
      title: $('h1').text(),
      description: $('meta[property="og:description"]').attr('content'),
      releaseDate: new Date($('#episode_date').text()),
    };

    Logger.log(`PocketcastsService parsed ${url}:`);
    Logger.log(episodeData);
    Logger.log(podcastInit);

    return { episodeData, podcastInit };
  }
}
