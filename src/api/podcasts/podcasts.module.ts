import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PodcastsService } from './podcasts.service';
import { PodcastSchema } from './schemas/podcast.schema';
import { PodcastResolver } from './podcasts.resolvers';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Podcast', schema: PodcastSchema }]),
    // ConfigModule,
  ],
  providers: [PodcastsService, PodcastResolver],
  exports: [PodcastsService],
})
export class PodcastsModule {}
