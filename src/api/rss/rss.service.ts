import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as Podcast from 'podcast';
// import * as AWS from 'aws-sdk';
import { writeFileSync } from 'fs';
import { PostDocument } from '../posts/schemas/post.schema';
import { ObjectId } from 'src/graphql.classes';
import { UsersService } from '../users/users.service';
import { PostsService } from '../posts/posts.service';
// import { ConfigService } from 'src/config/config.service';
import { UserDocument } from '../users/schemas/user.schema';
import { InjectEventEmitter } from 'nest-emitter';
import { PostEventEmitter } from 'src/api/posts/posts.events';
import { UserEventEmitter } from 'src/api/users/users.events';

@Injectable()
export class RssService implements OnModuleInit {
  constructor(
    // private configService: ConfigService,
    private usersService: UsersService,
    private postsService: PostsService,
    @InjectEventEmitter() private readonly postEventEmitter: PostEventEmitter,
    @InjectEventEmitter() private readonly userEventEmitter: UserEventEmitter,
  ) {}
  onModuleInit() {
    this.postEventEmitter.on('feedNeedsUpdate', async userId => {
      Logger.debug(`Posts event! Update feed for ${userId}`, RssService.name);
      await this.updateAndCacheFeed({ userId });
      // @TODO: implement Saves
      // await this.updateAndCacheFeed({ userId, publicFeed = false });
    });
    this.userEventEmitter.on('newUser', async userId => {
      Logger.debug(`User event! New user ${userId}`, RssService.name);
      await this.updateAndCacheFeed({ userId });
      // @TODO: implement Saves
      // await this.updateAndCacheFeed({ userId, publicFeed = false });
    });
  }

  async generateFeed({
    user,
    publicFeed = true,
  }: {
    user: UserDocument;
    publicFeed?: boolean;
  }): Promise<string> {
    let items: PostDocument[];
    if (publicFeed) {
      items = await this.postsService.getAllPostsByUser(user._id);
    } else {
      // @TODO: implement Saves
      // feedItems = await this.postsService.getAllSavesByUser(userId);
    }
    // create an rss feed
    // documentation: https://www.npmjs.com/package/podcast
    const feed = new Podcast({
      title: publicFeed
        ? `${user.username}'s Favorites`
        : `${user.username}'s Saved Episodes`,
      itunesSummary: publicFeed
        ? `${user.username}'s feed of favorite podcast episodes. Powered by Echopig`
        : `Powered by Echopig`,
      description: publicFeed
        ? `${user.username}'s feed of favorite podcast episodes. Powered by Echopig`
        : '',
      itunesSubtitle: publicFeed
        ? 'Create your own feed at https://www.echopig.com'
        : '',
      itunesAuthor: user.username,
      feedUrl: publicFeed
        ? `https://www.echopig.com/rss/${user.username}`
        : `https://www.echopig.com/saved/${user.saveForLaterId}`,
      siteUrl: `https://www.echopig.com/u/${user.username}`,
      generator: 'Echopig.com',
      imageUrl: 'https://www.echopig.com/images/logo.png',
      itunesImage: 'https://www.echopig.com/images/logo1500.png',
      // docs: @TODO: 'https://www.echopig.com/rssDocs.html',
      author: user.name || user.username,
      language: 'en',
      // categories: ['Personal Journals'],
      // itunesCategory: ['Personal Journals'],
      pubDate: items.length > 0 ? items[0].updatedAt : user.updatedAt,
      ttl: 60,
      // itunesOwner: {
      //   name: user.name || user.username,
      //   email: 'rss@echopig.com',
      // },
      itunesExplicit: user.explicit,
    });
    items.forEach(item => {
      if (item.episode) {
        feed.addItem({
          title: `${item.episode.title} - ${item.episode.podcast.title}`,
          description: item.episode.description,
          url: `https://www.echopig.com/e/${item.episode.id}`,
          guid: item.guid,
          categories: item.episode.podcast.genres
            ? item.episode.podcast.genres
            : [],
          author: item.episode.podcast.author
            ? item.episode.podcast.author
            : '',
          enclosure: { url: item.episode.mp3URL },
          date: item.updatedAt,
          itunesAuthor: item.episode.podcast.author
            ? item.episode.podcast.author
            : '',
          itunesExplicit: item.episode.podcast.collectionExplicitness
            ? item.episode.podcast.collectionExplicitness
            : false,
          itunesSubtitle: item.comment ? item.comment : '',
          itunesDuration: item.episode.duration ? item.episode.duration : null,
        });
      }
    });
    // if we don't have any feed items,
    // we might not be able to add the feed to some podcast players
    if (!items.length) {
      feed.addItem({
        title: 'Coming soon!',
        description: `${user.username} is just getting started on Echopig and will post episodes soon.`,
        url: `https://www.echopig.com/`,
        enclosure: { url: `https://www.echopig.com/assets/comingsoon.mp3` },
        date: user.updatedAt,
      });
    }

    return feed.buildXml();
  }

  async updateAndCacheFeed({
    userId,
    publicFeed = true,
  }: {
    userId: ObjectId;
    publicFeed?: boolean;
  }): Promise<string> {
    const user = await this.usersService.findOneById(userId);
    const xml = await this.generateFeed({ user, publicFeed });

    Logger.debug('writing file', RssService.name);
    writeFileSync(`feed-${userId}.rss`, xml);
    return `feed-${userId}.rss`;

    // AWS.config.update({
    //   secretAccessKey: this.configService.awsSecretAccessKey,
    //   accessKeyId: this.configService.awsAccessKeyId,
    //   region: 'us-east-1',
    //   signatureVersion: 'v4', //API version
    // });
    // const s3 = new AWS.S3({
    //   apiVersion: '2006-03-01',
    // });
    // let data: AWS.S3.ManagedUpload.SendData;
    // try {
    //   data = await s3
    //     .upload({
    //       ACL: 'public-read',
    //       Bucket: 'rss',
    //       Key: user.normalizedUsername,
    //       Body: xml,
    //       ContentType: 'application/rss+xml',
    //     })
    //     .promise();
    // } catch (e) {
    //   throw e;
    // }
    // return data.Location;
  }
}
