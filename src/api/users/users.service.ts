/* eslint-disable @typescript-eslint/camelcase */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { InjectEventEmitter } from 'nest-emitter';
import { normalizeEmail } from 'validator';
import { generate as generateId } from 'shortid';
import { UserDocument, UserModel } from './schemas/user.schema';
import {
  CreateUserInput,
  CreateSocialUserInput,
  UpdateUserInput,
  UpdatePasswordInput,
  ObjectId,
  LoginResult,
} from 'src/graphql.classes';
import { randomBytes } from 'crypto';
import { ConfigService } from 'src/config/config.service';
import { MongoError } from 'mongodb';
import { AuthService } from 'src/api/auth/auth.service';
import { UserEventEmitter } from './users.events';
import { EmailService } from 'src/utils/email/email.service';
import { Token } from '../@types/declarations';
import { PostsService } from '../posts/posts.service';
import { ModuleRef } from '@nestjs/core';
import { getFbProfile } from '../../utils/facebook.login';
import { getTwitterProfile } from '../../utils/twitter.login';

@Injectable()
export class UsersService implements OnModuleInit {
  private postsService: PostsService;
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    @InjectModel('PasswordResetToken') private readonly passwordResetTokenModel,
    @InjectModel('SignUpToken') private readonly signUpTokenModel,
    private configService: ConfigService,
    private authService: AuthService,
    private emailService: EmailService,
    private readonly moduleRef: ModuleRef,
    @InjectEventEmitter() private readonly emitter: UserEventEmitter,
  ) {}
  onModuleInit() {
    this.postsService = this.moduleRef.get(PostsService, {
      strict: false,
    });
  }

  /**
   * Returns if the user has 'admin' set on the permissions array
   *
   * @param {string[]} permissions permissions property on a User
   * @returns {boolean}
   * @memberof UsersService
   */
  isAdmin(permissions: string[]): boolean {
    return permissions.includes('admin');
  }

  /**
   * Adds any permission string to the user's permissions array property. Checks if that value exists
   * before adding it.
   *
   * @param {string} permission The permission to add to the user
   * @param {string} username The user's username
   * @returns {(Promise<UserDocument | undefined>)} The user Document with the updated permission. Undefined if the
   * user does not exist
   * @memberof UsersService
   */
  async addPermission(
    permission: string,
    username: string,
  ): Promise<UserDocument | undefined> {
    const user = await this.findOneByUsername(username);
    if (!user) return undefined;
    if (user.permissions.includes(permission)) return user;
    user.permissions.push(permission);
    await user.save();
    return user;
  }

  /**
   * Removes any permission string from the user's permissions array property.
   *
   * @param {string} permission The permission to remove from the user
   * @param {string} username The username of the user to remove the permission from
   * @returns {(Promise<UserDocument | undefined>)} Returns undefined if the user does not exist
   * @memberof UsersService
   */
  async removePermission(
    permission: string,
    username: string,
  ): Promise<UserDocument | undefined> {
    const user = await this.findOneByUsername(username);
    if (!user) return undefined;
    user.permissions = user.permissions.filter(
      userPermission => userPermission !== permission,
    );
    await user.save();
    return user;
  }

  /**
   * Updates a user in the database. If any value is invalid, it will still update the other
   * fields of the user.
   *
   * @param {string} username of the user to update
   * @param {UpdateUserInput} fieldsToUpdate The user can update their username, email, password, or enabled. If
   * the username is updated, the user's token will no longer work. If the user disables their account, only an admin
   * can reenable it
   * @returns {(Promise<UserDocument | undefined>)} Returns undefined if the user cannot be found
   * @memberof UsersService
   */
  async update(
    username: string,
    fieldsToUpdate: UpdateUserInput & {
      [fieldName: string]: boolean | string | UpdatePasswordInput;
    },
  ): Promise<UserDocument | undefined> {
    if (fieldsToUpdate.username) {
      const duplicateUser = await this.findOneByUsername(
        fieldsToUpdate.username,
      );
      if (duplicateUser) fieldsToUpdate.username = undefined;
    }

    if (fieldsToUpdate.email) {
      const duplicateUser = await this.findOneByEmail(fieldsToUpdate.email);
      const emailValid = UserModel.validateEmail(fieldsToUpdate.email);
      if (duplicateUser || !emailValid) fieldsToUpdate.email = undefined;
    }

    if (fieldsToUpdate.token) {
      const user = await this.findOneByUsername(username);
      if (!user) return undefined;
      if (user.tokens && user.tokens.length) {
        user.tokens = [...new Set([...user.tokens, fieldsToUpdate.token])];
      } else {
        user.tokens = [fieldsToUpdate.token];
      }
      await user.save();
      delete fieldsToUpdate.token;
    }

    const fields: {
      [fieldName: string]: boolean | string | UpdatePasswordInput;
    } = {};

    if (fieldsToUpdate.password) {
      if (
        await this.authService.validateUserByPassword({
          username,
          password: fieldsToUpdate.password.oldPassword,
        })
      ) {
        fields.password = fieldsToUpdate.password.newPassword;
      }
    }

    // Remove undefined keys for update
    for (const key in fieldsToUpdate) {
      if (typeof fieldsToUpdate[key] !== 'undefined' && key !== 'password') {
        fields[key] = fieldsToUpdate[key];
      }
    }

    let user: UserDocument | null = null;

    user = await this.userModel.findOneAndUpdate(
      { normalizedUsername: username.toLowerCase() },
      fields,
      { new: true, runValidators: true },
    );

    if (!user) return undefined;

    this.emitter.emit('updatedUser', user);

    return user;
  }

  /**
   * Send an email with a password reset code and sets the reset token and expiration on the user.
   * EMAIL_ENABLED must be true for this to run.
   *
   * @param {string} email address associated with an account to reset
   * @returns {Promise<boolean>} if an email was sent or not
   * @memberof UsersService
   */
  async forgotPassword(email: string): Promise<boolean> {
    if (!this.configService.emailEnabled) return false;

    const user = await this.findOneByEmail(email);
    if (!user) return false;
    if (!user.enabled) return false;

    const createdToken = new this.passwordResetTokenModel({
      token: randomBytes(32).toString('hex'),
      user: user._id,
    });

    let pwResetToken: Token | undefined;
    try {
      pwResetToken = await createdToken.save();
    } catch (error) {
      throw this.evaluateMongoError(error, createdToken);
    }

    return await this.emailService.sendWithTemplate({
      template: 'forgotPassword',
      to: user.email,
      variables: { token: pwResetToken.token, user },
    });
  }

  /**
   * Resets a password after the user forgot their password and requested a reset
   *
   * @param {string} username
   * @param {string} code the token set when the password reset email was sent out
   * @param {string} password the new password the user wants
   * @returns {(Promise<UserDocument | undefined>)} Returns undefined if the code or the username is wrong
   * @memberof UsersService
   */
  async resetPassword(
    username: string,
    code: string,
    password: string,
  ): Promise<UserDocument | undefined> {
    const user = await this.findOneByUsername(username);
    const token = await this.passwordResetTokenModel
      .findOne({ token: code })
      .exec();
    if (user && token && user.enabled !== false) {
      if (token.token === code) {
        user.password = password;
        await this.passwordResetTokenModel.remove({ token: code });
        await user.save();
        return user;
      }
    }
    return undefined;
  }

  /**
   * Creates a user
   *
   * @param {CreateUserInput} createUserInput username, email, and password. Username and email must be
   * unique, will throw an error with a description if either are duplicates
   * @returns {Promise<UserDocument>} or throws an error
   * @memberof UsersService
   */
  async create(
    createUserInput: CreateUserInput | CreateSocialUserInput,
  ): Promise<UserDocument> {
    const createdUser = new this.userModel({
      ...createUserInput,
      postTag: generateId(),
      saveTag: generateId(),
    });

    let user: UserDocument | undefined;
    try {
      user = await createdUser.save();
      Logger.log('Created new user:', UsersService.name);
      Logger.log(user, UsersService.name);
    } catch (error) {
      throw this.evaluateMongoError(error, createUserInput);
    }

    await this.resendConfirmEmail({ user });

    this.emitter.emit('newUser', user);

    return user;
  }

  async createSocial(
    createSocialUserInput: CreateSocialUserInput,
  ): Promise<UserDocument> {
    const { username, tokens } = createSocialUserInput;
    if (createSocialUserInput.facebook) {
      if (!(await this.authService.isValidFbToken(tokens[0].accessToken))) {
        Logger.debug('Invalid token', 'createSocial');
        return undefined;
      }

      return await this.findOrCreateOneByFbId({
        id: createSocialUserInput.facebook,
        token: tokens[0].accessToken,
        username,
      });
    } else {
      return await this.findOrCreateOneByTwitterId({
        tokens,
        username,
      });
    }
    return undefined;
  }

  async createSocialUserAndLogin(
    createSocialUserInput: CreateSocialUserInput,
  ): Promise<LoginResult | undefined> {
    const user = await this.createSocial(createSocialUserInput);
    if (!user) return undefined;
    const token = this.authService.createJwt(user).token;
    const result: LoginResult = {
      user,
      token,
    };
    user.lastSeenAt = new Date();
    user.save();
    return result;
  }

  async resendConfirmEmail({
    email = null,
    user = null,
  }): Promise<UserDocument | undefined> {
    if (email && !user) {
      user = await this.userModel
        .findOne({ normalizedEmail: normalizeEmail(email) })
        .exec();
    }
    if (!user || !user.enabled) throw new Error('No user found for that email');
    const createdToken = new this.signUpTokenModel({
      token: randomBytes(32).toString('hex'),
      user: user._id,
    });

    let signupToken: Token | undefined;
    try {
      signupToken = await createdToken.save();
    } catch (error) {
      throw this.evaluateMongoError(error, createdToken);
    }

    Logger.debug('sending email confirmation', UsersService.name);
    this.emailService.sendWithTemplate({
      template: 'signupToken',
      to: user,
      variables: { user, token: signupToken.token },
    });

    return user;
  }

  async verifyEmail(code: string): Promise<UserDocument | undefined> {
    Logger.debug(code, 'verifyEmail');
    const token = await this.signUpTokenModel.findOne({ token: code }).exec();
    if (!token) throw new Error('Token expired');
    const user = await this.findOneById(token.user);
    if (!user || !user.enabled) throw new Error('No user found for that token');
    if (user.isVerified) return user;
    user.isVerified = true;
    await user.save();
    await this.signUpTokenModel.deleteOne({ token: code });
    return user;
  }

  /**
   * Returns a user by their unique email address or undefined
   *
   * @param {string} email address of user, not case sensitive
   * @returns {(Promise<UserDocument | undefined>)}
   * @memberof UsersService
   */
  async findOneByEmail(email: string): Promise<UserDocument | undefined> {
    const user = await this.userModel
      .findOne({ normalizedEmail: normalizeEmail(email) })
      .exec();
    if (user) return user;
    return undefined;
  }

  async findOneByTag(postTag: string): Promise<UserDocument | undefined> {
    const user = await this.userModel
      .findOne({ postTag, enabled: true })
      .exec();
    if (user) return user;
    return undefined;
  }

  async findOneByTwitterId(id: string): Promise<UserDocument | undefined> {
    const user = await this.userModel
      .findOne({ twitter: id, enabled: true })
      .exec();
    if (user) return user;
    return undefined;
  }

  async findOrCreateOneByTwitterId({
    tokens,
    username,
  }): Promise<UserDocument | undefined> {
    Logger.debug('checking twitter profile', 'findOrCreateOneByTwitterId');
    Logger.debug(tokens, 'findOrCreateOneByTwitterId');
    const oauth = {
      consumer_key: this.configService.twitterConsumerKey,
      consumer_secret: this.configService.twitterConsumerSecret,
      token: tokens[0].accessToken,
      token_secret: tokens[0].tokenSecret,
    };
    const profile = await getTwitterProfile(oauth);
    const user = await this.findOneByTwitterId(profile.id);
    if (user) return user;

    // Logger.debug(profile, 'findOrCreateOneByTwitterId');
    let existingUser: UserDocument;
    if (profile.email) {
      try {
        existingUser = await this.findOneByEmail(profile.email);
      } catch (err) {
        throw err;
      }
    }

    if (existingUser) {
      existingUser.set({
        twitter: profile.id,
        name: existingUser.name ? existingUser.name : profile.name,
        avatar: existingUser.avatar ? existingUser.avatar : profile.avatar,
      });
      existingUser.tokens.push({
        kind: 'twitter',
        accessToken: tokens.oauthToken,
        tokenSecret: tokens.oauthTokenSecret,
      });
      try {
        await existingUser.save();
        return existingUser;
      } catch (err) {
        throw err;
      }
    }

    const newUser: CreateSocialUserInput = {
      username,
      email: profile.email,
      twitter: profile.id,
      tokens: [
        {
          kind: 'twitter',
          accessToken: tokens.oauthToken,
          tokenSecret: tokens.oauthTokenSecret,
        },
      ],
      name: profile.name,
      avatar: profile.avatar,
    };

    return await this.create(newUser);
  }

  async findOneByFbId(facebook): Promise<UserDocument | undefined> {
    const user = await this.userModel
      .findOne({ facebook, enabled: true })
      .exec();
    if (user) return user;
    return undefined;
  }

  async findOrCreateOneByFbId({
    id,
    token,
    username,
  }): Promise<UserDocument | undefined> {
    const user = await this.findOneByFbId(id);
    if (user) return user;

    // grab user info from graph api
    Logger.debug('checking fb profile', 'findOrCreateOneByFbId');
    const profile = await getFbProfile(id, token);
    Logger.debug(profile, 'findOrCreateOneByFbId');
    let existingUser: UserDocument;
    if (profile.email) {
      try {
        existingUser = await this.findOneByEmail(profile.email);
      } catch (err) {
        throw err;
      }
    }

    if (existingUser) {
      existingUser.set({
        facebook: id,
        name: existingUser.name ? existingUser.name : profile.name,
        avatar: existingUser.avatar ? existingUser.avatar : profile.avatar,
      });
      existingUser.tokens.push({ kind: 'facebook', accessToken: token });
      try {
        await existingUser.save();
        return existingUser;
      } catch (err) {
        throw err;
      }
    }

    const newUser: CreateSocialUserInput = {
      username,
      email: profile.email,
      facebook: id,
      tokens: [{ kind: 'facebook', accessToken: token }],
      name: profile.name,
      avatar: profile.avatar,
    };

    return await this.create(newUser);
  }

  /**
   * Returns a user by their unique username or undefined
   *
   * @param {string} username of user, not case sensitive
   * @returns {(Promise<UserDocument | undefined>)}
   * @memberof UsersService
   */
  async findOneByUsername(username: string): Promise<UserDocument | undefined> {
    const user = await this.userModel
      .findOne({ normalizedUsername: username.toLowerCase() })
      .exec();
    if (user) return user;
    return undefined;
  }

  async getProfile(username: string): Promise<UserDocument | undefined> {
    const user = await this.userModel
      .findOne(
        { normalizedUsername: username.toLowerCase(), enabled: true },
        'username name avatar createdAt',
      )
      .exec();
    Logger.debug(user);
    if (user) {
      const posts = await this.postsService.getAllPostsByUser(user._id);
      user.posts = posts;
      return user;
    }
    return undefined;
  }

  async findOneById(userId: ObjectId): Promise<UserDocument | undefined> {
    const user = await this.userModel.findById(userId).exec();
    if (user) return user;
    return undefined;
  }

  /**
   * Gets all the users that are registered
   *
   * @returns {Promise<UserDocument[]>}
   * @memberof UsersService
   */
  async getAllUsers(): Promise<UserDocument[]> {
    const users = await this.userModel.find().exec();
    return users;
  }

  /**
   * Deletes all the users in the database, used for testing
   *
   * @returns {Promise<void>}
   * @memberof UsersService
   */
  async deleteAllUsers(): Promise<void> {
    await this.userModel.deleteMany({});
  }

  // @TODO: disable User account and disable all posts

  /**
   * Reads a mongo database error and attempts to provide a better error message. If
   * it is unable to produce a better error message, returns the original error message.
   *
   * @private
   * @param {MongoError} error
   * @param {CreateUserInput} createUserInput
   * @returns {Error}
   * @memberof UsersService
   */
  private evaluateMongoError(
    error: MongoError,
    createUserInput: CreateUserInput | CreateSocialUserInput,
  ): Error {
    if (error.code === 11000) {
      if (
        error.message
          .toLowerCase()
          .includes(normalizeEmail(createUserInput.email) as string)
      ) {
        throw new Error(
          `e-mail ${createUserInput.email} is already registered`,
        );
      } else if (
        error.message
          .toLowerCase()
          .includes(createUserInput.username.toLowerCase())
      ) {
        throw new Error(
          `Username ${createUserInput.username} is already registered`,
        );
      }
    }
    throw new Error(error.message);
  }
}
