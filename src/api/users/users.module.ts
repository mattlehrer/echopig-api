import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { UserResolver } from './users.resolvers';
import { DateScalar } from 'src/api/scalars/date.scalar';
import { ConfigModule } from 'src/config/config.module';
import { AuthModule } from 'src/api/auth/auth.module';
import { ObjectIdScalar } from 'src/api/scalars/object-id.scalar';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    ConfigModule,
    forwardRef(() => AuthModule),
  ],
  exports: [UsersService],
  controllers: [],
  providers: [UsersService, UserResolver, DateScalar, ObjectIdScalar],
})
export class UsersModule {}
