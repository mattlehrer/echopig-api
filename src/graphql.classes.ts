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

export class LoginResult {
  user: User;
  token: string;
}

export abstract class IMutation {
  abstract createPost(createPostInput?: CreatePostInput): Post | Promise<Post>;

  abstract updatePost(
    fieldsToUpdate: UpdatePostInput,
    post?: string,
  ): Post | Promise<Post>;

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

export class Post {
  byUser: string;
  shareURL: string;
  comment?: string;
  episode?: string;
  createdAt?: Date;
  updatedAt?: Date;
  enabled: boolean;
  _id: ObjectId;
}

export abstract class IQuery {
  abstract login(user: LoginUserInput): LoginResult | Promise<LoginResult>;

  abstract refreshToken(): string | Promise<string>;

  abstract posts(byUser?: ObjectId): Post[] | Promise<Post[]>;

  abstract post(post?: ObjectId): Post | Promise<Post>;

  abstract users(): User[] | Promise<User[]>;

  abstract user(username?: string, email?: string): User | Promise<User>;

  abstract forgotPassword(email?: string): boolean | Promise<boolean>;
}

export class User {
  username: string;
  email: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  lastSeenAt: Date;
  posts: ObjectId[];
  enabled: boolean;
  _id: ObjectId;
}

export type ObjectId = any;
