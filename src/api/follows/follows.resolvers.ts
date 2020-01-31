import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import { FollowsService } from './follows.service';
import { UserInputError } from 'apollo-server-core';
import { ObjectId, Follow } from 'src/graphql.classes';
import { FollowDocument } from './schemas/follow.schema';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user';
import { UserDocument } from '../users/schemas/user.schema';

@Resolver('Follow')
export class FollowResolver {
  constructor(private followsService: FollowsService) {}

  @Query('follows')
  async getFollows(@Args('user') userId: ObjectId): Promise<FollowDocument[]> {
    return await this.followsService.getAllFollowsOfUser(userId);
  }

  @Mutation('createFollow')
  @UseGuards(JwtAuthGuard)
  async createFollow(
    @Args('target') target: ObjectId,
    @CurrentUser() user: UserDocument,
  ): Promise<Follow> {
    let createdFollow: Follow | undefined;
    try {
      createdFollow = await this.followsService.findOrCreate(user, target);
    } catch (error) {
      throw new UserInputError(error.message);
    }
    Logger.debug(createdFollow);
    return createdFollow;
  }
}
