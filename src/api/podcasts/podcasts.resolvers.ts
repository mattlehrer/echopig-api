import { Args, Query, Resolver } from '@nestjs/graphql';
import { PodcastsService } from './podcasts.service';
import { PodcastDocument } from './schemas/podcast.schema';
import { ObjectId } from 'src/graphql.classes';

@Resolver('Podcast')
export class PodcastResolver {
  constructor(private podcastsService: PodcastsService) {}

  @Query('podcasts')
  async getPodcasts(): Promise<PodcastDocument[]> {
    return await this.podcastsService.getAllPodcasts();
  }

  @Query('podcast')
  async getPodcast(
    @Args('iTunesId') iTunesId: ObjectId,
  ): Promise<PodcastDocument> {
    return await this.podcastsService.getPodcastByITunesId(iTunesId);
  }

  @Query('podcastById')
  async getPodcastById(
    @Args('podcastId') podcastId: ObjectId,
  ): Promise<PodcastDocument> {
    return await this.podcastsService.getPodcastById(podcastId);
  }

  @Query('genre')
  async getCategory(@Args('genre') genre: string): Promise<PodcastDocument[]> {
    const podcasts = await this.podcastsService.getCategory(genre);
    if (!podcasts) throw new Error('Genre has no podcasts');
    return podcasts;
  }
}
