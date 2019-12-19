import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PodcastsService } from './podcasts.service';
import { PodcastSchema } from './schemas/podcast.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Podcast', schema: PodcastSchema }]),
    // ConfigModule,
  ],
  providers: [PodcastsService],
  exports: [PodcastsService],
})
export class PodcastsModule {}
