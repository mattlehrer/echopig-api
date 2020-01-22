import { Schema, model, Model, Document, Query } from 'mongoose';
import * as mongooseAlgolia from 'mongoose-algolia';
import { normalizeEmail, isEmail as validateEmail } from 'validator';
import * as bcrypt from 'bcrypt';
import { User, SocialToken } from 'src/graphql.classes';
import { ConfigService } from 'src/config/config.service';

const configService = new ConfigService(`${process.env.NODE_ENV}.env`);

export interface UserDocument extends User, Document {
  // Declaring everything that is not in the GraphQL Schema for a User
  password: string;
  normalizedUsername: string;
  normalizedEmail: string;
  tokens?: SocialToken[];

  /**
   * Checks if the user's password provided matches the user's password hash
   *
   * @param {string} password The password to attempt
   * @returns {Promise<boolean>} result of the match. Will throw an error if one exists from bcrypt
   */
  checkPassword(password: string): Promise<boolean>;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IUserModel extends Model<UserDocument> {
  /**
   * Uses the same method as the schema to validate an email. Matches HTML 5.2 spec.
   *
   * @param {string} email address to validate
   * @returns {boolean} if the email is valid
   * @memberof IUserModel
   */
  validateEmail(email: string): boolean;
}

// function validateEmail(email: string): boolean {
//   const expression = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
//   return expression.test(email);
// }

export const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      validate: { validator: validateEmail },
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    permissions: {
      type: [String],
      required: true,
    },
    normalizedUsername: {
      type: String,
      unique: true,
    },
    normalizedEmail: {
      type: String,
      unique: true,
    },
    isVerified: { type: Boolean, default: false },
    // passwordReset: PasswordResetTokenSchema,
    // signUp: SignupTokenSchema,
    enabled: {
      type: Boolean,
      default: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },

    name: String,
    postTag: { type: String, unique: true },
    saveTag: { type: String, unique: true },
    avatar: String,
    explicit: { type: Boolean, default: false },

    facebook: String,
    twitter: String,
    tokens: Array,
  },
  {
    timestamps: true,
  },
);

// NOTE: Arrow functions are not used here as we do not want to use lexical scope for 'this'
UserSchema.pre<UserDocument>('save', function(next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  user.normalizedUsername = user.username.toLowerCase();
  user.normalizedEmail = normalizeEmail(user.email) as string;

  // Make sure not to rehash the password if it is already hashed
  if (!user.isModified('password')) {
    return next();
  }

  // Generate a salt and use it to hash the user's password
  bcrypt.genSalt(10, (genSaltError, salt) => {
    if (genSaltError) {
      return next(genSaltError);
    }

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

UserSchema.pre<Query<UserDocument>>('findOneAndUpdate', function(next) {
  const updateFields = this.getUpdate();

  if (updateFields.username) {
    this.update(
      {},
      { $set: { normalizedUsername: updateFields.username.toLowerCase() } },
    );
  }

  if (updateFields.email) {
    this.update(
      {},
      { $set: { normalizedEmail: normalizeEmail(updateFields.email) } },
    );
  }

  // Generate a salt and use it to hash the user's password
  if (updateFields.password) {
    bcrypt.genSalt(10, (genSaltError, salt) => {
      if (genSaltError) {
        return next(genSaltError);
      }

      bcrypt.hash(updateFields.password, salt, (err, hash) => {
        if (err) {
          return next(err);
        }
        updateFields.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

UserSchema.methods.checkPassword = function(
  password: string,
): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (error, isMatch) => {
      if (error) {
        reject(error);
      }

      resolve(isMatch);
    });
  });
};

// Mongoose Static Method - added so a service can validate an email with the same criteria the schema is using
UserSchema.statics.validateEmail = function(email: string): boolean {
  return validateEmail(email);
};

UserSchema.plugin(mongooseAlgolia, {
  appId: configService.algoliaAppId,
  apiKey: configService.algoliaApiKey,
  indexName: `${configService.env}_USER`, //The name of the index in Algolia, you can also pass in a function
  selector: 'username name', //You can decide which field that are getting synced to Algolia (same as selector in mongoose)
  // populate: {
  //   path: 'podcast',
  //   select: 'title -_id',
  // },
  // defaults: {
  //   author: 'unknown',
  // },
  // mappings: {
  //   title: function(value) {
  //     return `Book: ${value}`;
  //   },
  // },
  // virtuals: {
  //   whatever: function(doc) {
  //     return `Custom data ${doc.title}`;
  //   },
  // },
  filter: function(doc: UserDocument) {
    return doc.enabled;
  },
  debug: configService.env === 'development', // Default: false -> If true operations are logged out in your console
});

export const UserModel: IUserModel = model<UserDocument, IUserModel>(
  'User',
  UserSchema,
);
