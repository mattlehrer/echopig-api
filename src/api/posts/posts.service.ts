import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoError } from 'mongodb';
import { Model, Query } from 'mongoose';
import * as uuid from 'uuid/v4';
import { PostDocument } from './schemas/post.schema';
import { UsersService } from '../users/users.service';
import { EpisodesService } from '../episodes/episodes.service';
import {
  CreatePostInput,
  UpdatePostInput,
  ObjectId,
} from '../../graphql.classes';
import { UserDocument } from '../users/schemas/user.schema';
import { EpisodeDocument } from '../episodes/schemas/episode.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel('Post') private readonly postModel: Model<PostDocument>,
    private usersService: UsersService,
    private episodesService: EpisodesService,
  ) {}

  async create(createPostInput: CreatePostInput): Promise<PostDocument> {
    const createdPost = new this.postModel(createPostInput);
    const episode = await this.episodesService.findOrCreate(
      createPostInput.shareURL,
    );
    createdPost.episode = episode;
    createdPost.guid = uuid();

    const userCreatingPost = await this.usersService.findOneByIdAndPopulatePosts(
      createPostInput.byUser,
    );

    if (this.isRepostOfEpisodeByUserInTimeframe(userCreatingPost, episode)) {
      throw new Error('User has previously posted this episode');
    }
    let post: PostDocument | undefined;
    try {
      post = await createdPost.save();
      userCreatingPost.posts.push(post._id);
      await userCreatingPost.save();
      episode.posts.push(post._id);
      await episode.save();
      Logger.log('Created new post:');
      Logger.log(post);
    } catch (error) {
      throw this.evaluateMongoError(error);
      // throw this.evaluateMongoError(error, postData);
    }
    return post;
  }

  async update(
    { _id, byUser },
    fieldsToUpdate: UpdatePostInput,
  ): Promise<PostDocument> {
    // Remove undefined keys for update
    const fields: any = {};
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

  async delete({ _id, byUser }): Promise<ObjectId> {
    const { deletedCount } = await this.postModel.deleteOne({ _id, byUser });
    if (!deletedCount) return undefined;
    Logger.log(`Deleted post: ${_id}`);

    const user = await this.usersService.removePostByUser(_id, byUser);
    if (!user) Logger.error(`Did not delete post ${_id} from any user.`);
    const episode = await this.episodesService.removePostOfEpisode(_id);
    if (!episode) Logger.error(`Did not delete post ${_id} from any episode.`);
    return _id;
  }

  async getAllPostsByUser(byUser: ObjectId): Promise<PostDocument[]> {
    return await this.postModel.find({ byUser });
  }

  async getPost(postId: ObjectId): Promise<PostDocument> {
    return await this.postModel.findById(postId);
  }

  private isRepostOfEpisodeByUserInTimeframe(
    user: UserDocument,
    episode: EpisodeDocument,
    timeframe = 7 * 24 * 60 * 60 * 1000,
  ): boolean {
    for (const post of user.posts) {
      if (
        String(post.episode._id) === String(episode._id) &&
        Number(new Date()) - Number(post.createdAt) < timeframe
      ) {
        return true;
      }
    }
    return false;
  }

  private evaluateMongoError(
    error: MongoError,
    // createPostInput: CreatePostInput,
  ): Error {
    // if (error.code === 11000) {
    //   if (
    //     error.message
    //       .toLowerCase()
    //       .includes(normalizeEmail(createPostInput.email))
    //   ) {
    //     throw new Error(
    //       `e-mail ${createPostInput.email} is already registered`,
    //     );
    //   }
    // }
    throw new Error(error.message);
  }
}
