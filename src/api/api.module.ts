import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { EpisodesModule } from './episodes/episodes.module';
import { PodcastsModule } from './podcasts/podcasts.module';
import { RssModule } from './rss/rss.module';
import { FollowsModule } from './follows/follows.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    PostsModule,
    EpisodesModule,
    PodcastsModule,
    RssModule,
    FollowsModule,
  ],
  providers: [],
})
export class ApiModule {}
