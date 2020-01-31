import { Module } from '@nestjs/common';
import { RssService } from './rss.service';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [UsersModule, PostsModule, ConfigModule],
  providers: [RssService],
})
export class RssModule {}
