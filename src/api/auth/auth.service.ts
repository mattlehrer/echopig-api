/* eslint-disable @typescript-eslint/camelcase */
import { Injectable, forwardRef, Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as isEmail from 'validator/lib/isEmail';
import { UsersService } from 'src/api/users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginUserInput, User, LoginResult } from 'src/graphql.classes';
import { UserDocument } from 'src/api/users/schemas/user.schema';
import { ConfigService } from 'src/config/config.service';
import { isValidFbToken } from '../../utils/facebook.login';
import { getTwitterProfile } from '../../utils/twitter.login';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Checks if a user's password is valid
   *
   * @param {LoginUserInput} loginAttempt Include username or email. If both are provided only
   * username will be used. Password must be provided.
   * @returns {(Promise<LoginResult | undefined>)} returns the User and token if successful, undefined if not
   * @memberof AuthService
   */
  async validateUserByPassword(
    loginAttempt: LoginUserInput,
  ): Promise<LoginResult | undefined> {
    // This will be used for the initial login
    let userToAttempt: UserDocument | undefined;
    if (loginAttempt.email) {
      userToAttempt = await this.usersService.findOneByEmail(
        loginAttempt.email,
      );
    } else if (loginAttempt.username) {
      if (isEmail(loginAttempt.username)) {
        Logger.debug(loginAttempt.username, 'isEmail');
        userToAttempt = await this.usersService.findOneByEmail(
          loginAttempt.username,
        );
      } else {
        userToAttempt = await this.usersService.findOneByUsername(
          loginAttempt.username,
        );
      }
    }

    // If the user is not enabled, disable log in - the token wouldn't work anyways
    if (userToAttempt && userToAttempt.enabled === false)
      userToAttempt = undefined;

    if (!userToAttempt) return undefined;

    // Check the supplied password against the hash stored for this email address
    let isMatch = false;
    try {
      isMatch = await userToAttempt.checkPassword(loginAttempt.password);
    } catch (error) {
      return undefined;
    }

    if (isMatch) {
      // If there is a successful match, generate a JWT for the user
      const token = this.createJwt(userToAttempt).token;
      const result: LoginResult = {
        user: userToAttempt,
        token,
      };
      userToAttempt.lastSeenAt = new Date();
      userToAttempt.save();
      return result;
    }

    return undefined;
  }

  async validateUserByFbAccessToken(
    id: string,
    accessToken: string,
  ): Promise<LoginResult | undefined> {
    if (this.isValidFbToken(accessToken)) {
      const userToAttempt = await this.usersService.findOneByFbId(id);
      if (!userToAttempt) return undefined;
      const token = this.createJwt(userToAttempt).token;
      const result: LoginResult = {
        user: userToAttempt,
        token,
      };
      userToAttempt.lastSeenAt = new Date();
      userToAttempt.save();
      return result;
    }

    return undefined;
  }

  async validateUserByTwitterTokens(
    oauthToken: string,
    oauthTokenSecret: string,
  ): Promise<LoginResult | undefined> {
    const oauth = {
      consumer_key: this.configService.twitterConsumerKey,
      consumer_secret: this.configService.twitterConsumerSecret,
      token: oauthToken,
      token_secret: oauthTokenSecret,
    };
    const twitterProfile = await getTwitterProfile(oauth);
    if (twitterProfile && twitterProfile.id) {
      let userToAttempt = await this.usersService.findOneByTwitterId(
        twitterProfile.id,
      );
      if (twitterProfile.email) {
        userToAttempt = await this.usersService.findOneByEmail(
          twitterProfile.email,
        );
      }
      if (!userToAttempt) return undefined;
      const token = this.createJwt(userToAttempt).token;
      const result: LoginResult = {
        user: userToAttempt,
        token,
      };
      userToAttempt.lastSeenAt = new Date();
      userToAttempt.save();
      return result;
    }

    return undefined;
  }

  /**
   * Verifies that the JWT payload associated with a JWT is valid by making sure the user exists and is enabled
   *
   * @param {JwtPayload} payload
   * @returns {(Promise<UserDocument | undefined>)} returns undefined if there is no user or the account is not enabled
   * @memberof AuthService
   */
  async validateJwtPayload(
    payload: JwtPayload,
  ): Promise<UserDocument | undefined> {
    // This will be used when the user has already logged in and has a JWT
    const user = await this.usersService.findOneByUsername(payload.username);

    // Ensure the user exists and their account isn't disabled
    if (user && user.enabled) {
      user.lastSeenAt = new Date();
      user.save();
      return user;
    }

    return undefined;
  }

  /**
   * Creates a JwtPayload for the given User
   *
   * @param {User} user
   * @returns {{ data: JwtPayload; token: string }} The data contains the email, username, and expiration of the
   * token depending on the environment variable. Expiration could be undefined if there is none set. token is the
   * token created by signing the data.
   * @memberof AuthService
   */
  createJwt(user: User): { data: JwtPayload; token: string } {
    const expiresIn = this.configService.jwtExpiresIn;
    let expiration: Date | undefined;
    if (expiresIn) {
      expiration = new Date();
      expiration.setTime(expiration.getTime() + expiresIn * 1000);
    }
    const data: JwtPayload = {
      email: user.email,
      username: user.username,
      expiration,
    };

    const jwt = this.jwtService.sign(data);

    return {
      data,
      token: jwt,
    };
  }

  async isValidFbToken(token) {
    return await isValidFbToken(
      token,
      this.configService.fbAppToken,
      this.configService.fbAppId,
    );
  }
}
