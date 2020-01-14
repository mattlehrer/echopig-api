import { Args, Query, Resolver } from '@nestjs/graphql';
import { PodcastsService } from './podcasts.service';
import { PodcastDocument } from './schemas/podcast.schema';

@Resolver('Podcast')
export class PodcastResolver {
  constructor(private podcastsService: PodcastsService) {}

  @Query('podcasts')
  async getPodcasts(): Promise<PodcastDocument[]> {
    return await this.podcastsService.getAllPodcasts();
  }

  @Query('genre')
  async getCategory(@Args('genre') genre: string): Promise<PodcastDocument[]> {
    const podcasts = await this.podcastsService.getCategory(genre);
    if (!podcasts) throw new Error('Genre has no podcasts');
    return podcasts;
  }
}
