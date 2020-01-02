import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { UserResolver } from './users.resolvers';
import { DateScalar } from 'src/api/scalars/date.scalar';
import { ConfigModule } from 'src/config/config.module';
import { AuthModule } from 'src/api/auth/auth.module';
import { ObjectIdScalar } from 'src/api/scalars/object-id.scalar';
import { NestEmitterModule } from 'nest-emitter';
import { EventEmitter } from 'events';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    ConfigModule,
    forwardRef(() => AuthModule),
    NestEmitterModule.forRoot(new EventEmitter()),
  ],
  exports: [UsersService],
  controllers: [],
  providers: [UsersService, UserResolver, DateScalar, ObjectIdScalar],
})
export class UsersModule {}
