import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoError } from 'mongodb';
import { Model } from 'mongoose';
import * as RedirectChain from 'redirect-chain';
import { EpisodeDocument } from './schemas/episode.schema';
import { ObjectId } from 'src/graphql.classes';
import { ShareurlService } from './shareurl/shareurl.service';

@Injectable()
export class EpisodesService {
  constructor(
    @InjectModel('Episode')
    private readonly episodeModel: Model<EpisodeDocument>,
    private shareurlService: ShareurlService,
  ) {}

  async findOrCreate(shareURL: string): Promise<EpisodeDocument> {
    // check for existing episode with this shareURL
    let episode: EpisodeDocument | null = await this.episodeModel.findOne({
      shareURLs: shareURL,
    });
    if (!episode) {
      // parse episodeData from shareURL
      const episodeData = await this.shareurlService.shareURLHandler(shareURL);
      const redirectChain = RedirectChain();
      episodeData.mp3RedirectChain = await redirectChain.urls(
        episodeData.mp3URL,
      );

      // check for existing episode with this mp3URL in mp3RedirectChain
      episode = await this.episodeModel.findOne({
        mp3RedirectChain: episodeData.mp3URL,
      });
      if (!episode) {
        const createdEpisode = new this.episodeModel(episodeData);
        try {
          episode = await createdEpisode.save();
          Logger.log('Created new episode', EpisodesService.name);
          Logger.log(episode, EpisodesService.name);
        } catch (error) {
          throw new MongoError(error);
        }
      }
    }

    return episode;
  }

  async getAllEpisodesOfPodcast(podcast: ObjectId): Promise<EpisodeDocument[]> {
    return await this.episodeModel.find({ podcast });
  }

  async getEpisode(episodeId: ObjectId): Promise<EpisodeDocument | undefined> {
    const episode = await this.episodeModel.findById(episodeId);
    if (!episode) return undefined;
    return episode;
  }
}
