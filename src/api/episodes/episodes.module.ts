import { Module } from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EpisodeSchema } from './schemas/episode.schema';
import { EpisodeResolver } from './episodes.resolvers';
import { DateScalar } from '../scalars/date.scalar';
import { ObjectIdScalar } from '../scalars/object-id.scalar';
import { ShareurlModule } from './shareurl/shareurl.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Episode', schema: EpisodeSchema }]),
    ShareurlModule,
    // ConfigModule,
  ],
  providers: [EpisodesService, EpisodeResolver, DateScalar, ObjectIdScalar],
  exports: [EpisodesService],
})
export class EpisodesModule {}
