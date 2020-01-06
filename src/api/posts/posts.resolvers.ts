import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserInputError, ValidationError } from 'apollo-server-core';
import { PostsService } from './posts.service';
import {
  CreatePostInput,
  UpdatePostInput,
  Post,
  User,
  ObjectId,
} from 'src/graphql.classes';
import { PostDocument } from './schemas/post.schema';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/api/decorators/current-user';

@Resolver('Post')
export class PostResolver {
  constructor(private postsService: PostsService) {}

  @Query('posts')
  async getPosts(@Args('byUser') byUser: ObjectId): Promise<PostDocument[]> {
    return await this.postsService.getAllPostsByUser(byUser);
  }

  @Query('post')
  async getPost(
    @Args('post') postId: ObjectId,
  ): Promise<PostDocument | undefined> {
    const post = await this.postsService.getPost(postId);
    if (!post) return undefined;
    return post;
  }

  @Mutation('createPost')
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @CurrentUser() user: User,
  ): Promise<Post> {
    let createdPost: Post | undefined;
    try {
      createdPost = await this.postsService.create({
        ...createPostInput,
        byUser: user,
        enabled: true,
      });
    } catch (error) {
      throw new UserInputError(error.message);
    }
    return createdPost;
  }

  @Mutation('updatePost')
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Args('postId') postId: string,
    @Args('fieldsToUpdate')
    fieldsToUpdate: UpdatePostInput & {
      [fieldName: string]: boolean | string;
    },
    @CurrentUser() user: User,
  ): Promise<Post> {
    let post: PostDocument | undefined;
    try {
      post = await this.postsService.update(
        { _id: postId, byUser: user },
        fieldsToUpdate,
      );
    } catch (error) {
      throw new ValidationError(error.message);
    }
    if (!post) throw new UserInputError('The post does not exist');
    return post;
  }

  @Mutation('deletePost')
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @Args('postId') postId: string,
    @CurrentUser() user: User,
  ): Promise<Post> {
    let post: ObjectId | undefined;
    try {
      post = await this.postsService.delete({ _id: postId, byUser: user });
    } catch (error) {
      throw new ValidationError(error.message);
    }
    if (!post) throw new UserInputError('The post does not exist');
    return post;
  }
}
