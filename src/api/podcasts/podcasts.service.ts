import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoError } from 'mongodb';
// import * as searchitunes from 'searchitunes';
import searchitunes = require('searchitunes');
import { PodcastDocument } from './schemas/podcast.schema';
import { ObjectId } from 'src/graphql.classes';
import { EpisodesService } from '../episodes/episodes.service';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class PodcastsService implements OnModuleInit {
  private episodesService: EpisodesService;
  constructor(
    @InjectModel('Podcast')
    private readonly podcastModel: Model<PodcastDocument>,
    private readonly moduleRef: ModuleRef,
  ) {}
  onModuleInit() {
    this.episodesService = this.moduleRef.get(EpisodesService, {
      strict: false,
    });
  }

  async findOrCreateByItunesId(iTunesID: number): Promise<PodcastDocument> {
    let podcast: PodcastDocument | null = await this.podcastModel.findOne({
      iTunesID,
    });
    if (!podcast) {
      const podcastData = await searchitunes({ id: iTunesID });
      const createdPodcast = new this.podcastModel(podcastData);

      try {
        podcast = await createdPodcast.save();
        Logger.log('Created new podcast', PodcastsService.name);
        Logger.log(podcast, PodcastsService.name);
      } catch (error) {
        throw new MongoError(error);
      }
    }
    return podcast;
  }

  async findOrCreateByTitle(title: string): Promise<PodcastDocument> {
    let podcast: PodcastDocument | null = await this.podcastModel.findOne({
      title,
    });
    if (!podcast) {
      const { results } = await searchitunes({
        entity: 'podcast',
        term: title,
        limit: 1,
      });
      const podcastData = results[0];
      Logger.debug(podcastData, PodcastsService.name);
      if (title !== podcastData.collectionName) {
        Logger.warn(
          `Creating podcast without exact match on title;\n from share URL: ${title} and from iTunes: ${podcastData.collectionName}`,
          PodcastsService.name,
        );
      }
      const createdPodcast = new this.podcastModel(podcastData);

      try {
        podcast = await createdPodcast.save();
        Logger.log('Created new podcast', PodcastsService.name);
        Logger.log(podcast, PodcastsService.name);
      } catch (error) {
        throw new MongoError(error);
      }
    }
    return podcast;
  }

  async getPodcastByITunesId(iTunesID: number): Promise<PodcastDocument> {
    const podcast = await this.podcastModel.findOne({ iTunesID }).exec();
    const episodes = await this.episodesService.getAllEpisodesOfPodcast(
      podcast._id,
    );
    podcast.episodes = episodes;
    return podcast;
  }

  async getPodcastById(podcastId: ObjectId): Promise<PodcastDocument> {
    const podcast = await this.podcastModel.findById(podcastId).exec();
    const episodes = await this.episodesService.getAllEpisodesOfPodcast(
      podcast._id,
    );
    podcast.episodes = episodes;
    return podcast;
  }

  async getAllPodcasts(): Promise<PodcastDocument[]> {
    const podcasts = await this.podcastModel.find().exec();
    return podcasts;
  }

  async getCategory(category: string): Promise<PodcastDocument[]> {
    const podcasts = await this.podcastModel.find({ genres: category }).exec();
    return podcasts;
  }
}
