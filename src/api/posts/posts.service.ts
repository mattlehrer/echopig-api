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
      throw new Error('User has previously posted this episode');
    }
    let post: PostDocument | undefined;
    try {
      post = await createdPost.save();
      Logger.log('Created new post:', PostsService.name);
      Logger.log(post, PostsService.name);
    } catch (error) {
      throw new MongoError(error);
    }
    Logger.debug(
      `emitting feedNeedsUpdate from PostsService.create for ${post.byUser}`,
      PostsService.name,
    );
    Logger.debug(post.byUser);
    this.emitter.emit('feedNeedsUpdate', post.byUser);

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

    this.emitter.emit('feedNeedsUpdate', post.byUser);

    return post;
  }

  async delete({ _id, byUser }: ObjectIdPair): Promise<ObjectId> {
    const { deletedCount } = await this.postModel.deleteOne({
      _id,
      byUser: byUser._id,
    });
    if (!deletedCount) return undefined;
    Logger.log(`Deleted post: ${_id}`, PostsService.name);

    Logger.debug(
      'emitting feedNeedsUpdate from PostsService.delete',
      PostsService.name,
    );
    this.emitter.emit('feedNeedsUpdate', byUser);

    return _id;
  }

  async getAllPostsByUser(byUser: ObjectId): Promise<PostDocument[]> {
    return await this.postModel.find({ byUser }, null, {
      sort: { updatedAt: -1 },
    });
  }

  async getPost(postId: ObjectId): Promise<PostDocument | null> {
    return await this.postModel.findById(postId);
  }

  private isRepostOfEpisodeInTimeframe(
    posts: PostDocument[],
    episode: EpisodeDocument,
    timeframe = 7 * 24 * 60 * 60 * 1000,
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
}
