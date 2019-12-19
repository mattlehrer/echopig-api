import { UseGuards, Logger } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserInputError, ValidationError } from 'apollo-server-core';
import { PostsService } from './posts.service';
import {
  CreatePostInput,
  Post,
  // UpdatePostInput,
  ObjectId,
  User,
} from '../../graphql.classes';
import { PostDocument } from './schemas/post.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user';

@Resolver('Post')
export class PostResolver {
  constructor(private postsService: PostsService) {}

  @Query('posts')
  async getPosts(@Args('byUser') byUser: ObjectId): Promise<PostDocument[]> {
    return await this.postsService.getAllPostsByUser(byUser);
  }

  @Query('post')
  async getPost(@Args('post') post: ObjectId): Promise<PostDocument> {
    return await this.postsService.getPost(post);
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
        byUser: user._id,
        enabled: true,
        ...createPostInput,
      });
    } catch (error) {
      throw new UserInputError(error.message);
    }
    return createdPost;
  }

  /*
  @Mutation('updatePost')
  // @AdminAllowedArgs(
  //   'username',
  //   'fieldsToUpdate.username',
  //   'fieldsToUpdate.email',
  //   'fieldsToUpdate.enabled',
  // )
  @UseGuards(JwtAuthGuard, UsernameEmailAdminGuard)
  async updateUser(
    @Args('postId') postId: string,
    @Args('fieldsToUpdate') fieldsToUpdate: UpdatePostInput,
    @Context('req') request: any,
  ): Promise<Post> {
    let post: PostDocument | undefined;
    try {
      post = await this.postsService.update(postId, fieldsToUpdate);
    } catch (error) {
      throw new ValidationError(error.message);
    }
    if (!post) throw new UserInputError('The post does not exist');
    return post;
  }
  */
}
