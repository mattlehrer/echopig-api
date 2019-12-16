import { Schema, Document, model } from 'mongoose';
import { Post } from '../../../graphql.classes';
import { isURL } from 'validator';
import * as autopopulate from 'mongoose-autopopulate';

function validateURL(url) {
  return isURL(url, {
    protocols: ['http', 'https'],
    // host_whitelist: [],
  });
}

interface PostDocument extends Post, Document {
  // Declaring everything that is not in the GraphQL Schema for a Post
}

const PostSchema: Schema = new Schema(
  {
    byUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    email: {
      fromAddress: String,
      subject: String,
      bodyHTML: String,
      bodyPlainText: String,
    },
    shareURL: {
      type: String,
      required: true,
      validate: { validator: validateURL },
    },
    comment: String,
    // episode: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'Episode',
    //   autopopulate: true,
    //   required: true,
    // },
    guid: String,
    enabled: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  },
);

PostSchema.plugin(autopopulate);

const PostModel = model<PostDocument>('Post', PostSchema);

export { PostDocument, PostSchema, PostModel };
