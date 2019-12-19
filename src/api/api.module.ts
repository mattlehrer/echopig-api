import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { EpisodesModule } from './episodes/episodes.module';
import { PodcastsModule } from './podcasts/podcasts.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    PostsModule,
    EpisodesModule,
    PodcastsModule,
  ],
  providers: [],
})
export class ApiModule {}
