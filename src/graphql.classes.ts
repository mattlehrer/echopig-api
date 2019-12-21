/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
export class CreatePostInput {
  shareURL: string;
  comment?: string;
  byUser?: ObjectId;
  enabled?: boolean;
}

export class CreateUserInput {
  username: string;
  email: string;
  password: string;
}

export class LoginUserInput {
  username?: string;
  email?: string;
  password: string;
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
  password?: UpdatePasswordInput;
  enabled?: boolean;
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
}

export class LoginResult {
  user: User;
  token: string;
}

export abstract class IMutation {
  abstract createPost(createPostInput: CreatePostInput): Post | Promise<Post>;

  abstract updatePost(
    postId: ObjectId,
    fieldsToUpdate: UpdatePostInput,
  ): Post | Promise<Post>;

  abstract deletePost(postId: ObjectId): ObjectId | Promise<ObjectId>;

  abstract createUser(createUserInput?: CreateUserInput): User | Promise<User>;

  abstract updateUser(
    fieldsToUpdate: UpdateUserInput,
    username?: string,
  ): User | Promise<User>;

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
}

export class Post {
  byUser: ObjectId;
  shareURL: string;
  comment?: string;
  episode: ObjectId;
  createdAt: Date;
  updatedAt?: Date;
  enabled: boolean;
  _id: ObjectId;
}

export abstract class IQuery {
  abstract login(user: LoginUserInput): LoginResult | Promise<LoginResult>;

  abstract refreshToken(): string | Promise<string>;

  abstract episodes(podcast?: ObjectId): Episode[] | Promise<Episode[]>;

  abstract episode(episodeId?: ObjectId): Episode | Promise<Episode>;

  abstract podcast(podcastId?: ObjectId): Podcast | Promise<Podcast>;

  abstract genre(genre?: string): Podcast[] | Promise<Podcast[]>;

  abstract posts(byUser: ObjectId): Post[] | Promise<Post[]>;

  abstract post(post: ObjectId): Post | Promise<Post>;

  abstract users(): User[] | Promise<User[]>;

  abstract user(
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
  normalizedEmail?: string;
  permissions: string[];
  postTag: string;
  saveForLaterId: string;
  createdAt: Date;
  updatedAt: Date;
  lastSeenAt: Date;
  enabled: boolean;
  _id: ObjectId;
}

export type ObjectId = any;
