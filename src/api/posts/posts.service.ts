import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoError } from 'mongodb';
import { Model } from 'mongoose';
import * as uuid from 'uuid/v4';
import { InjectEventEmitter } from 'nest-emitter';
import { PostDocument } from './schemas/post.schema';
import { EpisodesService } from 'src/api/episodes/episodes.service';
import {
  CreatePostInput,
  UpdatePostInput,
  ObjectId,
} from 'src/graphql.classes';
import { EpisodeDocument } from 'src/api/episodes/schemas/episode.schema';
import { ObjectIdPair } from 'src/api/@types/declarations';
import { PostEventEmitter } from './posts.events';
import { PodcastDocument } from '../podcasts/schemas/podcast.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel('Post') private readonly postModel: Model<PostDocument>,
    private episodesService: EpisodesService,
    @InjectEventEmitter() private readonly emitter: PostEventEmitter,
  ) {}

  async create(createPostInput: CreatePostInput): Promise<PostDocument> {
    const createdPost = new this.postModel(createPostInput);
    const episode = await this.episodesService.findOrCreate(
      createPostInput.shareURL,
    );
    createdPost.episode = episode;
    createdPost.guid = uuid();

    const previousPosts = await this.getAllPostsByUser(createPostInput.byUser);

    if (this.isRepostOfEpisodeInTimeframe(previousPosts, episode)) {
      throw new Error(
        `You have posted ${episode.title} recently and can add it to your feed again next week.`,
      );
    }
    let post: PostDocument | undefined;
    try {
      post = await createdPost.save();
      Logger.log('Created new post:', PostsService.name);
      Logger.log(post, PostsService.name);
    } catch (error) {
      throw new MongoError(error);
    }
    this.emitter.emit('feedNeedsUpdate', {
      user: post.byUser,
      event: 'Create Post',
    });

    return post;
  }

  async update(
    { _id, byUser }: ObjectIdPair,
    fieldsToUpdate: UpdatePostInput & {
      [fieldName: string]: boolean | string;
    },
  ): Promise<PostDocument | undefined> {
    // Remove undefined keys for update
    const fields: {
      [fieldName: string]: boolean | string;
    } = {};
    for (const key in fieldsToUpdate) {
      if (typeof fieldsToUpdate[key] !== 'undefined' && key !== 'password') {
        fields[key] = fieldsToUpdate[key];
      }
    }
    let post: PostDocument | null = null;
    post = await this.postModel.findOneAndUpdate(
      { _id, byUser: byUser._id },
      fields,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!post) return undefined;

    this.emitter.emit('feedNeedsUpdate', {
      user: post.byUser,
      event: 'Update Post',
    });

    return post;
  }

  async delete({ _id, byUser }: ObjectIdPair): Promise<ObjectId> {
    const post = await this.postModel.findOneAndUpdate(
      {
        _id,
        byUser: byUser._id,
      },
      { enabled: false },
    );
    if (!post) return undefined;
    Logger.log(`Disabled post: ${_id}`, PostsService.name);

    this.emitter.emit('feedNeedsUpdate', {
      user: byUser,
      event: 'Delete Post',
    });

    return _id;
  }

  async getAllPostsByUser(byUser: ObjectId): Promise<PostDocument[]> {
    return await this.postModel.find({ byUser, enabled: true }, null, {
      sort: { createdAt: -1 },
    });
  }

  async getPost(postId: ObjectId): Promise<PostDocument | null> {
    return await this.postModel.findOne({ _id: postId, enabled: true });
  }

  private isRepostOfEpisodeInTimeframe(
    posts: PostDocument[],
    episode: EpisodeDocument,
    timeframe = 7 * 24 * 60 * 60 * 1000, // 7 day default
  ): boolean {
    for (const post of posts) {
      if (
        String(post.episode._id) === String(episode._id) &&
        Number(new Date()) - Number(post.createdAt) < timeframe
      ) {
        return true;
      }
    }
    return false;
  }

  async getMostPostedEpisodesInTimeframe(
    since: Date = new Date(2018, 0),
    maxEpisodes = 50,
  ): Promise<EpisodeDocument[]> {
    const postCounts = await this.postModel
      .aggregate([
        { $match: { enabled: true, createdAt: { $gte: since } } },
        { $sortByCount: '$episode' },
        { $limit: maxEpisodes },
        {
          $lookup: {
            from: 'episodes',
            localField: '_id',
            foreignField: '_id',
            as: 'episode',
          },
        },
        { $unwind: '$episode' },
        {
          $lookup: {
            from: 'podcasts',
            localField: 'episode.podcast',
            foreignField: '_id',
            as: 'episode.podcast',
          },
        },
        { $unwind: '$episode.podcast' },
      ])
      .exec()
      .catch(err => {
        throw err;
      });
    return postCounts.map(e => {
      e.episode.posts = e.count;
      return e.episode;
    });
  }

  async getMostPostedEpisodesInGenreInTimeframe(
    genre: string,
    since: Date = new Date(2018, 0),
    maxEpisodes = 50,
  ): Promise<EpisodeDocument[]> {
    const postCounts = await this.postModel
      .aggregate([
        { $match: { enabled: true, createdAt: { $gte: since } } },
        { $sortByCount: '$episode' },
        {
          $lookup: {
            from: 'episodes',
            localField: '_id',
            foreignField: '_id',
            as: 'episode',
          },
        },
        { $unwind: '$episode' },
        {
          $lookup: {
            from: 'podcasts',
            localField: 'episode.podcast',
            foreignField: '_id',
            as: 'episode.podcast',
          },
        },
        { $unwind: '$episode.podcast' },
        { $unwind: '$episode.podcast.genres' },
        // do a case insensitive search for genre
        {
          $match: {
            'episode.podcast.genres': { $regex: `^${genre}$`, $options: 'i' },
          },
        },
        { $limit: maxEpisodes },
      ])
      .exec()
      .catch(err => {
        throw err;
      });
    return postCounts.map(e => {
      e.episode.posts = e.count;
      return e.episode;
    });
  }

  async getMostPostedPodcastsInTimeframe(
    since: Date = new Date(2018, 0),
    maxPodcasts = 50,
  ): Promise<PodcastDocument[]> {
    const postCounts = await this.postModel
      .aggregate([
        { $match: { enabled: true, createdAt: { $gte: since } } },
        {
          $lookup: {
            from: 'episodes',
            localField: 'episode',
            foreignField: '_id',
            as: 'episode',
          },
        },
        { $unwind: '$episode' },
        {
          $lookup: {
            from: 'podcasts',
            localField: 'episode.podcast',
            foreignField: '_id',
            as: 'episode.podcast',
          },
        },
        { $unwind: '$episode.podcast' },
        { $sortByCount: '$episode.podcast' },
        { $limit: maxPodcasts },
      ])
      .exec()
      .catch(err => {
        throw err;
      });
    return postCounts.map(p => {
      p._id.posts = p.count;
      return p._id;
    });
  }
}
