import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  EpInputWithPodcastItunesId,
  PodcastInit,
} from '../interfaces/episode-input-with-podcast-itunesid';

@Injectable()
export class OvercastService {
  async parse(url: string): Promise<EpInputWithPodcastItunesId> {
    const { data } = await axios.get(url);
    if (data.length < 500) {
      throw new Error(`Bad share URL or episode removed at ${url}`);
    }

    const $ = cheerio.load(data);
    const podcastInit: PodcastInit = {
      itunesId: $('h3 a')
        .attr('href')
        .match(/\d+/)[0],
      appURL: `https://overcast.fm${$('h3 a').attr('href')}`,
    };

    const episodeData = {
      shareURLs: [url],
      mp3URL: $('audio source').attr('src'),
      title: $('h2').text(),
      description: $('meta[name="og:description"]').attr('content'),
      releaseDate: new Date(
        $('h2')
          .next()
          .text()
          .trim(),
      ),
    };

    Logger.log(`OvercastService parsed ${url}:`);
    Logger.log(episodeData);
    Logger.log(podcastInit);

    return { episodeData, podcastInit };
  }
}
