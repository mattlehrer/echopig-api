/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
export class CreatePostInput {
  byUser?: ObjectId;
  shareURL: string;
  enabled?: boolean;
  comment?: string;
}

export class CreateSocialUserInput {
  username: string;
  email?: string;
  facebook?: string;
  twitter?: string;
  tokens: SocialToken[];
  name?: string;
  avatar?: string;
}

export class CreateUserInput {
  username: string;
  email: string;
  password: string;
}

export class FbLoginInput {
  id: string;
  accessToken: string;
}

export class LoginUserInput {
  username?: string;
  email?: string;
  password: string;
}

export class SocialToken {
  kind: string;
  accessToken?: string;
  tokenSecret?: string;
  refreshToken?: string;
}

export class TwitterTokens {
  oauthToken: string;
  oauthTokenSecret: string;
}

export class UpdatePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export class UpdatePostInput {
  comment?: string;
  enabled?: boolean;
}

export class UpdateUserInput {
  username?: string;
  email?: string;
  name?: string;
  password?: UpdatePasswordInput;
  enabled?: boolean;
  avatar?: string;
  token?: SocialToken;
  facebook?: string;
  twitter?: string;
}

export class Episode {
  podcast?: ObjectId;
  title?: string;
  description?: string;
  image?: string;
  mp3URL: string;
  releaseDate?: Date;
  duration?: number;
  shareURLs?: string[];
  parentalRating?: string;
  _id: ObjectId;
  posts?: number;
}

export class Follow {
  user: ObjectId;
  target: ObjectId;
}

export class LoginResult {
  user: User;
  token: string;
}

export abstract class IMutation {
  abstract login(user: LoginUserInput): LoginResult | Promise<LoginResult>;

  abstract fbLogin(
    fbIdAndToken: FbLoginInput,
  ): LoginResult | Promise<LoginResult>;

  abstract twitterLogin(
    twitterTokens: TwitterTokens,
  ): LoginResult | Promise<LoginResult>;

  abstract createFollow(target: ObjectId): Follow | Promise<Follow>;

  abstract createPost(createPostInput: CreatePostInput): Post | Promise<Post>;

  abstract updatePost(
    postId: ObjectId,
    fieldsToUpdate: UpdatePostInput,
  ): Post | Promise<Post>;

  abstract deletePost(postId: ObjectId): ObjectId | Promise<ObjectId>;

  abstract createUser(createUserInput: CreateUserInput): User | Promise<User>;

  abstract createSocialUser(
    createSocialUserInput: CreateSocialUserInput,
  ): LoginResult | Promise<LoginResult>;

  abstract resendConfirmEmail(email?: string): User | Promise<User>;

  abstract confirmEmail(token?: string): User | Promise<User>;

  abstract updateUser(fieldsToUpdate: UpdateUserInput): User | Promise<User>;

  abstract addAdminPermission(username: string): User | Promise<User>;

  abstract removeAdminPermission(username: string): User | Promise<User>;

  abstract resetPassword(
    username: string,
    code: string,
    password: string,
  ): User | Promise<User>;
}

export class Podcast {
  iTunesID?: number;
  author?: string;
  title: string;
  collectionViewUrl?: string;
  feedUrl: string;
  artworkUrl30?: string;
  artworkUrl60?: string;
  artworkUrl100?: string;
  collectionExplicitness?: string;
  trackExplicitness?: string;
  country?: string;
  primaryGenreName?: string;
  contentAdvisoryRating?: string;
  artworkUrl600?: string;
  genreIds?: number[];
  genres?: string[];
  listenNotesID?: string;
  appURLs?: string[];
  _id: ObjectId;
  posts?: number;
  episodes?: Episode[];
}

export class Post {
  byUser: ObjectId;
  shareURL: string;
  comment?: string;
  episode?: ObjectId;
  createdAt: Date;
  updatedAt?: Date;
  enabled: boolean;
  _id: ObjectId;
}

export abstract class IQuery {
  abstract refreshToken(): string | Promise<string>;

  abstract episodes(podcast?: ObjectId): Episode[] | Promise<Episode[]>;

  abstract episode(episodeId?: ObjectId): Episode | Promise<Episode>;

  abstract follows(user?: ObjectId): Follow[] | Promise<Follow[]>;

  abstract podcasts(): Podcast[] | Promise<Podcast[]>;

  abstract podcastById(podcastId: ObjectId): Podcast | Promise<Podcast>;

  abstract podcast(iTunesId: number): Podcast | Promise<Podcast>;

  abstract genre(genre?: string): Podcast[] | Promise<Podcast[]>;

  abstract posts(byUser: ObjectId): Post[] | Promise<Post[]>;

  abstract post(post: ObjectId): Post | Promise<Post>;

  abstract mostPostedEpisodesInTimeframe(
    since?: Date,
    maxEpisodes?: number,
  ): Episode[] | Promise<Episode[]>;

  abstract mostPostedEpisodesInGenreInTimeframe(
    genre: string,
    since?: Date,
    maxEpisodes?: number,
  ): Episode[] | Promise<Episode[]>;

  abstract mostPostedPodcastsInTimeframe(
    since?: Date,
    maxPodcasts?: number,
  ): Podcast[] | Promise<Podcast[]>;

  abstract users(): User[] | Promise<User[]>;

  abstract user(username?: string): User | Promise<User>;

  abstract me(
    username?: string,
    email?: string,
    userId?: ObjectId,
  ): User | Promise<User>;

  abstract forgotPassword(email?: string): boolean | Promise<boolean>;
}

export class User {
  username: string;
  normalizedUsername?: string;
  email: string;
  name?: string;
  avatar?: string;
  explicit?: boolean;
  normalizedEmail?: string;
  permissions: string[];
  postTag: string;
  saveTag: string;
  createdAt: Date;
  updatedAt: Date;
  lastSeenAt: Date;
  enabled: boolean;
  isVerified: boolean;
  facebook?: string;
  twitter?: string;
  _id: ObjectId;
  posts?: Post[];
}

export type ObjectId = any;
