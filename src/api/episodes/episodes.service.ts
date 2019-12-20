import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoError } from 'mongodb';
import { Model } from 'mongoose';
import * as RedirectChain from 'redirect-chain';
import { EpisodeDocument } from './schemas/episode.schema';
import { ObjectId } from '../../graphql.classes';
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
    let episode: EpisodeDocument | undefined = await this.episodeModel.findOne({
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
          Logger.log('Created new episode');
          Logger.log(episode);
        } catch (error) {
          throw this.evaluateMongoError(error);
        }
      }
    }

    return episode;
  }

  async getAllEpisodesOfPodcast(podcast: ObjectId): Promise<EpisodeDocument[]> {
    return await this.episodeModel.find({ podcast });
  }

  async getEpisode(episodeId: ObjectId): Promise<EpisodeDocument> {
    return await this.episodeModel.findById(episodeId);
  }

  async removePostOfEpisode(postId: ObjectId): Promise<EpisodeDocument> {
    return await this.episodeModel.updateOne(
      { posts: postId },
      { $pull: { posts: postId } },
    );
  }

  private evaluateMongoError(
    error: MongoError,
    // createPostInput: CreatePostInput,
  ): Error {
    // if (error.code === 11000) {
    //   if (
    //     error.message
    //       .toLowerCase()
    //       .includes(normalizeEmail(createPostInput.email))
    //   ) {
    //     throw new Error(
    //       `e-mail ${createPostInput.email} is already registered`,
    //     );
    //   }
    // }
    throw new Error(error.message);
  }
}
