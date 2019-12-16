import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoError } from 'mongodb';
import { Model } from 'mongoose';
import { PostDocument } from './schemas/post.schema';
import { UsersService } from '../users/users.service';
import {
  CreatePostInput,
  // UpdatePostInput,
  ObjectId,
} from '../../graphql.classes';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel('Post') private readonly postModel: Model<PostDocument>,
    private usersService: UsersService,
  ) {}

  async create(createPostInput: CreatePostInput): Promise<PostDocument> {
    const createdPost = new this.postModel(createPostInput);
    const userCreatingPost = await this.usersService.findOneById(
      createPostInput.byUser,
    );

    let post: PostDocument | undefined;
    try {
      post = await createdPost.save();
      userCreatingPost.posts.push(post._id);
      await userCreatingPost.save();
    } catch (error) {
      throw this.evaluateMongoError(error);
      // throw this.evaluateMongoError(error, postData);
    }
    return post;
  }

  async getAllPostsByUser(byUser: ObjectId): Promise<PostDocument[]> {
    return await this.postModel.find({ byUser });
  }

  async getPost(postId: ObjectId): Promise<PostDocument> {
    return await this.postModel.findById(postId);
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
