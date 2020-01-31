import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { UserResolver } from './users.resolvers';
import { DateScalar } from 'src/api/scalars/date.scalar';
import { ConfigModule } from 'src/config/config.module';
import { AuthModule } from 'src/api/auth/auth.module';
import { ObjectIdScalar } from 'src/api/scalars/object-id.scalar';
import { EmailModule } from 'src/utils/email/email.module';
import { PasswordResetTokenSchema } from './schemas/password-reset-token.schema';
import { SignUpTokenSchema } from './schemas/signup-token.schema';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'PasswordResetToken', schema: PasswordResetTokenSchema },
      { name: 'SignUpToken', schema: SignUpTokenSchema },
    ]),
    ConfigModule,
    forwardRef(() => AuthModule),
    forwardRef(() => PostsModule),
    EmailModule,
  ],
  exports: [UsersService],
  controllers: [],
  providers: [UsersService, UserResolver, DateScalar, ObjectIdScalar],
})
export class UsersModule {}
