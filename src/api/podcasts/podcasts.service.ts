import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoError } from 'mongodb';
import * as searchitunes from 'searchitunes';
import { PodcastDocument } from './schemas/podcast.schema';

@Injectable()
export class PodcastsService {
  constructor(
    @InjectModel('Podcast')
    private readonly podcastModel: Model<PodcastDocument>,
  ) {}

  async findOrCreateByItunesId(iTunesID: number): Promise<PodcastDocument> {
    let podcast: PodcastDocument | undefined = await this.podcastModel.findOne({
      iTunesID,
    });
    if (!podcast) {
      const podcastData = await searchitunes({ id: iTunesID });
      const createdPodcast = new this.podcastModel(podcastData);

      try {
        podcast = await createdPodcast.save();
        Logger.log('Created new podcast');
        Logger.log(podcast);
      } catch (error) {
        throw this.evaluateMongoError(error);
      }
    }
    return podcast;
  }

  async findOrCreateByTitle(title: string): Promise<PodcastDocument> {
    let podcast: PodcastDocument | undefined = await this.podcastModel.findOne({
      title,
    });
    if (!podcast) {
      const { results } = await searchitunes({
        entity: 'podcast',
        term: title,
        limit: 1,
      });
      const podcastData = results[0];
      Logger.debug(podcastData);
      if (title !== podcastData.collectionName) {
        Logger.warn(
          `Creating podcast without exact match on title;\n from share URL: ${title} and from iTunes: ${podcastData.collectionName}`,
        );
      }
      const createdPodcast = new this.podcastModel(podcastData);

      try {
        podcast = await createdPodcast.save();
        Logger.log('Created new podcast');
        Logger.log(podcast);
      } catch (error) {
        throw this.evaluateMongoError(error);
      }
    }
    return podcast;
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
