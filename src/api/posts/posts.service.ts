import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoError } from 'mongodb';
import { Model } from 'mongoose';
import * as uuid from 'uuid/v4';
import { PostDocument } from './schemas/post.schema';
import { EpisodesService } from 'src/api/episodes/episodes.service';
import {
  CreatePostInput,
  UpdatePostInput,
  ObjectId,
} from 'src/graphql.classes';
import { EpisodeDocument } from 'src/api/episodes/schemas/episode.schema';
import { ObjectIdPair } from 'src/api/@types/declarations';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel('Post') private readonly postModel: Model<PostDocument>,
    private episodesService: EpisodesService,
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
      Logger.log('Created new post:');
      Logger.log(post);
    } catch (error) {
      throw new MongoError(error);
    }
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
    post = await this.postModel.findOneAndUpdate({ _id, byUser }, fields, {
      new: true,
      runValidators: true,
    });

    if (!post) return undefined;

    return post;
  }

  async delete({ _id, byUser }: ObjectIdPair): Promise<ObjectId> {
    const { deletedCount } = await this.postModel.deleteOne({ _id, byUser });
    if (!deletedCount) return undefined;
    Logger.log(`Deleted post: ${_id}`);

    // const user = await this.usersService.removePostByUser(_id, byUser);
    // if (!user) Logger.error(`Did not delete post ${_id} from any user.`);
    // const episode = await this.episodesService.removePostOfEpisode(_id);
    // if (!episode) Logger.error(`Did not delete post ${_id} from any episode.`);
    return _id;
  }

  async getAllPostsByUser(byUser: ObjectId): Promise<PostDocument[]> {
    return await this.postModel.find({ byUser });
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
