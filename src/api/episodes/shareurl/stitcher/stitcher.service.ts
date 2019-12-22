import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as moment from 'moment';
import {
  EpInputWithPodcastInit,
  PodcastInit,
} from 'src/api/episodes/shareurl/interfaces/episode-input-with-podcast-itunesid';

@Injectable()
export class StitcherService {
  async parse(url: string): Promise<EpInputWithPodcastInit> {
    const { data } = await axios.get(url);
    if (data.length < 500) {
      throw new Error(`Bad share URL or episode removed at ${url}`);
    }

    const $ = cheerio.load(data);
    const podcastInit: PodcastInit = {
      title: $('a', '#showTitle').html() || undefined,
      appURL: `https://www.stitcher.com${$('a', '#showInfo #showTitle').attr(
        'href',
      )}`,
    };

    const mp3URL = data.match(/(?:episodeURL: ")(.*)(?:")/)[1];
    if (!mp3URL) throw new Error(`Could not find mp3URL for ${url}`);
    const title = $('meta[property="og:title"]').attr('content');
    if (!title) throw new Error(`Could not find episode title for ${url}`);

    let pubDate = data.match(/(?:pubDate: ')(.*?)(?:')/)[1];
    if (pubDate.length < 8) {
      pubDate = `${pubDate}, ${new Date().getFullYear()}`;
    }
    const releaseDate = new Date(moment.utc(pubDate, 'MMM D, YYYY').valueOf());
    const episodeData = {
      shareURLs: [url],
      mp3URL,
      title,
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
