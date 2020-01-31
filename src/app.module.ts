import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { join } from 'path';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { NestEmitterModule } from 'nest-emitter';
import { EventEmitter } from 'events';
// import { AppService } from './app.service';
// import { AppController } from './app.controller';
import { UtilsModule } from './utils/utils.module';
import { EmailModule } from './utils/email/email.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const options: MongooseModuleOptions = {
          uri: configService.mongoUri,
          useNewUrlParser: true,
          useCreateIndex: true,
          useUnifiedTopology: true,
          useFindAndModify: false,
        };

        if (configService.mongoAuthEnabled) {
          options.user = configService.mongoUser;
          options.pass = configService.mongoPassword;
        }

        return options;
      },
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
      installSubscriptionHandlers: true,
      context: ({ req }) => ({ req }),
      definitions: {
        path: join(process.cwd(), 'src/graphql.classes.ts'),
        outputAs: 'class',
      },
    }),
    ConfigModule,
    ApiModule,
    NestEmitterModule.forRoot(new EventEmitter()),
    UtilsModule,
    EmailModule,
    AnalyticsModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
