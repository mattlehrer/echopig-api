import { Resolver, Args, Query, Context, Mutation } from '@nestjs/graphql';
import {
  LoginUserInput,
  LoginResult,
  FbLoginInput,
  TwitterTokens,
} from 'src/graphql.classes';
import { AuthService } from './auth.service';
import { AuthenticationError } from 'apollo-server-core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UserDocument } from 'src/api/users/schemas/user.schema';
import { RequestWithUser } from 'src/api/@types/declarations';

@Resolver('Auth')
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation('login')
  async login(@Args('user') user: LoginUserInput): Promise<LoginResult> {
    const result = await this.authService.validateUserByPassword(user);
    if (result) return result;
    throw new AuthenticationError(
      'Could not log-in with the provided credentials',
    );
  }

  @Mutation('fbLogin')
  async fbLogin(
    @Args('fbIdAndToken') fbIdAndToken: FbLoginInput,
  ): Promise<LoginResult> {
    const result = await this.authService.validateUserByFbAccessToken(
      fbIdAndToken.id,
      fbIdAndToken.accessToken,
    );
    return result;
  }

  @Mutation('twitterLogin')
  async twitterLogin(
    @Args('twitterTokens') twitterTokens: TwitterTokens,
  ): Promise<LoginResult> {
    const result = await this.authService.validateUserByTwitterTokens(
      twitterTokens.oauthToken,
      twitterTokens.oauthTokenSecret,
    );
    return result;
  }

  // There is no username guard here because if the person has the token, they can be any user
  @Query('refreshToken')
  @UseGuards(JwtAuthGuard)
  async refreshToken(
    @Context('req') request: RequestWithUser,
  ): Promise<string> {
    const user: UserDocument = request.user;
    if (!user)
      throw new AuthenticationError(
        'Could not log-in with the provided credentials',
      );
    const result = await this.authService.createJwt(user);
    if (result) return result.token;
    throw new AuthenticationError(
      'Could not log-in with the provided credentials',
    );
  }
}
