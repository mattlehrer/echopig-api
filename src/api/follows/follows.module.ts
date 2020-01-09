import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowsService } from './follows.service';
import { FollowSchema } from './schemas/follow.schema';
import { FollowResolver } from './follows.resolvers';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Follow', schema: FollowSchema }]),
  ],
  providers: [FollowsService, FollowResolver],
})
export class FollowsModule {}
