import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import * as RedirectChain from 'redirect-chain';
import * as moment from 'moment';
import {
  EpInputWithPodcastItunesId,
  PodcastInit,
} from '../interfaces/episode-input-with-podcast-itunesid';

@Injectable()
export class BreakerService {
  async parse(url: string): Promise<EpInputWithPodcastItunesId> {
    const browser = await puppeteer.launch({
      // args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const data = await page.content();
    browser.close();
    if (data.length < 500) {
      throw new Error(`Bad share URL or episode removed at ${url}`);
    }

    const $ = cheerio.load(data);

    const podcastInit: PodcastInit = {
      title: data.match(
        /(?:"position": 1,\s+"item": {\s+"@id": "https:\/\/www\.breaker\.audio\/.*",\s+"name": ")(.*)(?:")/,
      )[1],
      appURL: $('meta[property="og:url"]')
        .attr('content')
        .split('/')
        .slice(0, 4)
        .join('/'),
    };

    const redirectChain = RedirectChain();
    const urlsChain = await redirectChain.urls(
      $('meta[name="twitter:player:stream"]').attr('content'),
    );

    const pubDate = $(
      '.row.text-center.text-md-left .col-12 > div > div > span',
    ).html();
    const releaseDate = new Date(
      moment.utc(pubDate, 'ddd MMM D, YYYY at h:mm a').valueOf(),
    );

    // const duration = $(
    //   '.row.text-center.text-md-left .col-12 > div > div > span',
    // )
    //   .next()
    //   .text()
    //   .slice(3);
    // Logger.debug(`${duration}`);
    // @TODO: parse human friendly duration format

    const episodeData = {
      shareURLs: [url],
      mp3URL: urlsChain.length > 0 ? urlsChain[1] : urlsChain[0],
      title: data.match(
        /(?:"position": 2,\s+"item": {\s+"@id": "https:\/\/www\.breaker\.audio\/.*",\s+"name": ")(.*)(?:")/,
      )[1],
      description: $('meta[name="og:description"]').attr('content'),
      releaseDate,
      // duration,
    };

    Logger.log(`BreakerService parsed ${url}:`);
    Logger.log(episodeData);
    Logger.log(podcastInit);

    return { episodeData, podcastInit };
  }
}
