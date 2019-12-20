// import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
// import { UserInputError, ValidationError } from 'apollo-server-core';
import { EpisodesService } from './episodes.service';
import { ObjectId } from '../../graphql.classes';
import { EpisodeDocument } from './schemas/episode.schema';

@Resolver('Episode')
export class EpisodeResolver {
  constructor(private episodesService: EpisodesService) {}

  @Query('episodes')
  async getEpisodes(
    @Args('podcast') podcast: ObjectId,
  ): Promise<EpisodeDocument[]> {
    return await this.episodesService.getAllEpisodesOfPodcast(podcast);
  }

  @Query('episode')
  async getPost(
    @Args('episode') episodeId: ObjectId,
  ): Promise<EpisodeDocument> {
    return await this.episodesService.getEpisode(episodeId);
  }
}
