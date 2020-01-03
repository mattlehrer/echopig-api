import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  EpInputWithPodcastInit,
  PodcastInit,
} from 'src/api/episodes/shareurl/interfaces/episode-input-with-podcast-itunesid';

@Injectable()
export class OvercastService {
  async parse(url: string): Promise<EpInputWithPodcastInit> {
    const { data } = await axios.get(url);
    if (data.length < 500) {
      throw new Error(`Bad share URL or episode removed at ${url}`);
    }

    const $ = cheerio.load(data);

    const itunesHtml = $('h3 a').attr('href');
    if (!itunesHtml) throw new Error(`Could not find itunesId for ${url}`);
    const itunesMatch = itunesHtml.match(/\d+/);
    if (!itunesMatch) throw new Error(`Could not find itunesId for ${url}`);
    const itunesId = Number(itunesMatch[0]);
    if (!itunesId) throw new Error(`Could not find itunesId for ${url}`);

    const podcastInit: PodcastInit = {
      itunesId,
      appURL: `https://overcast.fm${itunesHtml}`,
    };

    const mp3URL = $('audio source').attr('src');
    if (!mp3URL) throw new Error(`Could not find mp3URL for ${url}`);
    const title = $('h2').text();
    if (!title) throw new Error(`Could not find episode title for ${url}`);

    const episodeData = {
      shareURLs: [url],
      mp3URL,
      title,
      description: $('meta[name="og:description"]').attr('content'),
      releaseDate: new Date(
        $('h2')
          .next()
          .text()
          .trim(),
      ),
    };

    Logger.log(`OvercastService parsed ${url}:`, OvercastService.name);
    Logger.log(episodeData, OvercastService.name);
    Logger.log(podcastInit, OvercastService.name);

    return { episodeData, podcastInit };
  }
}
