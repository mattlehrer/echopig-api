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
import { MailPostController } from './mailpost/mailpost.controller';
import { MailpostService } from './mailpost/mailpost.service';
import { EmailModule } from 'src/utils/email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Post', schema: PostSchema }]),
    UsersModule,
    EpisodesModule,
    EmailModule,
    // ConfigModule,
  ],
  exports: [PostsService],
  controllers: [MailPostController],
  providers: [
    PostsService,
    PostResolver,
    DateScalar,
    ObjectIdScalar,
    MailpostService,
  ],
})
export class PostsModule {}
