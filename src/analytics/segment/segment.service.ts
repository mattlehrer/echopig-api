import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { InjectEventEmitter } from 'nest-emitter';
import Analytics = require('analytics-node');
import { PostEventEmitter } from 'src/api/posts/posts.events';
import { UserEventEmitter } from 'src/api/users/users.events';
import { UserDocument } from 'src/api/users/schemas/user.schema';

@Injectable()
export class SegmentService implements OnModuleInit {
  analytics: Analytics;

  constructor(
    private configService: ConfigService,
    @InjectEventEmitter() private readonly postEventEmitter: PostEventEmitter,
    @InjectEventEmitter() private readonly userEventEmitter: UserEventEmitter,
  ) {}
  onModuleInit() {
    this.analytics = new Analytics(this.configService.segmentKey);
    this.postEventEmitter.on('feedNeedsUpdate', async ({ user, event }) => {
      Logger.debug(
        `Analytics event! Update feed for ${user.username}`,
        SegmentService.name,
      );
      await this.track(user, event);
    });
    this.userEventEmitter.on('newUser', async (user: UserDocument) => {
      Logger.debug(
        `Analytics event! New user ${user.username}`,
        SegmentService.name,
      );
      await this.identify(user);
    });
    this.userEventEmitter.on('updatedUser', async (user: UserDocument) => {
      Logger.debug(
        `Analytics event! Updated user ${user.username}`,
        SegmentService.name,
      );
      await this.identify(user);
    });
  }

  async identify(user: UserDocument) {
    this.analytics.identify({
      userId: user.id,
      traits: {
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  }

  async track(user: UserDocument, event: string) {
    this.analytics.track({
      userId: user.id,
      event,
    });
  }
}
