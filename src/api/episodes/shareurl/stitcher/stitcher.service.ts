import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as moment from 'moment';
import {
  EpInputWithPodcastItunesId,
  PodcastInit,
} from '../interfaces/episode-input-with-podcast-itunesid';

@Injectable()
export class StitcherService {
  async parse(url: string): Promise<EpInputWithPodcastItunesId> {
    const { data } = await axios.get(url);
    if (data.length < 500) {
      throw new Error(`Bad share URL or episode removed at ${url}`);
    }

    const $ = cheerio.load(data);
    const podcastInit: PodcastInit = {
      title: $('a', '#showTitle').html(),
      appURL: `https://www.stitcher.com${$('a', '#showInfo #showTitle').attr(
        'href',
      )}`,
    };

    let pubDate = data.match(/(?:pubDate: ')(.*?)(?:')/)[1];
    if (pubDate.length < 8) {
      pubDate = `${pubDate}, ${new Date().getFullYear()}`;
    }
    const releaseDate = new Date(moment.utc(pubDate, 'MMM D, YYYY').valueOf());
    const episodeData = {
      shareURLs: [url],
      mp3URL: data.match(/(?:episodeURL: ")(.*)(?:")/)[1],
      title: $('meta[property="og:title"]').attr('content'),
      description: $('p', '#description')
        .text()
        .trim(),
      releaseDate,
      duration: data.match(/(?:duration: )(\d*)/)[1],
    };

    Logger.log(`StitcherService parsed ${url}:`);
    Logger.log(episodeData);
    Logger.log(podcastInit);

    return { episodeData, podcastInit };
  }
}
