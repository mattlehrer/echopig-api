// import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
// import { UserInputError, ValidationError } from 'apollo-server-core';
import { EpisodesService } from './episodes.service';
import { ObjectId } from 'src/graphql.classes';
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
  async getEpisode(
    @Args('episodeId') episodeId: ObjectId,
  ): Promise<EpisodeDocument> {
    const episode = await this.episodesService.getEpisode(episodeId);
    if (!episode) throw new Error('Episode does not exist');
    return episode;
  }
}
