import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  EpInputWithPodcastInit,
  PodcastInit,
} from 'src/api/episodes/shareurl/interfaces/episode-input-with-podcast-itunesid';

@Injectable()
export class PocketcastsService {
  async parse(url: string): Promise<EpInputWithPodcastInit> {
    const { data } = await axios.get(url);
    if (data.length < 500) {
      throw new Error(`Bad share URL or episode removed at ${url}`);
    }

    const $ = cheerio.load(data);

    const itunesHtml = $('a', '.itunes_button').attr('href');
    if (!itunesHtml) throw new Error(`Could not find itunesId for ${url}`);
    const itunesMatch = itunesHtml.match(/(?:id)(\d+)/);
    if (!itunesMatch) throw new Error(`Could not find itunesId for ${url}`);
    const itunesId = Number(itunesMatch[1]);
    if (!itunesId) throw new Error(`Could not find itunesId for ${url}`);

    const podcastInit: PodcastInit = {
      itunesId,
      appURL: $('a', '#artwork').attr('href'),
    };

    const mp3URL = $('audio').attr('src');
    if (!mp3URL) throw new Error(`Could not find mp3URL for ${url}`);
    const title = $('h1').text();
    if (!title) throw new Error(`Could not find episode title for ${url}`);

    const episodeData = {
      shareURLs: [url],
      mp3URL,
      title,
      description: $('meta[property="og:description"]').attr('content'),
      releaseDate: new Date($('#episode_date').text()),
      duration: $('#duration_time').data('duration'),
    };

    Logger.log(`PocketcastsService parsed ${url}:`);
    Logger.log(episodeData);
    Logger.log(podcastInit);

    return { episodeData, podcastInit };
  }
}
