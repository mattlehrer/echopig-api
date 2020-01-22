import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PodcastsService } from './podcasts.service';
import { PodcastSchema } from './schemas/podcast.schema';
import { PodcastResolver } from './podcasts.resolvers';
import { EpisodesModule } from '../episodes/episodes.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Podcast', schema: PodcastSchema }]),
    forwardRef(() => EpisodesModule),
    // ConfigModule,
  ],
  providers: [PodcastsService, PodcastResolver],
  exports: [PodcastsService],
})
export class PodcastsModule {}
