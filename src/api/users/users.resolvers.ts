import { UseGuards, Logger } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Context } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import {
  CreateUserInput,
  CreateSocialUserInput,
  User,
  UpdateUserInput,
  UpdatePasswordInput,
  ObjectId,
  LoginResult,
} from 'src/graphql.classes';
import { UsernameEmailAdminGuard } from 'src/api/auth/guards/username-email-admin.guard';
import { AdminGuard } from 'src/api/auth/guards/admin.guard';
import { UserInputError, ValidationError } from 'apollo-server-core';
import { UserDocument } from './schemas/user.schema';
import { AdminAllowedArgs } from 'src/api/decorators/admin-allowed-args';
import { RequestWithUser } from 'src/api/@types/declarations';

@Resolver('User')
export class UserResolver {
  constructor(private usersService: UsersService) {}

  @Query('users')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async users(): Promise<UserDocument[]> {
    return await this.usersService.getAllUsers();
  }

  @Query('me')
  @UseGuards(JwtAuthGuard, UsernameEmailAdminGuard)
  async me(
    @Args('username') username?: string,
    @Args('email') email?: string,
    @Args('userId') userId?: ObjectId,
  ): Promise<User> {
    let user: User | undefined;
    if (username) {
      user = await this.usersService.findOneByUsername(username);
    } else if (email) {
      user = await this.usersService.findOneByEmail(email);
    } else if (email) {
      user = await this.usersService.findOneById(userId);
    } else {
      // Is this the best exception for a graphQL error?
      throw new ValidationError('A username or email must be included');
    }

    if (user) return user;
    throw new UserInputError('The user does not exist');
  }

  @Query('user')
  async user(@Args('username') username: string): Promise<User> {
    let user: User | undefined;
    if (username) {
      user = await this.usersService.getProfile(username);
    } else {
      // Is this the best exception for a graphQL error?
      throw new ValidationError('A username must be included');
    }

    if (user) return user;
    throw new UserInputError('The user does not exist');
  }

  // A NotFoundException is intentionally not sent so bots can't search for emails
  @Query('forgotPassword')
  async forgotPassword(@Args('email') email: string): Promise<void> {
    const worked = await this.usersService.forgotPassword(email);
    Logger.debug(worked, UsersService.name);
  }

  // What went wrong is intentionally not sent (wrong username or code or user not in reset status)
  @Mutation('resetPassword')
  async resetPassword(
    @Args('username') username: string,
    @Args('code') code: string,
    @Args('password') password: string,
  ): Promise<User> {
    const user = await this.usersService.resetPassword(
      username,
      code,
      password,
    );
    if (!user) throw new UserInputError('The password was not reset');
    return user;
  }

  @Mutation('createUser')
  async createUser(
    @Args('createUserInput')
    createUserInput: CreateUserInput,
  ): Promise<User> {
    let createdUser: User | undefined;
    try {
      createdUser = await this.usersService.create(createUserInput);
    } catch (error) {
      throw new UserInputError(error.message);
    }
    return createdUser;
  }

  @Mutation('createSocialUser')
  async createSocialUser(
    @Args('createSocialUserInput')
    createSocialUserInput: CreateSocialUserInput,
  ): Promise<LoginResult> {
    let result: LoginResult | undefined;
    try {
      result = await this.usersService.createSocialUserAndLogin(
        createSocialUserInput,
      );
    } catch (error) {
      throw new UserInputError(error.message);
    }
    return result;
  }

  @Mutation('resendConfirmEmail')
  async resendConfirmEmail(@Args('email') email: string): Promise<User> {
    let existingUser: User | undefined;
    try {
      existingUser = await this.usersService.resendConfirmEmail({ email });
    } catch (error) {
      throw new UserInputError(error.message);
    }
    return existingUser;
  }

  @Mutation('confirmEmail')
  async confirmEmail(@Args('token') token: string): Promise<User> {
    let user: User | undefined;
    try {
      user = await this.usersService.verifyEmail(token);
    } catch (error) {
      throw new UserInputError(error.message);
    }
    return user;
  }

  @Mutation('updateUser')
  @AdminAllowedArgs(
    'username',
    'fieldsToUpdate.username',
    'fieldsToUpdate.email',
    'fieldsToUpdate.enabled',
  )
  @UseGuards(JwtAuthGuard, UsernameEmailAdminGuard)
  async updateUser(
    @Args('fieldsToUpdate')
    fieldsToUpdate: UpdateUserInput & {
      [fieldName: string]: boolean | string | UpdatePasswordInput;
    },
    @Context('req') request: RequestWithUser,
  ): Promise<User> {
    let user: UserDocument | undefined;
    let username: string;
    if (request.user) {
      username = request.user.username;
    } else {
      throw new ValidationError('Could not verify requesting user.');
    }
    try {
      user = await this.usersService.update(username, fieldsToUpdate);
    } catch (error) {
      throw new ValidationError(error.message);
    }
    if (!user) throw new UserInputError('The user does not exist');
    return user;
  }

  @Mutation('addAdminPermission')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async addAdminPermission(@Args('username') username: string): Promise<User> {
    const user = await this.usersService.addPermission('admin', username);
    if (!user) throw new UserInputError('The user does not exist');
    return user;
  }

  @Mutation('removeAdminPermission')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async removeAdminPermission(
    @Args('username') username: string,
  ): Promise<User> {
    const user = await this.usersService.removePermission('admin', username);
    if (!user) throw new UserInputError('The user does not exist');
    return user;
  }
}
