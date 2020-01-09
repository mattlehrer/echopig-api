import { Injectable, OnModuleInit } from '@nestjs/common';
import * as stream from 'getstream';
// import { InjectEventEmitter } from 'nest-emitter';
// import { PostEventEmitter } from 'src/api/posts/posts.events';
// import { UserEventEmitter } from 'src/api/users/users.events';
import { ConfigService } from 'src/config/config.service';
// import { UserDocument } from 'src/api/users/schemas/user.schema';

@Injectable()
export class StreamService implements OnModuleInit {
  client;

  constructor(
    private configService: ConfigService, // @InjectEventEmitter() private readonly postEventEmitter: PostEventEmitter, // @InjectEventEmitter() private readonly userEventEmitter: UserEventEmitter,
  ) {}
  onModuleInit() {
    // Instantiate a new client (server side)
    this.client = stream.connect(
      this.configService.streamKey,
      this.configService.streamSecret,
      this.configService.streamAppId,
    );
    // this.postEventEmitter.on('feedNeedsUpdate', async ({ user }) => {
    //   Logger.debug(
    //     `Stream event! Update feed for ${user.username}`,
    //     StreamService.name,
    //   );
    //   await this.updateAndCacheFeed({ user });
    //   // @TODO: implement Saves
    //   // await this.updateAndCacheFeed({ userId, publicFeed = false });
    // });
  }

  // async newUser(user: UserDocument) {
  //   this.client.
  // }
}
