import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { PostSchema } from './schemas/post.schema';
import { PostResolver } from './posts.resolvers';
import { DateScalar } from '../scalars/date.scalar';
import { ObjectIdScalar } from '../scalars/object-id.scalar';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Post', schema: PostSchema }]),
    UsersModule,
    // ConfigModule,
  ],
  exports: [PostsService],
  controllers: [],
  providers: [PostsService, PostResolver, DateScalar, ObjectIdScalar],
})
export class PostsModule {}
