import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { PostSchema } from './schemas/post.schema';
import { PostResolver } from './posts.resolvers';
import { DateScalar } from 'src/api/scalars/date.scalar';
import { ObjectIdScalar } from 'src/api/scalars/object-id.scalar';
import { UsersModule } from 'src/api/users/users.module';
import { EpisodesModule } from 'src/api/episodes/episodes.module';
// import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Post', schema: PostSchema }]),
    UsersModule,
    EpisodesModule,
    // ConfigModule,
  ],
  exports: [PostsService],
  controllers: [],
  providers: [PostsService, PostResolver, DateScalar, ObjectIdScalar],
})
export class PostsModule {}
